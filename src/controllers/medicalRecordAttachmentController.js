const { MedicalRecordAttachment, MedicalRecord, Pet } = require('../models');
const { catchAsync, NotFoundError, ValidationError } = require('../utils/errors');
const response = require('../utils/response');
const s3Service = require('../services/s3Service');

// Agregar foto a un registro médico
exports.addAttachment = catchAsync(async (req, res) => {
  const { medicalRecordId } = req.params;
  const { title, description, date } = req.body;

  // Verificar que el registro médico existe y pertenece al usuario
  const medicalRecord = await MedicalRecord.findByPk(medicalRecordId, {
    include: [{ model: Pet, as: 'pet' }],
  });

  if (!medicalRecord) {
    return response.notFound(res, 'Registro médico');
  }

  if (medicalRecord.pet.owner_id !== req.user.id) {
    return response.forbidden(res);
  }

  // Verificar que se subió un archivo
  if (!req.file) {
    throw new ValidationError('Debe proporcionar un archivo');
  }

  // Subir imagen a S3
  const uploadResult = await s3Service.uploadImage(
    req.file.buffer,
    'medical-records',
    medicalRecordId.toString(),
    { quality: 90 }
  );

  // Obtener el siguiente orden
  const maxOrder = await MedicalRecordAttachment.max('order', {
    where: { medical_record_id: medicalRecordId },
  });

  const attachment = await MedicalRecordAttachment.create({
    medical_record_id: medicalRecordId,
    title,
    description,
    file_url: uploadResult.url,
    file_type: req.file.mimetype,
    file_size: uploadResult.size,
    date: date || new Date(),
    order: (maxOrder || 0) + 1,
  });

  response.created(res, attachment, 'Foto agregada exitosamente');
});

// Obtener todas las fotos de un registro médico
exports.getAttachments = catchAsync(async (req, res) => {
  const { medicalRecordId } = req.params;

  // Verificar que el registro médico existe y pertenece al usuario
  const medicalRecord = await MedicalRecord.findByPk(medicalRecordId, {
    include: [{ model: Pet, as: 'pet' }],
  });

  if (!medicalRecord) {
    return response.notFound(res, 'Registro médico');
  }

  if (medicalRecord.pet.owner_id !== req.user.id) {
    return response.forbidden(res);
  }

  const attachments = await MedicalRecordAttachment.findAll({
    where: { medical_record_id: medicalRecordId },
    order: [['order', 'ASC'], ['created_at', 'ASC']],
  });

  response.success(res, attachments);
});

// Actualizar una foto
exports.updateAttachment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, date, order } = req.body;

  const attachment = await MedicalRecordAttachment.findByPk(id, {
    include: [
      {
        model: MedicalRecord,
        as: 'medicalRecord',
        include: [{ model: Pet, as: 'pet' }],
      },
    ],
  });

  if (!attachment) {
    return response.notFound(res, 'Foto');
  }

  if (attachment.medicalRecord.pet.owner_id !== req.user.id) {
    return response.forbidden(res);
  }

  await attachment.update({
    title: title || attachment.title,
    description: description !== undefined ? description : attachment.description,
    date: date || attachment.date,
    order: order !== undefined ? order : attachment.order,
  });

  response.updated(res, attachment);
});

// Eliminar una foto
exports.deleteAttachment = catchAsync(async (req, res) => {
  const { id } = req.params;

  const attachment = await MedicalRecordAttachment.findByPk(id, {
    include: [
      {
        model: MedicalRecord,
        as: 'medicalRecord',
        include: [{ model: Pet, as: 'pet' }],
      },
    ],
  });

  if (!attachment) {
    return response.notFound(res, 'Foto');
  }

  if (attachment.medicalRecord.pet.owner_id !== req.user.id) {
    return response.forbidden(res);
  }

  // Eliminar archivo de S3
  try {
    const key = s3Service.extractKeyFromUrl(attachment.file_url);
    if (key) {
      await s3Service.deleteFile(key);
    }
  } catch (error) {
    console.error('Error deleting file from S3:', error);
  }

  await attachment.destroy();

  response.deleted(res);
});

// Reordenar fotos
exports.reorderAttachments = catchAsync(async (req, res) => {
  const { medicalRecordId } = req.params;
  const { attachments } = req.body; // Array de { id, order }

  // Verificar que el registro médico existe y pertenece al usuario
  const medicalRecord = await MedicalRecord.findByPk(medicalRecordId, {
    include: [{ model: Pet, as: 'pet' }],
  });

  if (!medicalRecord) {
    return response.notFound(res, 'Registro médico');
  }

  if (medicalRecord.pet.owner_id !== req.user.id) {
    return response.forbidden(res);
  }

  // Actualizar el orden de cada foto
  for (const item of attachments) {
    await MedicalRecordAttachment.update(
      { order: item.order },
      { where: { id: item.id, medical_record_id: medicalRecordId } }
    );
  }

  response.success(res, null, 'Orden actualizado exitosamente');
});
