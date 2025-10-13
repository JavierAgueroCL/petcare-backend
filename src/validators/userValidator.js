const Joi = require('joi');

/**
 * Validación para registro de usuario
 */
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'any.required': 'Email es requerido',
  }),
  first_name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nombre debe tener al menos 2 caracteres',
    'string.max': 'Nombre no puede superar 100 caracteres',
    'any.required': 'Nombre es requerido',
  }),
  last_name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Apellido debe tener al menos 2 caracteres',
    'string.max': 'Apellido no puede superar 100 caracteres',
    'any.required': 'Apellido es requerido',
  }),
  phone: Joi.string().pattern(/^\+?[0-9]{8,15}$/).optional().messages({
    'string.pattern.base': 'Teléfono inválido (8-15 dígitos)',
  }),
  rut: Joi.string().pattern(/^[0-9]+-[0-9kK]$/).optional().messages({
    'string.pattern.base': 'RUT inválido (formato: 12345678-9)',
  }),
  date_of_birth: Joi.date().max('now').optional().messages({
    'date.max': 'Fecha de nacimiento no puede ser futura',
  }),
  address: Joi.string().max(500).optional(),
  commune: Joi.string().max(100).optional(),
  region: Joi.string().max(100).optional(),
});

/**
 * Validación para actualización de usuario
 */
const updateSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).optional(),
  last_name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^\+?[0-9]{8,15}$/).optional(),
  date_of_birth: Joi.date().max('now').optional(),
  address: Joi.string().max(500).optional(),
  commune: Joi.string().max(100).optional(),
  region: Joi.string().max(100).optional(),
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar',
});

/**
 * Middleware de validación
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: 'Error de validación',
        message: 'Los datos proporcionados no son válidos',
        details: errors,
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  validateRegister: validate(registerSchema),
  validateUpdate: validate(updateSchema),
};
