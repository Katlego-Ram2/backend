const express = require("express");
const pool = require("../db");

const router = express.Router();

// 1️⃣ Get all submissions
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT SubmissionId, AssignmentId, StudentNumber, FilePath, SubmittedAt, Grade, Feedback FROM Submissions ORDER BY SubmittedAt DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching submissions" });
  }
});

// 2️⃣ Get paginated grades table
router.get("/grades", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  try {
    const [countRows] = await pool.query("SELECT COUNT(*) AS count FROM Submissions");
    const totalRows = countRows[0].count;
    const totalPages = Math.ceil(totalRows / limit);

    const [rows] = await pool.query(
      "SELECT SubmissionId, AssignmentId, StudentNumber, FilePath, SubmittedAt, Grade, Feedback FROM Submissions ORDER BY SubmittedAt DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    res.json({ data: rows, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching grades" });
  }
});

// 3️⃣ Update grade & feedback
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { Grade, Feedback } = req.body;

  try {
    await pool.query(
      "UPDATE Submissions SET Grade = ?, Feedback = ? WHERE SubmissionId = ?",
      [Grade, Feedback, id]
    );
    res.json({ message: "Grade & feedback updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating grade & feedback" });
  }
});

module.exports = router;
