import { Router, Request, Response, NextFunction } from "express";

const router = Router();

router.get("/teacher", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const analyticsData = {
      activeStudents: 42,
      totalQuizzesCompleted: 184,
      avgCompletionRate: "88%",
      topModules: [
        { name: "AI Foundations & Ethics", completedCount: 38 },
        { name: "Prompt Engineering Essentials", completedCount: 32 },
        { name: "Cybersecurity & Neural Nets", completedCount: 29 },
      ],
      recentActivity: [
        { student: "Cadet Alex", module: "AI Foundations", score: "100%", time: "10 mins ago" },
        { student: "Cadet Jordan", module: "Prompt Engineering", score: "90%", time: "25 mins ago" },
      ],
    };

    res.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
