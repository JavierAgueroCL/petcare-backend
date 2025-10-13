const Joi = require('joi');

/**
 * Validación para crear registro médico
 */
const createMedicalRecordSchema = Joi.object({
  record_type: Joi.string()
    .valid('consultation', 'surgery', 'emergency', 'vaccination', 'checkup', 'other')
    .required()
    .messages({
      'any.only': 'Tipo de registro inválido',
      'any.required': 'Tipo de registro es requerido',
    }),
  date: Joi.date().max('now').required().messages({
    'date.max': 'Fecha no puede ser futura',
    'any.required': 'Fecha es requerida',
  }),
  diagnosis: Joi.string().max(2000).optional(),
  treatment: Joi.string().max(2000).optional(),
  prescriptions: Joi.string().max(2000).optional(),
  notes: Joi.string().max(2000).optional(),
  weight_kg: Joi.number().positive().max(200).optional(),
  temperature_celsius: Joi.number().min(35).max(45).optional(),
  heart_rate: Joi.number().integer().min(40).max(250).optional(),
  next_appointment: Joi.date().min('now').optional(),
  cost: Joi.number().positive().max(10000000).optional(),
});

/**
 * Validación para crear vacuna
 */
const createVaccineSchema = Joi.object({
  vaccine_name: Joi.string().min(2).max(255).required().messages({
    'any.required': 'Nombre de vacuna es requerido',
  }),
  vaccine_type: Joi.string()
    .valid(
      'rabies',
      'distemper',
      'parvovirus',
      'hepatitis',
      'leptospirosis',
      'kennel_cough',
      'feline_leukemia',
      'other'
    )
    .required()
    .messages({
      'any.only': 'Tipo de vacuna inválido',
      'any.required': 'Tipo de vacuna es requerido',
    }),
  manufacturer: Joi.string().max(255).optional(),
  batch_number: Joi.string().max(100).optional(),
  administration_date: Joi.date().max('now').required().messages({
    'date.max': 'Fecha de administración no puede ser futura',
    'any.required': 'Fecha de administración es requerida',
  }),
  next_dose_date: Joi.date().min(Joi.ref('administration_date')).optional().messages({
    'date.min': 'Fecha de próxima dosis debe ser posterior a la fecha de administración',
  }),
  notes: Joi.string().max(1000).optional(),
});

/**
 * Validación para actualizar vacuna
 */
const updateVaccineSchema = Joi.object({
  next_dose_date: Joi.date().optional(),
  notes: Joi.string().max(1000).optional(),
}).min(1);

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
  validateCreateMedicalRecord: validate(createMedicalRecordSchema),
  validateCreateVaccine: validate(createVaccineSchema),
  validateUpdateVaccine: validate(updateVaccineSchema),
};
