const express = require('express');
const { updateUser } = require('../controllers/userController');

const router = express.Router();

// PUT endpoint to update user info + payment status
router.put('/users/:id', updateUser);

module.exports = router;
