// routes/quizSubmit.js
const express = require("express");
const pool = require("../db");
const router = express.Router();

// POST /api/quiz/submit
router.post("/submit", async (req, res) => {
  const { userId, score } = req.body;

  if (!userId || score === undefined) {
    return res.status(400).json({ message: "userId and score are required" });
  }

  try {
    // Create table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS QuizSubmissions (
        SubmissionId INT AUTO_INCREMENT PRIMARY KEY,
        UserId INT NOT NULL,
        Score INT NOT NULL,
        Attempt INT NOT NULL,
        SubmittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get how many previous attempts the user has
    const [attemptRows] = await pool.query(
      "SELECT COUNT(*) AS attempts FROM QuizSubmissions WHERE UserId = ?",
      [userId]
    );

    const attemptNumber = attemptRows[0].attempts + 1;

    if (attemptNumber > 3) {
      return res.status(403).json({ message: "Maximum 3 attempts allowed" });
    }

    // Insert the submission
    await pool.query(
      "INSERT INTO QuizSubmissions (UserId, Score, Attempt) VALUES (?, ?, ?)",
      [userId, score, attemptNumber]
    );

    res.json({ message: "Quiz submitted successfully", attempt: attemptNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting quiz" });
  }
});

module.exports = router;
