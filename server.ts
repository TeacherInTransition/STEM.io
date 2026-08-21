import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, arrayUnion,
} from "firebase/firestore";
import { db } from "./src/lib/firebase";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not configured");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  try {
    const app = express();
    const PORT = 3000;

    app.use(express.json());

    // Health check endpoint
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok" });
    });

    // ── Virtual Classroom Roster API ────────────────────────────────────
    // Firestore: classes/{classId} (see src/types.ts VirtualClassroom)

    const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/1/0

    function generateJoinCode(): string {
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
      }
      return code;
    }

    function isValidId(v: unknown): v is string {
      return typeof v === "string" && v.length > 0 && v.length <= 128;
    }

    function isNonEmptyString(v: unknown, max: number): v is string {
      return typeof v === "string" && v.trim().length > 0 && v.length <= max;
    }

    function classDocRef(classId: string) {
      return doc(db, "classes", classId);
    }

    // POST /api/classes — teacher creates a class; server mints the join code
    app.post("/api/classes", async (req, res) => {
      try {
        const { name, teacherId, googleClassroomCourseId } = req.body ?? {};
        if (!isNonEmptyString(name, 200)) {
          res.status(400).json({ error: "name is required (max 200 chars)" });
          return;
        }
        if (!isValidId(teacherId)) {
          res.status(400).json({ error: "teacherId is required" });
          return;
        }

        // ponytail: retry loop, max 5 attempts; collision chance ~0 for 32-char alphabet
        let joinCode = "";
        for (let attempt = 0; attempt < 5; attempt++) {
          joinCode = generateJoinCode();
          const existing = await getDocs(
            query(collection(db, "classes"), where("joinCode", "==", joinCode))
          );
          if (existing.empty) break;
        }

        const classId = doc(collection(db, "classes")).id;
        const cls = {
          classId,
          name: name.trim(),
          joinCode,
          teacherId,
          googleClassroomCourseId: googleClassroomCourseId ?? null,
          studentIds: [] as string[],
          createdAt: new Date().toISOString(),
        };
        await setDoc(classDocRef(classId), cls);
        res.json({ success: true, data: cls });
      } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to create class" });
      }
    });

    // POST /api/classes/join — student joins by code; UID appended via arrayUnion
    app.post("/api/classes/join", async (req, res) => {
      try {
        const { joinCode, studentId } = req.body ?? {};
        if (!isNonEmptyString(joinCode, 32) || !isValidId(studentId)) {
          res.status(400).json({ error: "joinCode and studentId are required" });
          return;
        }

        const code = joinCode.trim().toUpperCase();
        const matches = await getDocs(
          query(collection(db, "classes"), where("joinCode", "==", code))
        );
        if (matches.empty) {
          res.status(404).json({ error: "Class not found for that join code" });
          return;
        }

        const ref = doc(db, "classes", matches.docs[0].id);
        const snap = await getDoc(ref);
        const alreadyJoined = ((snap.data() as any)?.studentIds ?? []).includes(studentId);

        if (!alreadyJoined) {
          await updateDoc(ref, { studentIds: arrayUnion(studentId) });
        }
        const updated = await getDoc(ref);
        res.json({ success: true, data: updated.data(), alreadyJoined });
      } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to join class" });
      }
    });

    // GET /api/classes/:classId — roster with per-student progress
    app.get("/api/classes/:classId", async (req, res) => {
      try {
        const { classId } = req.params;
        if (!isValidId(classId)) {
          res.status(400).json({ error: "invalid classId" });
          return;
        }
        const snap = await getDoc(classDocRef(classId));
        if (!snap.exists()) {
          res.status(404).json({ error: "Class not found" });
          return;
        }

        const cls = snap.data() as any;
        // ponytail: N+1 reads; batch with getAll when rosters grow past ~50
        const roster = await Promise.all(
          (cls.studentIds ?? []).map(async (uid: string) => {
            const userSnap = await getDoc(doc(db, "users", uid));
            // completedQuizzes lives on the user doc (mirrors users/{uid}/completions
            // subcollection without needing those rules deployed)
            const completed: string[] = userSnap.exists()
              ? (userSnap.data() as any).completedQuizzes ?? []
              : [];
            return {
              studentId: uid,
              name: userSnap.exists() ? (userSnap.data() as any).name ?? uid : uid,
              completedUnits: completed,
              completionCount: completed.length,
            };
          })
        );

        res.json({ success: true, data: { ...cls, roster } });
      } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to load class" });
      }
    });

    // API routes FIRST
    app.post("/api/gemini/generate", async (req, res) => {
      try {
        const { prompt } = req.body;
        if (!prompt) {
          res.status(400).json({ error: "Prompt is required" });
          return;
        }
        
        const ai = getAIClient();
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        res.json({ result: response.text });
      } catch (error: any) {
        console.error("Error calling Gemini:", error);
        res.status(500).json({ error: error.message || "Failed to generate content" });
      }
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
