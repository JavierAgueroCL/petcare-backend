const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const usersRoutes = require('./users');
const petsRoutes = require('./pets');
const medicalRecordsRoutes = require('./medicalRecords');
const medicalRecordAttachmentsRoutes = require('./medicalRecordAttachments');
const vaccinesRoutes = require('./vaccines');
const qrRoutes = require('./qr');
const veterinariesRoutes = require('./veterinaries');
const appointmentsRoutes = require('./appointments');
const legalContentRoutes = require('./legalContent');
const notificationsRoutes = require('./notifications');

// Registrar rutas
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/pets', petsRoutes);
router.use('/medical-records', medicalRecordsRoutes);
router.use('/', medicalRecordAttachmentsRoutes);
router.use('/vaccines', vaccinesRoutes);
router.use('/qr', qrRoutes);
router.use('/veterinaries', veterinariesRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/legal', legalContentRoutes);
router.use('/notifications', notificationsRoutes);

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
      veterinaries: '/api/veterinaries',
      appointments: '/api/appointments',
      legal: '/api/legal',
      notifications: '/api/notifications',
    },
  });
});

module.exports = router;
