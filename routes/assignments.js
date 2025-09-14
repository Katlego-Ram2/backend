const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../db");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/assignments");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// GET modules
router.get("/modules", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT ModuleId, ModuleName FROM Modules");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch modules" });
  }
});

// GET assignments
router.get("/assignments", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.AssignmentId, a.Title, a.Description, a.FilePath, a.DueDate, m.ModuleName
      FROM Assignments a
      JOIN Modules m ON a.ModuleId = m.ModuleId
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
});

// POST upload
router.post("/assignments/upload", upload.single("file"), async (req, res) => {
  const { title, description, moduleName, dueDate } = req.body;
  const filePath = req.file ? `/uploads/assignments/${req.file.filename}` : null;

  if (!title || !description || !moduleName || !dueDate || !filePath) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const [[module]] = await pool.query("SELECT ModuleId FROM Modules WHERE ModuleName = ?", [moduleName]);
    if (!module) return res.status(400).json({ message: "Invalid module name." });

    const moduleId = module.ModuleId;
    await pool.query(
      "INSERT INTO Assignments (Title, Description, FilePath, ModuleId, DueDate) VALUES (?, ?, ?, ?, ?)",
      [title, description, filePath, moduleId, dueDate]
    );
    res.status(201).json({ message: "Assignment uploaded" });
  } catch (err) {
    console.error("Error uploading:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// ✅ DELETE assignment
router.delete("/assignments/:id", async (req, res) => {
  const assignmentId = req.params.id;
  try {
    const [[assignment]] = await pool.query("SELECT FilePath FROM Assignments WHERE AssignmentId = ?", [assignmentId]);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const filePath = path.join(__dirname, "..", assignment.FilePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query("DELETE FROM Assignments WHERE AssignmentId = ?", [assignmentId]);
    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    console.error("Error deleting:", err);
    res.status(500).json({ message: "Failed to delete assignment" });
  }
});

module.exports = router;
