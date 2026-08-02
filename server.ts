import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { env } from "./src/server/config/env";
import geminiRouter from "./src/server/routes/gemini";
import analyticsRouter from "./src/server/routes/analytics";
import lessonsRouter from "./src/server/routes/lessons";
import classroomRouter from "./src/server/routes/classroom";
import avatarRouter from "./src/server/routes/avatar";
import { errorHandler } from "./src/server/middleware/errorHandler";

async function startServer() {
  const app = express();
  const PORT = parseInt(env.PORT, 10) || 3000;

  app.use(express.json());

  // API Routes
  app.use("/api/gemini", geminiRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/lessons", lessonsRouter);
  app.use("/api/classroom", classroomRouter);
  app.use("/api/avatar", avatarRouter);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ success: true, status: "healthy", timestamp: new Date().toISOString() });
  });

  // Global Error Handler for API routes
  app.use(errorHandler);

  // Vite middleware for development vs static build for production
  if (env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`STEM.io Server running on http://localhost:${PORT}`);
  });
}

startServer();
