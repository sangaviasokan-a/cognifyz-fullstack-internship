const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { cacheMiddleware, invalidate } = require("../middleware/cache");
const { notifyTaskCreated } = require("../middleware/jobQueue");

const router = express.Router();

// Every route below requires a logged-in user (Task 6: authorization checks)
router.use(requireAuth);

// ---- Task 5: RESTful CRUD endpoints ----

// READ (list) - cached for 5s per-user (Task 8)
router.get("/", cacheMiddleware(5000), (req, res) => {
  const tasks = db
    .findAll("tasks")
    .filter((t) => t.userId === req.session.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(tasks);
});

// CREATE
router.post("/", (req, res) => {
  const { title, priority } = req.body;

  // Task 2/4: server-side validation
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: "Task title is required." });
  }
  if (title.trim().length > 140) {
    return res.status(400).json({ error: "Task title must be under 140 characters." });
  }
  const allowedPriorities = ["low", "medium", "high"];
  const safePriority = allowedPriorities.includes(priority) ? priority : "medium";

  const task = db.insert("tasks", {
    userId: req.session.userId,
    title: title.trim(),
    priority: safePriority,
    completed: false,
  });

  invalidate("/api/tasks"); // Task 8: cache invalidation on mutation
  notifyTaskCreated(task); // Task 8: background job

  res.status(201).json(task);
});

// UPDATE
router.put("/:id", (req, res) => {
  const existing = db.findOne("tasks", (t) => t.id === req.params.id && t.userId === req.session.userId);
  if (!existing) return res.status(404).json({ error: "Task not found." });

  const changes = {};
  if (typeof req.body.title === "string") {
    if (!req.body.title.trim()) return res.status(400).json({ error: "Title cannot be empty." });
    changes.title = req.body.title.trim();
  }
  if (typeof req.body.completed === "boolean") changes.completed = req.body.completed;
  if (["low", "medium", "high"].includes(req.body.priority)) changes.priority = req.body.priority;

  const updated = db.update("tasks", req.params.id, changes);
  invalidate("/api/tasks");
  res.json(updated);
});

// DELETE
router.delete("/:id", (req, res) => {
  const existing = db.findOne("tasks", (t) => t.id === req.params.id && t.userId === req.session.userId);
  if (!existing) return res.status(404).json({ error: "Task not found." });

  db.remove("tasks", req.params.id);
  invalidate("/api/tasks");
  res.status(204).end();
});

module.exports = router;
