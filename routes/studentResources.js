// routes/asDisplayAssignments.js
const express = require("express");
const pool = require("../db");

const router = express.Router();

/**
 * GET /assignments/:userId
 * Fetch assignments for a specific user based on their ModuleName -> ModuleId
 */
router.get("/assignments/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Step 1: Get module name from Users table
    const [user] = await pool.query(
      "SELECT ModuleName FROM Users WHERE UserId = ?",
      [userId]
    );

    if (!user.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const moduleName = user[0].ModuleName;

    // Step 2: Get module ID from Modules table
    const [module] = await pool.query(
      "SELECT ModuleId FROM Modules WHERE ModuleName = ?",
      [moduleName]
    );

    if (!module.length) {
      return res.status(404).json({ error: "Module not found" });
    }

    const moduleId = module[0].ModuleId;

    // Step 3: Get assignments for this module ID
   const [assignments] = await pool.query(
  "SELECT * FROM Assignments WHERE ModuleId = ? OR ModuleId = 2",
  [moduleId]
);


    res.json(assignments);
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
