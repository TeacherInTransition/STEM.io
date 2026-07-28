import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { listCourses, listCourseWork, createCourseWork } from "../../lib/classroom";

const router = Router();

function getBearerToken(req: Request): string {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error: any = new Error("Missing or invalid Authorization header");
    error.statusCode = 401;
    error.code = "UNAUTHORIZED";
    throw error;
  }
  return authHeader.substring(7);
}

router.get("/courses", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getBearerToken(req);
    const courses = await listCourses(token);
    res.json({ success: true, data: { courses } });
  } catch (error) {
    next(error);
  }
});

router.get("/courses/:courseId/coursework", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getBearerToken(req);
    const courseId = req.params.courseId;
    const courseWork = await listCourseWork(token, courseId);
    res.json({ success: true, data: { courseWork } });
  } catch (error) {
    next(error);
  }
});

const CreateAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

router.post("/courses/:courseId/coursework", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getBearerToken(req);
    const courseId = req.params.courseId;
    const body = CreateAssignmentSchema.parse(req.body);

    const assignment = await createCourseWork(token, courseId, body);
    res.json({ success: true, data: { assignment } });
  } catch (error) {
    next(error);
  }
});

export default router;
