const express = require('express');
const { registerUser, registerDoctorRequest, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/register-doctor-request', registerDoctorRequest);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

module.exports = router;