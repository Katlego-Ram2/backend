const bcrypt = require('bcrypt');
const pool = require('../db');

async function updateUser(req, res) {
  const { id } = req.params;
  const {
    idType,
    idNumber,
    firstName,
    lastName,
    gender,
    maritalStatus,
    hasQualification,
    qualificationDetails,
    modules,
    residentialAddress,
    contactNumber,
    email,
    communication,
    password,
    paymentStatus // can be 0,1 or 'Paid','Unpaid'
  } = req.body;

  try {
    let passwordHash;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Update Users table
    let updateQuery = `
      UPDATE Users SET
        IdType = ?, IdNumber = ?, FirstName = ?, LastName = ?, Gender = ?,
        MaritalStatus = ?, HasQualification = ?, QualificationDetails = ?,
        Modules = ?, ResidentialAddress = ?, ContactNumber = ?, Email = ?,
        Communication = ?
    `;

    const queryParams = [
      idType,
      idNumber,
      firstName,
      lastName,
      gender,
      maritalStatus,
      hasQualification ? 1 : 0,
      qualificationDetails || null,
      modules,
      residentialAddress,
      contactNumber,
      email,
      communication
    ];

    if (passwordHash) {
      updateQuery += `, PasswordHash = ?`;
      queryParams.push(passwordHash);
    }

    updateQuery += ` WHERE UserId = ?`;
    queryParams.push(id);

    await pool.query(updateQuery, queryParams);

    // Update payment status in Students table if provided
    if (paymentStatus !== undefined) {
      const statusMap = {
        'Unpaid': 0,
        'Paid': 1,
        'Funded': 2,
        0: 0,
        1: 1,
        2: 2,
      };
      const normalizedStatus = statusMap[paymentStatus] ?? 0;

      await pool.query(
        `UPDATE Students SET PaymentStatus = ? WHERE UserId = ?`,
        [normalizedStatus, id]
      );
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
}

module.exports = { updateUser };
