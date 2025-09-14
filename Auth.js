const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./db'); // MySQL connection pool

const router = express.Router();

// POST /auth/enroll
router.post('/enroll', async (req, res) => {
  try {
    const {
      idType,
      idNumber,
      firstName,
      lastName,
      gender,
      maritalStatus,
      hasQualification,
      qualificationDetails,
      residentialAddress,
      contactNumber,
      email,
      communication,
      password,
      modules,
    } = req.body;

    // Validate required fields
    if (
      !idType || !idNumber || !firstName || !lastName || !gender || !maritalStatus ||
      !residentialAddress || !contactNumber || !email || !communication || !password
    ) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    // Check if email is already registered
    const [existing] = await pool.query(
      "SELECT * FROM Users WHERE email = ? LIMIT 1",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user info into Users table
    const [insertUserResult] = await pool.query(
      `INSERT INTO Users
       (idType, idNumber, firstName, lastName, gender, maritalStatus,
        hasQualification, qualificationDetails, residentialAddress, contactNumber,
        email, communication, passwordHash, modules)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idType,
        idNumber,
        firstName,
        lastName,
        gender,
        maritalStatus,
        hasQualification ? 1 : 0,
        qualificationDetails || null,
        residentialAddress,
        contactNumber,
        email,
        communication,
        hashedPassword,
        modules || null,
      ]
    );

    const userId = insertUserResult.insertId;

    // Generate a student number (e.g., SWAY20250001)
    const studentNumber = `SWAY${new Date().getFullYear()}${String(userId).padStart(4, '0')}`;

    // Insert into Students table
    await pool.query(
      `INSERT INTO Students (UserId, StudentNumber, PasswordHash)
       VALUES (?, ?, ?)`,
      [userId, studentNumber, hashedPassword]
    );

    res.status(201).json({ message: "Registration successful!", studentNumber });
  } catch (error) {
    console.error("Enroll error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
