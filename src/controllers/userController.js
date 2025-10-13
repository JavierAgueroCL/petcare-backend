const { User } = require('../models');
const { catchAsync } = require('../utils/errors');
const response = require('../utils/response');

/**
 * Obtener perfil del usuario autenticado
 */
exports.getProfile = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['auth0_id'] },
  });

  if (!user) {
    return response.notFound(res, 'Usuario');
  }

  response.success(res, user);
});

/**
 * Actualizar perfil del usuario autenticado
 */
exports.updateProfile = catchAsync(async (req, res) => {
  const allowedUpdates = [
    'first_name',
    'last_name',
    'phone',
    'date_of_birth',
    'address',
    'commune',
    'region',
  ];

  const updates = {};
  Object.keys(req.validatedData).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.validatedData[key];
    }
  });

  await req.user.update(updates);

  response.updated(res, req.user, 'Perfil actualizado exitosamente');
});

/**
 * Subir foto de perfil
 */
exports.uploadProfileImage = catchAsync(async (req, res) => {
  const s3Service = require('../services/s3Service');
  const { BUCKETS } = require('../config/aws');

  if (!req.file) {
    return response.error(res, 'No se recibió imagen', 400);
  }

  // Eliminar imagen anterior si existe
  if (req.user.profile_image_url) {
    const oldKey = s3Service.extractKeyFromUrl(req.user.profile_image_url);
    if (oldKey) {
      await s3Service.deleteFile(BUCKETS.GENERAL, oldKey);
    }
  }

  // Subir nueva imagen
  const { url } = await s3Service.uploadImage(
    req.file.buffer,
    BUCKETS.GENERAL,
    `users/${req.user.id}`,
    { width: 500, height: 500 }
  );

  await req.user.update({ profile_image_url: url });

  response.success(res, { profile_image_url: url }, 'Imagen de perfil actualizada');
});

/**
 * Eliminar foto de perfil
 */
exports.deleteProfileImage = catchAsync(async (req, res) => {
  const s3Service = require('../services/s3Service');
  const { BUCKETS } = require('../config/aws');

  if (!req.user.profile_image_url) {
    return response.error(res, 'No hay imagen de perfil para eliminar', 400);
  }

  const key = s3Service.extractKeyFromUrl(req.user.profile_image_url);
  if (key) {
    await s3Service.deleteFile(BUCKETS.GENERAL, key);
  }

  await req.user.update({ profile_image_url: null });

  response.deleted(res, 'Imagen de perfil eliminada');
});

/**
 * Obtener usuario por ID (solo admin)
 */
exports.getUserById = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['auth0_id'] },
  });

  if (!user) {
    return response.notFound(res, 'Usuario');
  }

  response.success(res, user);
});

/**
 * Listar usuarios (solo admin)
 */
exports.listUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  if (role) {
    where.role = role;
  }

  if (search) {
    const { Op } = require('sequelize');
    where[Op.or] = [
      { first_name: { [Op.like]: `%${search}%` } },
      { last_name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows: users } = await User.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
    attributes: { exclude: ['auth0_id'] },
  });

  response.successWithPagination(res, users, {
    page,
    limit,
    total: count,
  });
});

/**
 * Actualizar rol de usuario (solo admin)
 */
exports.updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return response.notFound(res, 'Usuario');
  }

  const validRoles = ['owner', 'veterinarian', 'ngo', 'municipality', 'admin'];
  if (!validRoles.includes(role)) {
    return response.error(res, 'Rol inválido', 400);
  }

  await user.update({ role });

  response.updated(res, user, 'Rol actualizado exitosamente');
});

/**
 * Desactivar usuario (solo admin)
 */
exports.deactivateUser = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return response.notFound(res, 'Usuario');
  }

  await user.update({ is_active: false });

  response.success(res, user, 'Usuario desactivado');
});

/**
 * Activar usuario (solo admin)
 */
exports.activateUser = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return response.notFound(res, 'Usuario');
  }

  await user.update({ is_active: true });

  response.success(res, user, 'Usuario activado');
});

/**
 * Obtener configuración de notificaciones
 */
exports.getNotificationSettings = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    return response.notFound(res, 'Usuario');
  }

  response.success(res, user.notification_settings);
});

/**
 * Actualizar configuración de notificaciones
 */
exports.updateNotificationSettings = catchAsync(async (req, res) => {
  const settings = req.body;

  await req.user.update({ notification_settings: settings });

  response.updated(res, req.user.notification_settings, 'Configuración de notificaciones actualizada');
});

/**
 * Obtener preferencias del usuario
 */
exports.getPreferences = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    return response.notFound(res, 'Usuario');
  }

  response.success(res, user.preferences);
});

/**
 * Actualizar preferencias del usuario
 */
exports.updatePreferences = catchAsync(async (req, res) => {
  const preferences = req.body;

  await req.user.update({ preferences });

  response.updated(res, req.user.preferences, 'Preferencias actualizadas');
});

/**
 * Actualizar idioma del usuario
 */
exports.updateLanguage = catchAsync(async (req, res) => {
  const { language } = req.body;

  const validLanguages = ['es', 'en', 'pt', 'fr'];
  if (!validLanguages.includes(language)) {
    return response.error(res, 'Idioma inválido', 400);
  }

  await req.user.update({ language });

  response.updated(res, { language: req.user.language }, 'Idioma actualizado');
});
