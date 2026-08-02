import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import geminiRouter from "../src/server/routes/gemini";
import analyticsRouter from "../src/server/routes/analytics";
import lessonsRouter from "../src/server/routes/lessons";
import classroomRouter from "../src/server/routes/classroom";
import avatarRouter from "../src/server/routes/avatar";
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
  app.use("/api/avatar", avatarRouter);
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

test("GET /api/avatar/catalog returns cosmetic items catalog", async () => {
  const app = createTestApp();
  const server = app.listen(0);
  const address = server.address() as { port: number };

  try {
    const res = await fetch(`http://localhost:${address.port}/api/avatar/catalog`);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(Array.isArray(data.data), true);
  } finally {
    server.close();
  }
});
