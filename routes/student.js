const express = require("express");
const pool = require("../db");  // your configured MySQL connection pool
const router = express.Router();

router.get("/resources/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Get the user's selected module from Users table
    const [userRows] = await pool.execute(
      "SELECT modules FROM Users WHERE UserId = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const moduleName = userRows[0].modules;

    // Get the module id by module name
    const [moduleRows] = await pool.execute(
      "SELECT ModuleId FROM Modules WHERE ModuleName = ?",
      [moduleName]
    );

    if (moduleRows.length === 0) {
      return res.status(404).json({ message: "Module not found" });
    }

    const moduleId = moduleRows[0].ModuleId;

    // Get resources under that module id
   const [resources] = await pool.execute(
  `SELECT 
      ResourceId AS id, 
      ResourceName AS Title, 
      ResourceType AS Type, 
      FilePath 
   FROM Resources 
   WHERE ModuleId = ? OR ModuleId = 2`,
  [moduleId]
);


    // Build full URL for each resource's file path
    const protocol = req.protocol; // 'http' or 'https'
    const host = req.get('host');  // e.g. 'localhost:3000'

    const resourcesWithUrls = resources.map(resource => ({
      id: resource.id,
      Title: resource.Title,
      Type: resource.Type,
      FileUrl: `${protocol}://${host}/uploads/resources/${encodeURIComponent(resource.FilePath)}`
    }));

    res.json({ resources: resourcesWithUrls });
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
