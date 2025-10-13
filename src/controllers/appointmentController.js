const { Appointment, Pet, User } = require('../models');
const { catchAsync, NotFoundError, ValidationError } = require('../utils/errors');
const response = require('../utils/response');
const { Op } = require('sequelize');

// Crear una cita
exports.createAppointment = catchAsync(async (req, res) => {
  const { pet_id, appointment_type, appointment_datetime, notes, clinic_name, veterinarian_name } = req.body;

  // Verificar que la mascota pertenezca al usuario
  const pet = await Pet.findOne({ where: { id: pet_id, owner_id: req.user.id } });
  if (!pet) throw new NotFoundError('Mascota');

  // Verificar que la fecha sea futura
  const appointmentDate = new Date(appointment_datetime);
  if (appointmentDate < new Date()) {
    throw new ValidationError('La fecha de la cita debe ser futura');
  }

  const appointment = await Appointment.create({
    user_id: req.user.id,
    pet_id,
    appointment_type,
    appointment_datetime,
    notes,
    clinic_name,
    veterinarian_name,
    status: 'scheduled',
  });

  const createdAppointment = await Appointment.findByPk(appointment.id, {
    include: [
      { model: Pet, as: 'pet', attributes: ['id', 'name', 'species', 'breed'] },
    ],
  });

  response.created(res, createdAppointment, 'Cita agendada exitosamente');
});

// Obtener todas las citas del usuario
exports.getUserAppointments = catchAsync(async (req, res) => {
  const { filter = 'all', status } = req.query;

  const where = { user_id: req.user.id };

  // Filtro por status
  if (status) {
    where.status = status;
  }

  // Filtro por fecha (futuras o pasadas)
  if (filter === 'upcoming') {
    where.appointment_datetime = { [Op.gte]: new Date() };
  } else if (filter === 'past') {
    where.appointment_datetime = { [Op.lt]: new Date() };
  }

  const appointments = await Appointment.findAll({
    where,
    include: [
      { model: Pet, as: 'pet', attributes: ['id', 'name', 'species', 'breed', 'profile_image_url'] },
    ],
    order: [['appointment_datetime', 'DESC']],
  });

  response.success(res, appointments);
});

// Contar citas futuras del usuario
exports.countUpcomingAppointments = catchAsync(async (req, res) => {
  const count = await Appointment.count({
    where: {
      user_id: req.user.id,
      appointment_datetime: { [Op.gte]: new Date() },
      status: { [Op.notIn]: ['cancelled', 'completed'] },
    },
  });

  response.success(res, { count });
});

// Contar citas de vacunación futuras del usuario
exports.countUpcomingVaccineAppointments = catchAsync(async (req, res) => {
  const count = await Appointment.count({
    where: {
      user_id: req.user.id,
      appointment_type: 'vaccine',
      appointment_datetime: { [Op.gte]: new Date() },
      status: { [Op.notIn]: ['cancelled', 'completed'] },
    },
  });

  response.success(res, { count });
});

// Obtener una cita específica
exports.getAppointment = catchAsync(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id, {
    include: [
      { model: Pet, as: 'pet', attributes: ['id', 'name', 'species', 'breed', 'profile_image_url'] },
      { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] },
    ],
  });

  if (!appointment) return response.notFound(res, 'Cita');

  // Verificar que la cita pertenezca al usuario
  if (appointment.user_id !== req.user.id) {
    return response.forbidden(res);
  }

  response.success(res, appointment);
});

// Actualizar una cita
exports.updateAppointment = catchAsync(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id);

  if (!appointment) return response.notFound(res, 'Cita');

  // Verificar que la cita pertenezca al usuario
  if (appointment.user_id !== req.user.id) {
    return response.forbidden(res);
  }

  // Si se actualiza la fecha, verificar que sea futura
  if (req.body.appointment_datetime) {
    const appointmentDate = new Date(req.body.appointment_datetime);
    if (appointmentDate < new Date()) {
      throw new ValidationError('La fecha de la cita debe ser futura');
    }
  }

  await appointment.update(req.body);

  const updatedAppointment = await Appointment.findByPk(appointment.id, {
    include: [
      { model: Pet, as: 'pet', attributes: ['id', 'name', 'species', 'breed'] },
    ],
  });

  response.updated(res, updatedAppointment);
});

// Cancelar una cita
exports.cancelAppointment = catchAsync(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id);

  if (!appointment) return response.notFound(res, 'Cita');

  // Verificar que la cita pertenezca al usuario
  if (appointment.user_id !== req.user.id) {
    return response.forbidden(res);
  }

  await appointment.update({ status: 'cancelled' });

  response.success(res, appointment, 'Cita cancelada exitosamente');
});

// Eliminar una cita
exports.deleteAppointment = catchAsync(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id);

  if (!appointment) return response.notFound(res, 'Cita');

  // Verificar que la cita pertenezca al usuario
  if (appointment.user_id !== req.user.id) {
    return response.forbidden(res);
  }

  await appointment.destroy();

  response.deleted(res);
});
