const { Vaccine, Pet } = require('../models');
const { catchAsync, NotFoundError } = require('../utils/errors');
const response = require('../utils/response');
const notificationController = require('./notificationController');

exports.createVaccine = catchAsync(async (req, res) => {
  const { petId } = req.params;
  const pet = await Pet.findOne({ where: { id: petId, owner_id: req.user.id } });

  if (!pet) throw new NotFoundError('Mascota');

  const vaccine = await Vaccine.create({
    ...req.validatedData,
    pet_id: petId,
  });

  // Crear recordatorio automático si hay fecha de siguiente dosis
  if (vaccine.next_dose_date) {
    await notificationController.createVaccineReminder(
      vaccine.id,
      petId,
      req.user.id,
      vaccine.vaccine_name,
      vaccine.next_dose_date
    );
  }

  response.created(res, vaccine, 'Vacuna registrada');
});

exports.getVaccine = catchAsync(async (req, res) => {
  const vaccine = await Vaccine.findByPk(req.params.id, {
    include: [{ model: Pet, as: 'pet', attributes: ['id', 'name', 'owner_id'] }],
  });

  if (!vaccine) return response.notFound(res, 'Vacuna');
  if (vaccine.pet.owner_id !== req.user.id && req.user.role !== 'veterinarian' && req.user.role !== 'admin') {
    return response.forbidden(res);
  }

  const vaccineData = {
    ...vaccine.toJSON(),
    needs_booster: vaccine.needsBooster(),
    days_until_next_dose: vaccine.daysUntilNextDose(),
  };

  response.success(res, vaccineData);
});

exports.updateVaccine = catchAsync(async (req, res) => {
  const vaccine = await Vaccine.findByPk(req.params.id, {
    include: [{ model: Pet, as: 'pet' }],
  });

  if (!vaccine) return response.notFound(res, 'Vacuna');
  if (vaccine.pet.owner_id !== req.user.id && req.user.role !== 'veterinarian') {
    return response.forbidden(res);
  }

  await vaccine.update(req.validatedData);

  // Crear/actualizar recordatorio si hay fecha de siguiente dosis
  if (vaccine.next_dose_date) {
    await notificationController.createVaccineReminder(
      vaccine.id,
      vaccine.pet_id,
      vaccine.pet.owner_id,
      vaccine.vaccine_name,
      vaccine.next_dose_date
    );
  }

  response.updated(res, vaccine);
});

exports.deleteVaccine = catchAsync(async (req, res) => {
  const vaccine = await Vaccine.findByPk(req.params.id, {
    include: [{ model: Pet, as: 'pet' }],
  });

  if (!vaccine) return response.notFound(res, 'Vacuna');
  if (vaccine.pet.owner_id !== req.user.id && req.user.role !== 'admin') {
    return response.forbidden(res);
  }

  await vaccine.destroy();
  response.deleted(res);
});

exports.getUpcomingVaccines = catchAsync(async (req, res) => {
  const { Op } = require('sequelize');
  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const vaccines = await Vaccine.findAll({
    where: {
      next_dose_date: {
        [Op.between]: [today, in30Days],
      },
    },
    include: [{
      model: Pet,
      as: 'pet',
      where: { owner_id: req.user.id },
      attributes: ['id', 'name'],
    }],
    order: [['next_dose_date', 'ASC']],
  });

  response.success(res, vaccines);
});
