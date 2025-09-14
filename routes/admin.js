// routes/admin.js
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { updateUser } = require('../controllers/userController');

const router = express.Router();

/**
 * GET /admin/users - Fetch users with search and pagination
 */
router.get('/users', async (req, res) => {
  try {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM Users u
       LEFT JOIN Students s ON u.UserId = s.UserId
       WHERE CONCAT(u.FirstName, ' ', u.LastName, ' ', u.Email, ' ', IFNULL(s.StudentNumber, '')) LIKE ?`,
      [`%${search}%`]
    );

    const total = countResult[0].count;
    const totalPages = Math.ceil(total / limit);

    const [users] = await pool.query(
      `SELECT 
        u.UserId, u.IdType, u.IdNumber, u.FirstName, u.LastName, u.Gender,
        u.MaritalStatus, u.HasQualification, u.QualificationDetails,
        u.ResidentialAddress, u.ContactNumber, u.Email,
        u.Communication, u.Modules,
        s.StudentNumber, s.PaymentStatus
       FROM Users u
       LEFT JOIN Students s ON u.UserId = s.UserId
       WHERE CONCAT(u.FirstName, ' ', u.LastName, ' ', u.Email, ' ', IFNULL(s.StudentNumber, '')) LIKE ?
       ORDER BY u.RegistrationDate DESC
       LIMIT ? OFFSET ?`,
      [`%${search}%`, limit, offset]
    );

    res.status(200).json({ users, totalPages });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /admin/users - Create new user + student record
 */
router.post('/users', async (req, res) => {
  const {
    idType, idNumber, firstName, lastName, gender, maritalStatus,
    hasQualification, qualificationDetails, residentialAddress,
    contactNumber, email, communication, password,
    studentNumber, paymentStatus
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO Users
        (IdType, IdNumber, FirstName, LastName, Gender, MaritalStatus,
         HasQualification, QualificationDetails, ResidentialAddress, ContactNumber,
         Email, Communication, PasswordHash, Modules)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idType, idNumber, firstName, lastName, gender, maritalStatus,
        hasQualification ? 1 : 0, qualificationDetails || null,
        residentialAddress, contactNumber, email, communication,
        hashedPassword, ''
      ]
    );

    const newUserId = result.insertId;

    await pool.query(
      `INSERT INTO Students (UserId, StudentNumber, PaymentStatus)
       VALUES (?, ?, ?)`,
      [newUserId, studentNumber, paymentStatus]
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /admin/users/:id - Update user and payment status
 */
router.put('/users/:id', updateUser);

/**
 * DELETE /admin/users/:id - Delete user and student records
 */
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM Students WHERE UserId = ?', [id]);
    await pool.query('DELETE FROM Users WHERE UserId = ?', [id]);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
