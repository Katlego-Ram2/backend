const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db"); // Your MySQL connection pool
const router = express.Router();

/**
 * GET /users/:userId
 * Fetch user info including StudentNumber
 */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.execute(
      `SELECT u.UserId, s.StudentNumber, u.FirstName, u.LastName, u.Email,
              u.ContactNumber, u.ResidentialAddress, u.Communication
       FROM Users u
       LEFT JOIN Students s ON u.UserId = s.UserId
       WHERE u.UserId = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /users/:userId
 * Update contact fields or password, but NOT UserId or StudentNumber
 */
router.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { phone, address, communication, password } = req.body;

  try {
    const [rows] = await pool.execute("SELECT UserId FROM Users WHERE UserId = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    let hashedPassword;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const fields = [];
    const params = [];

    if (phone !== undefined) {
      fields.push("ContactNumber = ?");
      params.push(phone);
    }
    if (address !== undefined) {
      fields.push("ResidentialAddress = ?");
      params.push(address);
    }
    if (communication !== undefined) {
      fields.push("Communication = ?");
      params.push(communication);
    }
    if (hashedPassword) {
      fields.push("PasswordHash = ?");
      params.push(hashedPassword);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    params.push(userId);
    const sql = `UPDATE Users SET ${fields.join(", ")} WHERE UserId = ?`;

    await pool.execute(sql, params);

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
 