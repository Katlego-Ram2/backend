const express = require("express");
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Folder to store submissions
const submissionsFolder = path.join(__dirname, "../uploads/submissions");
if (!fs.existsSync(submissionsFolder)) fs.mkdirSync(submissionsFolder, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, submissionsFolder),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ======================
// GET assignments for a user (existing)
// ======================
router.get("/aa/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [user] = await pool.query("SELECT modules, StudentNumber FROM Users WHERE UserId = ?", [userId]);

    if (!user.length) return res.status(404).json({ error: "User not found" });

    const moduleName = user[0].modules;
    const [module] = await pool.query("SELECT ModuleId FROM Modules WHERE ModuleName = ?", [moduleName]);
    if (!module.length) return res.status(404).json({ error: "Module not found" });

    const moduleId = module[0].ModuleId;
    const [assignments] = await pool.query(
      "SELECT AssignmentId, Title, FilePath, DueDate FROM Assignments WHERE ModuleId = ?",
      [moduleId]
    );

    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
