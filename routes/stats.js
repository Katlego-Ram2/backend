const express = require("express");
const router = express.Router();
const db = require("../db"); // adjust path to your DB connection

router.get("/stats", async (req, res) => {
  try {
    const [[{ totalStudents }]] = await db.query(`
      SELECT COUNT(*) AS totalStudents FROM Students
    `);

    const [[{ paidStudents }]] = await db.query(`
      SELECT COUNT(*) AS paidStudents FROM Students WHERE PaymentStatus = 1
    `);

    const [[{ fundedStudents }]] = await db.query(`
      SELECT COUNT(*) AS fundedStudents FROM Students WHERE PaymentStatus = 2
    `);

    // const [perModule] = await db.query(`
    //   SELECT m.ModuleName, COUNT(s.StudentId) AS StudentCount
    //   FROM Modules m
    //   LEFT JOIN Students s ON m.ModuleId = s.ModuleId AND s.PaymentStatus = 1
    //   GROUP BY m.ModuleId, m.ModuleName
    // `);

    res.json({
      total: totalStudents || 0,
      paid: paidStudents || 0,
      funded: fundedStudents || 0,
      // perModule: perModule || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
