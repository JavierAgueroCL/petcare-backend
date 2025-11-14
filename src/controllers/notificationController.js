const { Notification, Pet } = require('../models');
const { catchAsync } = require('../utils/errors');
const response = require('../utils/response');
const { Op } = require('sequelize');

// Obtener todas las notificaciones del usuario
exports.getNotifications = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { limit = 50, offset = 0, unread_only = false } = req.query;

  const whereClause = { user_id: userId };

  if (unread_only === 'true') {
    whereClause.is_read = false;
  }

  // Solo mostrar notificaciones cuya fecha programada ya haya pasado
  whereClause.scheduled_date = {
    [Op.lte]: new Date(),
  };

  const notifications = await Notification.findAll({
    where: whereClause,
    include: [
      {
        model: Pet,
        as: 'pet',
        attributes: ['id', 'name', 'species', 'profile_image_url'],
      },
    ],
    order: [
      ['scheduled_date', 'DESC'],
      ['created_at', 'DESC'],
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  response.success(res, notifications);
});

// Obtener contador de notificaciones no leídas
exports.getUnreadCount = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const count = await Notification.count({
    where: {
      user_id: userId,
      is_read: false,
      scheduled_date: {
        [Op.lte]: new Date(),
      },
    },
  });

  response.success(res, { count });
});

// Marcar notificación como leída
exports.markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOne({
    where: { id, user_id: userId },
  });

  if (!notification) {
    return response.notFound(res, 'Notificación');
  }

  await notification.update({ is_read: true });

  response.updated(res, notification);
});

// Marcar todas las notificaciones como leídas
exports.markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user.id;

  await Notification.update(
    { is_read: true },
    {
      where: {
        user_id: userId,
        is_read: false,
      },
    }
  );

  response.success(res, null, 'Todas las notificaciones marcadas como leídas');
});

// Eliminar una notificación
exports.deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOne({
    where: { id, user_id: userId },
  });

  if (!notification) {
    return response.notFound(res, 'Notificación');
  }

  await notification.destroy();

  response.deleted(res);
});

// Crear recordatorio personal (usuario autenticado)
exports.createUserNotification = catchAsync(async (req, res) => {
  const {
    pet_id,
    type,
    title,
    message,
    scheduled_date,
    priority,
  } = req.body;

  // El user_id viene del usuario autenticado
  const userId = req.user.id;

  // Validar que la mascota pertenece al usuario si se especifica pet_id
  if (pet_id) {
    const pet = await Pet.findByPk(pet_id);
    if (!pet || pet.owner_id !== userId) {
      return response.forbidden(res, 'No tienes acceso a esta mascota');
    }
  }

  const notification = await Notification.create({
    user_id: userId,
    pet_id: pet_id || null,
    type: type || 'general',
    title,
    message,
    scheduled_date: scheduled_date || new Date(),
    related_type: 'none',
    related_id: null,
    priority: priority || 'medium',
  });

  response.created(res, notification, 'Recordatorio creado exitosamente');
});

// Crear notificación (para uso interno o admin)
exports.createNotification = catchAsync(async (req, res) => {
  const {
    user_id,
    pet_id,
    type,
    title,
    message,
    scheduled_date,
    related_type,
    related_id,
    priority,
  } = req.body;

  const notification = await Notification.create({
    user_id,
    pet_id,
    type,
    title,
    message,
    scheduled_date: scheduled_date || new Date(),
    related_type,
    related_id,
    priority: priority || 'medium',
  });

  response.created(res, notification, 'Notificación creada exitosamente');
});

// Función auxiliar para crear recordatorios de vacunas
// Esta función puede ser llamada cuando se registre una vacuna
exports.createVaccineReminder = async (vaccineId, petId, userId, vaccineName, nextDueDate) => {
  try {
    // Crear recordatorio 7 días antes
    const reminderDate = new Date(nextDueDate);
    reminderDate.setDate(reminderDate.getDate() - 7);

    if (reminderDate > new Date()) {
      await Notification.create({
        user_id: userId,
        pet_id: petId,
        type: 'vaccine_reminder',
        title: `Recordatorio: Vacuna próxima`,
        message: `La vacuna "${vaccineName}" vence en 7 días. Agenda una cita con tu veterinario.`,
        scheduled_date: reminderDate,
        related_type: 'vaccine',
        related_id: vaccineId,
        priority: 'high',
      });
    }
  } catch (error) {
    console.error('Error creating vaccine reminder:', error);
  }
};

// Función auxiliar para crear recordatorios de desparasitación
exports.createDewormingReminder = async (petId, userId, petName, nextDueDate) => {
  try {
    // Crear recordatorio 3 días antes
    const reminderDate = new Date(nextDueDate);
    reminderDate.setDate(reminderDate.getDate() - 3);

    if (reminderDate > new Date()) {
      await Notification.create({
        user_id: userId,
        pet_id: petId,
        type: 'deworming_reminder',
        title: `Recordatorio: Desparasitación de ${petName}`,
        message: `Es momento de desparasitar a ${petName}. La próxima dosis vence en 3 días.`,
        scheduled_date: reminderDate,
        related_type: 'pet',
        related_id: petId,
        priority: 'medium',
      });
    }
  } catch (error) {
    console.error('Error creating deworming reminder:', error);
  }
};

// Función auxiliar para crear recordatorios de citas
exports.createAppointmentReminder = async (appointmentId, petId, userId, petName, appointmentDate, appointmentType) => {
  try {
    // Crear recordatorio 24 horas antes
    const reminderDate = new Date(appointmentDate);
    reminderDate.setHours(reminderDate.getHours() - 24);

    if (reminderDate > new Date()) {
      await Notification.create({
        user_id: userId,
        pet_id: petId,
        type: 'appointment_reminder',
        title: `Recordatorio: Cita de ${petName}`,
        message: `Tienes una cita programada mañana para ${petName}. Tipo: ${appointmentType}`,
        scheduled_date: reminderDate,
        related_type: 'appointment',
        related_id: appointmentId,
        priority: 'high',
      });
    }
  } catch (error) {
    console.error('Error creating appointment reminder:', error);
  }
};
