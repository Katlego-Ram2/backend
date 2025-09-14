const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../db");

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/resources");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/**
 * GET /api/modules - Fetch all modules
 */
router.get("/modules", async (req, res) => {
  try {
    const result = await pool.query("SELECT ModuleId, ModuleName FROM Modules");
    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/resources/upload - Upload a new resource
 */
router.post("/resources/upload", upload.single("file"), async (req, res) => {
  const { moduleId, resourceType } = req.body;
  const file = req.file;

  if (!moduleId || !resourceType || !file) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const resourceName = file.originalname;
    const filePath = file.filename;

    await pool.query(
      `INSERT INTO Resources (ModuleId, ResourceName, ResourceType, FilePath)
       VALUES (?, ?, ?, ?)`,
      [moduleId, resourceName, resourceType, filePath]
    );

    res.status(201).json({ message: "Resource uploaded successfully." });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Failed to upload resource." });
  }
});

/**
 * GET /api/resources/:moduleId - Get all resources for a module
 */
router.get("/resources/:moduleId", async (req, res) => {
  const { moduleId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT ResourceId, ResourceName, ResourceType
       FROM Resources
       WHERE ModuleId = ? OR ModuleId = 2`,
      [moduleId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Get resources error:", error);
    res.status(500).json({ message: "Failed to fetch resources." });
  }
});

/**
 * DELETE /api/resources/:id - Delete a resource
 */
router.delete("/resources/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Get file name
    const [[resource]] = await pool.query(
      "SELECT FilePath FROM Resources WHERE ResourceId = ?",
      [id]
    );

    if (!resource) {
      return res.status(404).json({ message: "Resource not found." });
    }

    const filePath = path.join(__dirname, "../uploads/resources", resource.FilePath);

    // Delete file from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete record from DB
    await pool.query("DELETE FROM Resources WHERE ResourceId = ?", [id]);

    res.json({ message: "Resource deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete resource." });
  }
});

module.exports = router;
