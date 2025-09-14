const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../db"); // adjust to your db connection

// PDF Upload Settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/assignments"); // create folder if not exists
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// POST /api/assignments/submit
router.post("/submit", upload.single("file"), async (req, res) => {
  const { userId, assignmentId, dueDate } = req.body;
  if (!userId || !assignmentId || !req.file) {
    return res.status(400).json({ message: "Missing data or file" });
  }

  try {
    // Save submission in DB
    await db.query(
      "INSERT INTO submissions (UserId, AssignmentId, FilePath, SubmittedAt) VALUES (?, ?, ?, NOW())",
      [userId, assignmentId, req.file.path]
    );

    res.json({ message: "Submission successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
