const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized, token missing', 401);
  }

  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET is not configured', 500);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');

  if (!user || !user.isActive) {
    throw new AppError('Not authorized, user not found', 401);
  }

  req.user = user;

  if (user.role === 'doctor') {
    req.doctor = await Doctor.findOne({ userId: user._id, isActive: true });
    req.user.doctorProfileId = req.doctor ? req.doctor._id : null;
  }

  next();
});

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('Access denied', 403));
    }

    if (req.user.role === 'doctor') {
      if (!req.doctor || !req.doctor.isActive || req.doctor.verificationStatus !== 'approved') {
        return next(new AppError('Doctor account is not approved by admin yet', 403));
      }
    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};