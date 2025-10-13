const Joi = require('joi');

/**
 * Validación para crear mascota
 */
const createPetSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nombre debe tener al menos 2 caracteres',
    'string.max': 'Nombre no puede superar 100 caracteres',
    'any.required': 'Nombre es requerido',
  }),
  species: Joi.string().valid('perro', 'gato', 'raton', 'conejo', 'serpiente', 'vaca', 'burro', 'caballo', 'asno', 'gallina', 'cerdo', 'loro', 'tortuga', 'iguana', 'araña').required().messages({
    'any.only': 'Tipo debe ser uno de: perro, gato, raton, conejo, serpiente, vaca, burro, caballo, asno, gallina, cerdo, loro, tortuga, iguana, araña',
    'any.required': 'Tipo es requerido',
  }),
  breed: Joi.string().max(100).optional(),
  gender: Joi.string().valid('male', 'female', 'unknown').required().messages({
    'any.only': 'Género debe ser: male, female o unknown',
    'any.required': 'Género es requerido',
  }),
  date_of_birth: Joi.date().max('now').optional().messages({
    'date.max': 'Fecha de nacimiento no puede ser futura',
  }),
  estimated_age_months: Joi.number().integer().min(0).max(300).optional().messages({
    'number.min': 'Edad estimada debe ser positiva',
    'number.max': 'Edad estimada no puede superar 300 meses (25 años)',
  }),
  color: Joi.string().max(50).optional(),
  size: Joi.string().valid('small', 'medium', 'large', 'extra_large').optional(),
  weight_kg: Joi.number().positive().max(200).optional().messages({
    'number.positive': 'Peso debe ser positivo',
    'number.max': 'Peso no puede superar 200kg',
  }),
  microchip_number: Joi.string().max(50).optional(),
  national_registry_number: Joi.string().max(50).optional(),
  is_sterilized: Joi.boolean().optional(),
  sterilization_date: Joi.date().max('now').optional(),
  special_needs: Joi.string().max(1000).optional(),
  temperament: Joi.string().max(1000).optional(),
  is_public: Joi.boolean().optional(),
}).custom((value, helpers) => {
  // Validar que tenga fecha de nacimiento O edad estimada
  if (!value.date_of_birth && !value.estimated_age_months) {
    return helpers.error('custom.ageRequired');
  }
  return value;
}).messages({
  'custom.ageRequired': 'Debe proporcionar fecha de nacimiento o edad estimada',
});

/**
 * Validación para actualizar mascota
 */
const updatePetSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  species: Joi.string().valid('perro', 'gato', 'raton', 'conejo', 'serpiente', 'vaca', 'burro', 'caballo', 'asno', 'gallina', 'cerdo', 'loro', 'tortuga', 'iguana', 'araña').optional(),
  breed: Joi.string().max(100).optional(),
  color: Joi.string().max(50).optional(),
  size: Joi.string().valid('small', 'medium', 'large', 'extra_large').optional(),
  weight_kg: Joi.number().positive().max(200).optional(),
  microchip_number: Joi.string().max(50).optional(),
  national_registry_number: Joi.string().max(50).optional(),
  is_sterilized: Joi.boolean().optional(),
  sterilization_date: Joi.date().max('now').optional(),
  special_needs: Joi.string().max(1000).optional(),
  temperament: Joi.string().max(1000).optional(),
  status: Joi.string().valid('active', 'lost', 'found', 'deceased', 'adopted').optional(),
  lost_date: Joi.date().optional(),
  lost_location: Joi.string().max(500).optional(),
  is_public: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar',
});

/**
 * Validación para reporte de mascota perdida
 */
const reportLostPetSchema = Joi.object({
  lost_date: Joi.date().max('now').required().messages({
    'date.max': 'Fecha de pérdida no puede ser futura',
    'any.required': 'Fecha de pérdida es requerida',
  }),
  lost_location: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Ubicación debe tener al menos 10 caracteres',
    'any.required': 'Ubicación es requerida',
  }),
  description: Joi.string().max(1000).optional(),
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
  validateCreatePet: validate(createPetSchema),
  validateUpdatePet: validate(updatePetSchema),
  validateReportLostPet: validate(reportLostPetSchema),
};
