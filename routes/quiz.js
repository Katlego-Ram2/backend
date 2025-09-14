const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET quiz questions for a specific user based on their modules
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // 1️⃣ Get user row
    const [userRows] = await pool.query(
      "SELECT Modules FROM Users WHERE UserId = ?",
      [userId]
    );
    if (userRows.length === 0) return res.status(404).json({ message: "User not found" });

    const user = userRows[0];
    if (!user.Modules) return res.json([]);

    // 2️⃣ Get module names from user's Modules column
    const userModuleNames = user.Modules.split(",").map((m) => m.trim());

    // 3️⃣ Get ModuleIds matching these names
    const [modules] = await pool.query(
      "SELECT ModuleId, ModuleName FROM Modules WHERE ModuleName IN (?)",
      [userModuleNames]
    );
    if (modules.length === 0) return res.json([]);
    const moduleIds = modules.map((m) => m.ModuleId);

    // 4️⃣ Get questions for these ModuleIds
    const [questions] = await pool.query(
      "SELECT * FROM Questions WHERE ModuleId IN (?)",
      [moduleIds]
    );

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching quiz questions" });
  }
});

// GET attempts for a user
router.get("/attempts/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS attempts FROM QuizSubmissions WHERE UserId = ?",
      [userId]
    );
    res.json({ attempts: rows[0].attempts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching attempts" });
  }
});

// POST submit quiz score
router.post("/submit", async (req, res) => {
  const { userId, score } = req.body;
  try {
    const [countRows] = await pool.query(
      "SELECT COUNT(*) AS attempts FROM QuizSubmissions WHERE UserId = ?",
      [userId]
    );
    const attempts = countRows[0].attempts;
    if (attempts >= 3) return res.status(403).json({ message: "Maximum attempts reached" });

    await pool.query(
      "INSERT INTO QuizSubmissions (UserId, Score) VALUES (?, ?)",
      [userId, score]
    );

    res.json({ message: "Quiz submitted successfully", attempt: attempts + 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting quiz" });
  }
});
// GET highest mark for a user
router.get("/grades/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT MAX(Score) AS highestScore FROM QuizSubmissions WHERE UserId = ?",
      [userId]
    );

    if (!rows || rows.length === 0 || rows[0].highestScore === null) {
      return res.json({ highestScore: null, message: "No grades found" });
    }

    res.json({ highestScore: rows[0].highestScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching grade" });
  }
});

module.exports = router;
