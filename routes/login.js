const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { studentNumber, password } = req.body;

  if (!studentNumber || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  try {
    // First check if student exists in Students table
    const [studentRows] = await pool.execute(
      `SELECT StudentId, UserId, PasswordHash, PaymentStatus FROM Students WHERE StudentNumber = ?`,
      [studentNumber]
    );

    if (studentRows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid student number or password' });
    }

    const { PasswordHash, StudentId, UserId, PaymentStatus } = studentRows[0];

    const isMatch = await bcrypt.compare(password, PasswordHash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid student number or password' });
    }

    if (PaymentStatus === 0) {
      return res.json({
        success: true,
        message: 'Payment required',
        paymentRequired: true,
        studentId: StudentId,
        userId: UserId,
        studentNumber: studentNumber
      });
    }

    // Success: Payment done
    res.json({
      success: true,
      message: 'Login successful',
      paymentRequired: false,
      studentId: StudentId,
      userId: UserId,
      studentNumber: studentNumber
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
