const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const usersRoutes = require('./users');
const petsRoutes = require('./pets');
const medicalRecordsRoutes = require('./medicalRecords');
const vaccinesRoutes = require('./vaccines');
const qrRoutes = require('./qr');
const appointmentsRoutes = require('./appointments');
const legalContentRoutes = require('./legalContent');

// Registrar rutas
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/pets', petsRoutes);
router.use('/medical-records', medicalRecordsRoutes);
router.use('/vaccines', vaccinesRoutes);
router.use('/qr', qrRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/legal', legalContentRoutes);

// Ruta de bienvenida de la API
router.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a PetCare API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      pets: '/api/pets',
      medical_records: '/api/medical-records',
      vaccines: '/api/vaccines',
      qr: '/api/qr',
      appointments: '/api/appointments',
      legal: '/api/legal',
    },
  });
});

module.exports = router;
