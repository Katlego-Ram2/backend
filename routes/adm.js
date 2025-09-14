const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db'); // Adjust if needed

// ==============================
// POST /api/adm/register
// ==============================
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Validate email domain
  if (!email.endsWith('@seedwaycapital.co.za')) {
    return res.status(400).json({ success: false, message: 'Email must end with @seedwaycapital.co.za' });
  }

  try {
    // Check if admin already exists
    const [existing] = await pool.query('SELECT * FROM Admins WHERE Email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Admin already registered with this email' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin
    await pool.query(
      'INSERT INTO Admins (FirstName, LastName, Email, PasswordHash) VALUES (?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword]
    );

    res.status(201).json({ success: true, message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// ==============================
// POST /api/adm/log
// ==============================


module.exports = router;
