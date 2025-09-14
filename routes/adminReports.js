const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/admin/quiz-marks?page=1&limit=5&search=optional
router.get("/quiz-marks", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search ? `%${req.query.search}%` : "%";
    const offset = (page - 1) * limit;

    // Subquery: highest score per user
    const [rows] = await pool.query(
      `
      SELECT 
        qs.UserId,
        s.StudentNumber,
        qs.Score AS RawScore,
         LEAST(ROUND((Score / 29) * 100, 2), 100) AS Percentage,
        qs.SubmissionId,
        qs.Attempt,
        qs.SubmittedAt
      FROM QuizSubmissions qs
      JOIN Students s ON qs.UserId = s.UserId
      INNER JOIN (
        SELECT UserId, MAX(Score) AS MaxScore
        FROM QuizSubmissions
        GROUP BY UserId
      ) AS max_scores 
        ON qs.UserId = max_scores.UserId AND qs.Score = max_scores.MaxScore
      WHERE s.StudentNumber LIKE ?
      ORDER BY s.StudentNumber ASC
      LIMIT ? OFFSET ?
      `,
      [search, limit, offset]
    );

    // Total count of unique users (for pagination)
    const [[{ count }]] = await pool.query(
      `
      SELECT COUNT(*) AS count
      FROM Students s
      JOIN (
        SELECT UserId, MAX(Score) AS MaxScore
        FROM QuizSubmissions
        GROUP BY UserId
      ) AS max_scores 
        ON s.UserId = max_scores.UserId
      WHERE s.StudentNumber LIKE ?
      `,
      [search]
    );

    res.json({
      data: rows,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    console.error("Error fetching quiz marks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
