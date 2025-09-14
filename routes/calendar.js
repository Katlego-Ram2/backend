const express = require("express");
const pool = require("../db"); // Adjust path as needed

const router = express.Router();

router.get("/assignments", async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT Title, DueDate FROM Assignments
    `);

    // Format dates as YYYY-MM-DD
    const assignments = results.map((row) => ({
      title: row.Title,
      dueDate: new Date(row.DueDate).toISOString().split("T")[0],
    }));

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
