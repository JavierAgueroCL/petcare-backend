const { MedicalRecord, Pet } = require('../models');
const { catchAsync, NotFoundError } = require('../utils/errors');
const response = require('../utils/response');
const s3Service = require('../services/s3Service');
const { BUCKETS } = require('../config/aws');

exports.getPetMedicalRecords = catchAsync(async (req, res) => {
  const { petId } = req.params;
  const pet = await Pet.findOne({ where: { id: petId, owner_id: req.user.id } });

  if (!pet) throw new NotFoundError('Mascota');

  const records = await MedicalRecord.findAll({
    where: { pet_id: petId },
    order: [['date', 'DESC']],
  });

  response.success(res, records);
});

exports.createMedicalRecord = catchAsync(async (req, res) => {
  const { petId } = req.params;
  const pet = await Pet.findOne({ where: { id: petId, owner_id: req.user.id } });

  if (!pet) throw new NotFoundError('Mascota');

  const record = await MedicalRecord.create({
    ...req.validatedData,
    pet_id: petId,
  });

  response.created(res, record, 'Registro médico creado');
});

exports.getMedicalRecord = catchAsync(async (req, res) => {
  const record = await MedicalRecord.findByPk(req.params.id, {
    include: [{ model: Pet, as: 'pet', attributes: ['id', 'name', 'owner_id'] }],
  });

  if (!record) return response.notFound(res, 'Registro médico');
  if (record.pet.owner_id !== req.user.id && req.user.role !== 'veterinarian' && req.user.role !== 'admin') {
    return response.forbidden(res);
  }

  response.success(res, record);
});

exports.updateMedicalRecord = catchAsync(async (req, res) => {
  const record = await MedicalRecord.findByPk(req.params.id, {
    include: [{ model: Pet, as: 'pet' }],
  });

  if (!record) return response.notFound(res, 'Registro médico');
  if (record.pet.owner_id !== req.user.id && req.user.role !== 'veterinarian') {
    return response.forbidden(res);
  }

  await record.update(req.validatedData);
  response.updated(res, record);
});

exports.deleteMedicalRecord = catchAsync(async (req, res) => {
  const record = await MedicalRecord.findByPk(req.params.id, {
    include: [{ model: Pet, as: 'pet' }],
  });

  if (!record) return response.notFound(res, 'Registro médico');
  if (record.pet.owner_id !== req.user.id && req.user.role !== 'admin') {
    return response.forbidden(res);
  }

  await record.destroy();
  response.deleted(res);
});

exports.uploadMedicalDocument = catchAsync(async (req, res) => {
  const record = await MedicalRecord.findByPk(req.params.id, {
    include: [{ model: Pet, as: 'pet' }],
  });

  if (!record) return response.notFound(res, 'Registro médico');
  if (!req.file) return response.error(res, 'No se recibió documento', 400);

  const { key } = await s3Service.uploadDocument(
    req.file.buffer,
    req.file.originalname,
    BUCKETS.MEDICAL,
    `medical/${record.pet_id}`,
    req.file.mimetype
  );

  const attachments = record.attachments || [];
  attachments.push(key);
  await record.update({ attachments });

  response.success(res, { attachments }, 'Documento subido');
});
