const express = require('express');
const {
  bookAppointment,
  cancelAppointment,
  getAppointments,
  getAppointmentById,
  approveAppointment,
  rejectAppointment,
} = require('../controllers/appointmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('patient'), bookAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/approve', authorizeRoles('doctor'), approveAppointment);
router.patch('/:id/reject', authorizeRoles('doctor'), rejectAppointment);
router.delete('/:id', cancelAppointment);

module.exports = router;