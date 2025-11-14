const { Veterinary } = require('../models');
const { catchAsync, NotFoundError } = require('../utils/errors');
const response = require('../utils/response');

// Obtener todas las veterinarias activas
exports.getVeterinaries = catchAsync(async (req, res) => {
  const { city, emergency_available, search } = req.query;

  const where = { is_active: true };

  // Filtro por ciudad
  if (city) {
    where.city = city;
  }

  // Filtro por disponibilidad de emergencias
  if (emergency_available === 'true') {
    where.emergency_available = true;
  }

  // Búsqueda por nombre
  if (search) {
    where.name = { [require('sequelize').Op.like]: `%${search}%` };
  }

  const veterinaries = await Veterinary.findAll({
    where,
    order: [['name', 'ASC']],
    attributes: {
      exclude: ['created_at', 'updated_at'],
    },
  });

  response.success(res, veterinaries);
});

// Obtener una veterinaria específica
exports.getVeterinary = catchAsync(async (req, res) => {
  const veterinary = await Veterinary.findByPk(req.params.id);

  if (!veterinary) {
    return response.notFound(res, 'Veterinaria');
  }

  response.success(res, veterinary);
});

// Crear veterinaria (solo admin)
exports.createVeterinary = catchAsync(async (req, res) => {
  const veterinary = await Veterinary.create(req.body);
  response.created(res, veterinary, 'Veterinaria creada exitosamente');
});

// Actualizar veterinaria (solo admin)
exports.updateVeterinary = catchAsync(async (req, res) => {
  const veterinary = await Veterinary.findByPk(req.params.id);

  if (!veterinary) {
    return response.notFound(res, 'Veterinaria');
  }

  await veterinary.update(req.body);
  response.updated(res, veterinary);
});

// Eliminar veterinaria (solo admin) - soft delete
exports.deleteVeterinary = catchAsync(async (req, res) => {
  const veterinary = await Veterinary.findByPk(req.params.id);

  if (!veterinary) {
    return response.notFound(res, 'Veterinaria');
  }

  // Desactivar en lugar de eliminar
  await veterinary.update({ is_active: false });
  response.success(res, null, 'Veterinaria desactivada exitosamente');
});
