import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";

const router = Router();

const lessonStore = new Map<string, any>();

const SyncLessonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subject: z.string().optional(),
  content: z.record(z.string(), z.any()).or(z.string()),
  updatedAt: z.string().optional(),
});

router.post("/sync", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = SyncLessonSchema.parse(req.body);
    const updatedPayload = { ...payload, updatedAt: new Date().toISOString() };
    lessonStore.set(payload.id, updatedPayload);

    res.json({
      success: true,
      data: {
        message: "Lesson state synced successfully",
        lesson: updatedPayload,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const lesson = lessonStore.get(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: {
          code: "LESSON_NOT_FOUND",
          message: `No lesson found with id: ${id}`,
        },
      });
    }

    res.json({
      success: true,
      data: { lesson },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
