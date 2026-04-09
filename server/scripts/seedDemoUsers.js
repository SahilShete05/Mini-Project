require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const DOCTOR_COUNT = 25;
const PATIENT_COUNT = 100;
const DOCTOR_PASSWORD = 'Doctor@123';
const PATIENT_PASSWORD = 'Patient@123';

const specializations = [
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Gynecology',
  'ENT',
  'Ophthalmology',
  'Psychiatry',
  'General Medicine',
];

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildSlots = (seed) => {
  const dateA = new Date();
  dateA.setDate(dateA.getDate() + ((seed % 7) + 1));

  const dateB = new Date();
  dateB.setDate(dateB.getDate() + ((seed % 7) + 2));

  return [
    { date: formatDate(dateA), time: '10:00' },
    { date: formatDate(dateA), time: '12:00' },
    { date: formatDate(dateB), time: '15:00' },
  ];
};

const ensureDoctor = async (index) => {
  const name = `Doctor ${index}`;
  const email = `doctor${index}@demo.com`;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      password: DOCTOR_PASSWORD,
      role: 'doctor',
      isActive: true,
    });
  } else {
    user.name = name;
    user.role = 'doctor';
    user.isActive = true;
    await user.save();
  }

  const specialization = specializations[(index - 1) % specializations.length];
  const fees = 400 + (index % 10) * 50;

  const doctorProfile = await Doctor.findOne({ userId: user._id });

  if (!doctorProfile) {
    await Doctor.create({
      userId: user._id,
      name,
      specialization,
      availableSlots: buildSlots(index),
      fees,
      verificationStatus: 'approved',
      isActive: true,
    });
    return { created: true };
  }

  doctorProfile.name = name;
  doctorProfile.specialization = specialization;
  doctorProfile.availableSlots = buildSlots(index);
  doctorProfile.fees = fees;
  doctorProfile.verificationStatus = 'approved';
  doctorProfile.isActive = true;
  await doctorProfile.save();

  return { created: false };
};

const ensurePatient = async (index) => {
  const name = `Patient ${index}`;
  const email = `patient${index}@demo.com`;

  const existing = await User.findOne({ email });

  if (!existing) {
    await User.create({
      name,
      email,
      password: PATIENT_PASSWORD,
      role: 'patient',
      isActive: true,
    });
    return { created: true };
  }

  existing.name = name;
  existing.role = 'patient';
  existing.isActive = true;
  await existing.save();
  return { created: false };
};

const seed = async () => {
  await connectDB();

  let doctorsCreated = 0;
  let patientsCreated = 0;

  for (let i = 1; i <= DOCTOR_COUNT; i += 1) {
    const result = await ensureDoctor(i);
    if (result.created) doctorsCreated += 1;
  }

  for (let i = 1; i <= PATIENT_COUNT; i += 1) {
    const result = await ensurePatient(i);
    if (result.created) patientsCreated += 1;
  }

  console.log('Seed complete');
  console.log(`Doctors ensured: ${DOCTOR_COUNT} (new: ${doctorsCreated})`);
  console.log(`Patients ensured: ${PATIENT_COUNT} (new: ${patientsCreated})`);
  console.log(`Doctor login password: ${DOCTOR_PASSWORD}`);
  console.log(`Patient login password: ${PATIENT_PASSWORD}`);

  await mongoose.disconnect();
};

seed()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('Seeding failed:', error.message);
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect errors during failure handling.
    }
    process.exit(1);
  });
