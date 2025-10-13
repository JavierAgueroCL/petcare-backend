const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { jwtCheck, checkUserExists } = require('../middleware/auth');

router.use(jwtCheck);
router.use(checkUserExists);

// Contar citas futuras del usuario
router.get('/count', appointmentController.countUpcomingAppointments);

// Contar citas de vacunación futuras del usuario
router.get('/count-vaccines', appointmentController.countUpcomingVaccineAppointments);

// Obtener todas las citas del usuario (con filtros)
router.get('/', appointmentController.getUserAppointments);

// Crear una cita
router.post('/', appointmentController.createAppointment);

// Obtener una cita específica
router.get('/:id', appointmentController.getAppointment);

// Actualizar una cita
router.put('/:id', appointmentController.updateAppointment);

// Cancelar una cita
router.patch('/:id/cancel', appointmentController.cancelAppointment);

// Eliminar una cita
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
