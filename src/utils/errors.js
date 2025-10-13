/**
 * Clase base para errores personalizados
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de validación (400)
 */
class ValidationError extends AppError {
  constructor(message = 'Error de validación', details = []) {
    super(message, 400);
    this.details = details;
  }
}

/**
 * Error de autenticación (401)
 */
class AuthenticationError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401);
  }
}

/**
 * Error de autorización (403)
 */
class AuthorizationError extends AppError {
  constructor(message = 'No tienes permisos para acceder a este recurso') {
    super(message, 403);
  }
}

/**
 * Error de recurso no encontrado (404)
 */
class NotFoundError extends AppError {
  constructor(resource = 'Recurso', id = null) {
    const message = id
      ? `${resource} con ID ${id} no encontrado`
      : `${resource} no encontrado`;
    super(message, 404);
  }
}

/**
 * Error de conflicto (409)
 */
class ConflictError extends AppError {
  constructor(message = 'El recurso ya existe') {
    super(message, 409);
  }
}

/**
 * Error de límite excedido (429)
 */
class RateLimitError extends AppError {
  constructor(message = 'Demasiadas peticiones, intenta nuevamente más tarde') {
    super(message, 429);
  }
}

/**
 * Error de servicio externo (502)
 */
class ExternalServiceError extends AppError {
  constructor(service, message = null) {
    super(
      message || `Error al comunicarse con el servicio: ${service}`,
      502
    );
    this.service = service;
  }
}

/**
 * Handler global de errores para Express
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error('ERROR:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user?.id,
  });

  // Errores de Sequelize
  if (err.name === 'SequelizeValidationError') {
    error = new ValidationError(
      'Error de validación de datos',
      err.errors.map(e => ({
        field: e.path,
        message: e.message,
      }))
    );
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    error = new ConflictError('El registro ya existe');
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = new ValidationError('Referencia inválida a otro registro');
  }

  // Errores de JWT/Auth0
  if (err.name === 'UnauthorizedError') {
    error = new AuthenticationError('Token inválido o expirado');
  }

  // Error de Multer (archivos)
  if (err.name === 'MulterError') {
    error = new ValidationError(`Error en el archivo: ${err.message}`);
  }

  // Responder
  const statusCode = error.statusCode || 500;
  const response = {
    error: error.status || 'error',
    message: error.message || 'Error interno del servidor',
  };

  // Agregar detalles si es error de validación
  if (error.details) {
    response.details = error.details;
  }

  // En desarrollo, agregar stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Handler para rutas no encontradas
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError('Ruta', req.originalUrl);
  next(error);
};

/**
 * Wrapper para funciones async
 * Evita tener que hacer try-catch en cada controlador
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  errorHandler,
  notFoundHandler,
  catchAsync,
};
