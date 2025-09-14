// routes/submitAssignment.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../db");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads/submissions");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// PDF filter
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

// POST /sub/submit
router.post("/sub/submit", upload.single("file"), async (req, res) => {
  try {
    const { assignmentId, userId } = req.body;

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    if (!assignmentId || !userId)
      return res.status(400).json({ message: "Missing assignmentId or userId" });

    // Check if already submitted
    const [existing] = await pool.query(
      "SELECT SubmissionId FROM Submissions WHERE AssignmentId = ? AND StudentNumber = ?",
      [assignmentId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "You already submitted this assignment" });
    }

    // Save submission
    const filePath = `/uploads/submissions/${req.file.filename}`;
    const submittedAt = new Date();

    await pool.query(
      "INSERT INTO Submissions (AssignmentId, StudentNumber, FilePath, SubmittedAt, Grade, Feedback) VALUES (?, ?, ?, ?, '', '')",
      [assignmentId, userId, filePath, submittedAt]
    );

    res.status(201).json({
      message: "Assignment submitted successfully",
      filePath,
    });

  } catch (err) {
    console.error("Submission error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /sub/status/:userId/:assignmentId
router.get("/sub/status/:userId/:assignmentId", async (req, res) => {
  try {
    const { userId, assignmentId } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM Submissions WHERE AssignmentId = ? AND StudentNumber = ?",
      [assignmentId, userId]
    );

    if (rows.length > 0) {
      return res.json({ submitted: true, data: rows[0] });
    }

    res.json({ submitted: false });
  } catch (err) {
    console.error("Status check error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
