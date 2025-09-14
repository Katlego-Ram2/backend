const express = require("express");
const pool = require("../db");

const router = express.Router();

// ✅ Get questions only for ModuleId = 2
router.get("/", async (req, res) => {
  try {
    const [questions] = await pool.query(
      "SELECT * FROM Questions WHERE ModuleId = 2"
    );
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching fixed quiz questions" });
  }
});

// ✅ Get attempts for ModuleId = 2 quiz
router.get("/attempts/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS attempts FROM QuizSubmissions WHERE UserId = ? AND ModuleId = 2",
      [userId]
    );
    res.json({ attempts: rows[0].attempts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching attempts" });
  }
});

// ✅ Submit quiz score for ModuleId = 2
router.post("/submit", async (req, res) => {
  const { userId, score } = req.body;
  try {
    // check attempts
    const [countRows] = await pool.query(
      "SELECT COUNT(*) AS attempts FROM QuizSubmissions WHERE UserId = ? AND ModuleId = 2",
      [userId]
    );
    const attempts = countRows[0].attempts;

    if (attempts >= 3) {
      return res.status(403).json({ message: "Maximum attempts reached" });
    }

    // save submission
    await pool.query(
      "INSERT INTO QuizSubmissions (UserId, Score, ModuleId) VALUES (?, ?, 2)",
      [userId, score]
    );

    res.json({ message: "Quiz submitted successfully", attempt: attempts + 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting quiz" });
  }
});

module.exports = router;
