import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";

const router = Router();

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const GenerateSchema = z.object({
  prompt: z.string().min(1, "Prompt must not be empty").max(10000, "Prompt is too long"),
  model: z.string().optional().default("gemini-1.5-flash"),
});

router.post("/generate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, model } = GenerateSchema.parse(req.body);

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    res.json({
      success: true,
      data: {
        result: response.text,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
