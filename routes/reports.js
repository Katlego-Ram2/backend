// routes/reports.js
const express = require("express");
const router = express.Router();
const pool = require("../db"); // adjust path if needed

// GET all submissions
router.get("/submissions", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT SubmissionId, AssignmentId, StudentNumber, FilePath, SubmittedAt, Grade, Feedback
      FROM Submissions
      ORDER BY SubmittedAt DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});



module.exports = router;
