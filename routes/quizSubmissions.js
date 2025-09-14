const express = require("express");
const pool = require("../db");

const router = express.Router();

// Get highest submission for dynamic quiz
router.get("/dynamic/highest/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT Score, Attempt, SubmittedAt
       FROM QuizSubmissions
       WHERE UserId = ? 
       ORDER BY Score DESC, SubmittedAt ASC
       LIMIT 1`,
      [userId]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error("Error fetching highest dynamic quiz submission:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get highest submission for fixed quiz (module 2)
router.get("/fixed/highest/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT Score, Attempt, SubmittedAt
       FROM QuizSubmissions
       WHERE UserId = ? AND ModuleId = 2
       ORDER BY Score DESC, SubmittedAt ASC
       LIMIT 1`,
      [userId]
    );

    res.json(rows[0] || null);
  } catch (err) {
    console.error("Error fetching highest fixed quiz submission:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
