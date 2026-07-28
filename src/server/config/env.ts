import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  GEMINI_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
