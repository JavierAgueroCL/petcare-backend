/**
 * Helpers para formatear respuestas consistentes
 */

/**
 * Respuesta exitosa
 */
const success = (res, data, message = null, statusCode = 200) => {
  const response = {
    success: true,
  };

  if (message) {
    response.message = message;
  }

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Respuesta exitosa con datos paginados
 */
const successWithPagination = (res, data, pagination, message = null) => {
  return res.status(200).json({
    success: true,
    ...(message && { message }),
    data,
    pagination: {
      page: parseInt(pagination.page),
      limit: parseInt(pagination.limit),
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNextPage: pagination.page * pagination.limit < pagination.total,
      hasPrevPage: pagination.page > 1,
    },
  });
};

/**
 * Respuesta de error
 */
const error = (res, message, statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: message,
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Respuesta de creación exitosa
 */
const created = (res, data, message = 'Recurso creado exitosamente') => {
  return success(res, data, message, 201);
};

/**
 * Respuesta de actualización exitosa
 */
const updated = (res, data, message = 'Recurso actualizado exitosamente') => {
  return success(res, data, message, 200);
};

/**
 * Respuesta de eliminación exitosa
 */
const deleted = (res, message = 'Recurso eliminado exitosamente') => {
  return res.status(200).json({
    success: true,
    message,
  });
};

/**
 * Respuesta no encontrado
 */
const notFound = (res, resource = 'Recurso') => {
  return res.status(404).json({
    success: false,
    error: 'No encontrado',
    message: `${resource} no encontrado`,
  });
};

/**
 * Respuesta no autorizado
 */
const unauthorized = (res, message = 'No autenticado') => {
  return res.status(401).json({
    success: false,
    error: 'No autorizado',
    message,
  });
};

/**
 * Respuesta prohibido
 */
const forbidden = (res, message = 'No tienes permisos para acceder a este recurso') => {
  return res.status(403).json({
    success: false,
    error: 'Prohibido',
    message,
  });
};

/**
 * Respuesta de validación
 */
const validationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    error: 'Error de validación',
    message: 'Los datos proporcionados no son válidos',
    details: errors,
  });
};

module.exports = {
  success,
  successWithPagination,
  error,
  created,
  updated,
  deleted,
  notFound,
  unauthorized,
  forbidden,
  validationError,
};
