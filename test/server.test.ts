import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import geminiRouter from "../src/server/routes/gemini";
import analyticsRouter from "../src/server/routes/analytics";
import lessonsRouter from "../src/server/routes/lessons";
import classroomRouter from "../src/server/routes/classroom";
import { errorHandler } from "../src/server/middleware/errorHandler";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.get("/api/health", (req, res) => {
    res.json({ success: true, status: "healthy", timestamp: new Date().toISOString() });
  });
  app.use("/api/gemini", geminiRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/lessons", lessonsRouter);
  app.use("/api/classroom", classroomRouter);
  app.use(errorHandler);
  return app;
}

test("GET /api/health returns 200 and success status", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const address = server.address() as { port: number };

  try {
    const res = await fetch(`http://localhost:${address.port}/api/health`);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.status, "healthy");
  } finally {
    server.close();
  }
});

test("GET /api/analytics/teacher returns aggregated data", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const address = server.address() as { port: number };

  try {
    const res = await fetch(`http://localhost:${address.port}/api/analytics/teacher`);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(typeof data.data.activeStudents, "number");
  } finally {
    server.close();
  }
});

test("POST /api/lessons/sync stores and retrieves lesson state", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const address = server.address() as { port: number };

  try {
    const lessonPayload = {
      id: "lesson_test_101",
      title: "Introduction to Neural Networks",
      subject: "AI Foundations",
      content: { modules: ["Overview", "Perceptrons", "Backprop"] },
    };

    const syncRes = await fetch(`http://localhost:${address.port}/api/lessons/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lessonPayload),
    });
    const syncData = await syncRes.json();

    assert.equal(syncRes.status, 200);
    assert.equal(syncData.success, true);

    const getRes = await fetch(`http://localhost:${address.port}/api/lessons/lesson_test_101`);
    const getData = await getRes.json();

    assert.equal(getRes.status, 200);
    assert.equal(getData.success, true);
    assert.equal(getData.data.lesson.title, "Introduction to Neural Networks");
  } finally {
    server.close();
  }
});

test("GET /api/classroom/courses rejects unauthenticated requests", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const address = server.address() as { port: number };

  try {
    const res = await fetch(`http://localhost:${address.port}/api/classroom/courses`);
    const data = await res.json();

    assert.equal(res.status, 401);
    assert.equal(data.success, false);
    assert.equal(data.error.code, "UNAUTHORIZED");
  } finally {
    server.close();
  }
});
