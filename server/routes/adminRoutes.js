const express = require('express');
const {
	getUsers,
	updateUser,
	deleteUser,
	getDoctorRequests,
	updateDoctorRequestStatus,
	updateDoctor,
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/doctor-requests', getDoctorRequests);
router.patch('/doctor-requests/:id', updateDoctorRequestStatus);
router.put('/doctors/:id', updateDoctor);

module.exports = router;