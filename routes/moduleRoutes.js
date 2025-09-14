const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../db");



// Set up file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// GET /api/modules - Fetch all modules
router.get("/modules", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT ModuleId, ModuleName FROM Modules");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching modules:", err);
    res.status(500).json({ message: "Failed to fetch modules" });
  }
});

// GET /api/resources - Fetch all resources
router.get("/resources", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Resources");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching resources:", err);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});

// GET /api/resources/:moduleId - Fetch resources by module
router.get("/resources/:moduleId", async (req, res) => {
  const { moduleId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Resources WHERE ModuleId = ? OR ModuleId = 2",
      [moduleId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching resources for module:", err);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});


// POST /api/resources/upload - Upload resource
router.post("/resources/upload", upload.single("file"), async (req, res) => {
  const { title, description, type, moduleId } = req.body;
  const filePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!filePath || !title || !type || !moduleId) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO Resources (Title, Description, ResourceType, FilePath, ModuleId) VALUES (?, ?, ?, ?, ?)",
      [title, description, type, filePath, moduleId]
    );
    res.status(201).json({ message: "Resource uploaded", resourceId: result.insertId });
  } catch (err) {
    console.error("Error uploading resource:", err);
    res.status(500).json({ message: "Failed to upload resource." });
  }
});

// DELETE /api/resources/:id - Delete a resource
router.delete("/resources/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Get file path first
    const [rows] = await pool.query("SELECT FilePath FROM Resources WHERE ResourceId = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const filePath = path.join(__dirname, "..", rows[0].FilePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // delete file
    }

    // Delete from DB
    await pool.query("DELETE FROM Resources WHERE ResourceId = ?", [id]);
    res.json({ message: "Resource deleted successfully" });
  } catch (err) {
    console.error("Error deleting resource:", err);
    res.status(500).json({ message: "Failed to delete resource" });
  }
});

module.exports = router;

