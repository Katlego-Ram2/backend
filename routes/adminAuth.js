const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db'); // Adjust path if needed

router.post('/log', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required." });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM Admins WHERE Email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const admin = rows[0];

    // 👇 FIXED: access correct field name (case-sensitive)
    const isMatch = await bcrypt.compare(password, admin.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    return res.json({
      success: true,
      adminName: `${admin.FirstName} ${admin.LastName}`
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
});

module.exports = router;
