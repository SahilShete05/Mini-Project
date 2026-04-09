const express = require('express');
const { createDoctor, getDoctors, getDoctorById, deleteDoctor } = require('../controllers/doctorController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', protect, authorizeRoles('admin'), createDoctor);
router.delete('/:id', protect, authorizeRoles('admin'), deleteDoctor);

module.exports = router;