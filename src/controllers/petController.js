const { Pet, User, PetImage, Vaccine, MedicalRecord, QRCode } = require('../models');
const { catchAsync } = require('../utils/errors');
const response = require('../utils/response');
const s3Service = require('../services/s3Service');
const qrService = require('../services/qrService');
const { S3_CONFIG } = require('../config/aws');

/**
 * Crear nueva mascota
 */
exports.createPet = catchAsync(async (req, res) => {
  const ownerId = req.user.id;
  const petData = req.validatedData;

  // Generar código QR único
  const qrCode = qrService.generateUniqueCode();

  // Crear mascota
  const pet = await Pet.create({
    ...petData,
    owner_id: ownerId,
    qr_code: qrCode,
  });

  // Subir imagen si existe
  if (req.file) {
    const { url } = await s3Service.uploadImage(
      req.file.buffer,
      S3_CONFIG.FOLDERS.PETS,
      `${pet.id}`
    );
    await pet.update({ profile_image_url: url });
  }

  // Generar QR code completo y subirlo a S3
  const qrData = await qrService.createQRCodeForPet(pet.id);

  // Recargar mascota con asociaciones
  const petWithAssociations = await Pet.findByPk(pet.id, {
    include: [{ model: QRCode, as: 'qrCode' }],
  });

  response.created(res, {
    pet: petWithAssociations,
    qrCode: qrData,
  }, 'Mascota creada exitosamente');
});

/**
 * Obtener mascota por ID
 */
exports.getPet = catchAsync(async (req, res) => {
  const pet = await Pet.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
      },
      { model: PetImage, as: 'images' },
      { model: QRCode, as: 'qrCode' },
    ],
  });

  if (!pet) {
    return response.notFound(res, 'Mascota');
  }

  // Agregar edad calculada
  const age = pet.getAge();

  response.success(res, {
    ...pet.toJSON(),
    age,
  });
});

/**
 * Listar mascotas del usuario
 */
exports.listMyPets = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, species } = req.query;
  const offset = (page - 1) * limit;

  const where = { owner_id: req.user.id };

  if (status) where.status = status;
  if (species) where.species = species;

  const { count, rows: pets } = await Pet.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
    include: [{ model: QRCode, as: 'qrCode' }],
  });

  response.successWithPagination(res, pets, {
    page,
    limit,
    total: count,
  });
});

/**
 * Actualizar mascota
 */
exports.updatePet = catchAsync(async (req, res) => {
  const pet = req.pet; // Ya validado por checkOwnership middleware
  await pet.update(req.validatedData);

  response.updated(res, pet, 'Mascota actualizada exitosamente');
});

/**
 * Eliminar mascota
 */
exports.deletePet = catchAsync(async (req, res) => {
  const pet = req.pet;

  // Eliminar imagen de perfil de S3
  if (pet.profile_image_url) {
    const key = s3Service.extractKeyFromUrl(pet.profile_image_url);
    if (key) {
      await s3Service.deleteFile(key);
    }
  }

  // Eliminar imágenes adicionales
  const images = await PetImage.findAll({ where: { pet_id: pet.id } });
  for (const image of images) {
    const key = s3Service.extractKeyFromUrl(image.image_url);
    if (key) {
      await s3Service.deleteFile(key);
    }
  }

  // Eliminar QR de S3
  const qrCode = await QRCode.findOne({ where: { pet_id: pet.id } });
  if (qrCode && qrCode.qr_image_url) {
    const key = s3Service.extractKeyFromUrl(qrCode.qr_image_url);
    if (key) {
      await s3Service.deleteFile(key);
    }
  }

  await pet.destroy();

  response.deleted(res, 'Mascota eliminada exitosamente');
});

/**
 * Subir imagen de mascota
 */
exports.uploadPetImage = catchAsync(async (req, res) => {
  const pet = req.pet;

  if (!req.file) {
    return response.error(res, 'No se recibió imagen', 400);
  }

  const { url, key } = await s3Service.uploadImage(
    req.file.buffer,
    S3_CONFIG.FOLDERS.PETS,
    `${pet.id}`
  );

  // Si es imagen principal, actualizar pet
  if (req.body.is_primary === 'true') {
    // Eliminar imagen anterior
    if (pet.profile_image_url) {
      const oldKey = s3Service.extractKeyFromUrl(pet.profile_image_url);
      if (oldKey) {
        await s3Service.deleteFile(oldKey);
      }
    }
    await pet.update({ profile_image_url: url });
  } else {
    // Agregar como imagen adicional
    await PetImage.create({
      pet_id: pet.id,
      image_url: url,
      image_type: 'general',
      is_primary: false,
    });
  }

  response.success(res, { image_url: url }, 'Imagen subida exitosamente');
});

/**
 * Subir múltiples imágenes
 */
exports.uploadMultiplePetImages = catchAsync(async (req, res) => {
  const pet = req.pet;

  if (!req.files || req.files.length === 0) {
    return response.error(res, 'No se recibieron imágenes', 400);
  }

  const uploadResults = await s3Service.uploadMultipleImages(
    req.files.map(f => f.buffer),
    S3_CONFIG.FOLDERS.PETS,
    `${pet.id}`
  );

  // Crear registros de imágenes
  const images = await Promise.all(
    uploadResults.map(result =>
      PetImage.create({
        pet_id: pet.id,
        image_url: result.url,
        image_type: 'general',
      })
    )
  );

  response.success(res, images, `${images.length} imágenes subidas exitosamente`);
});

/**
 * Eliminar imagen de mascota
 */
exports.deletePetImage = catchAsync(async (req, res) => {
  const { imageId } = req.params;
  const pet = req.pet;

  const image = await PetImage.findOne({
    where: { id: imageId, pet_id: pet.id },
  });

  if (!image) {
    return response.notFound(res, 'Imagen');
  }

  // Eliminar de S3
  const key = s3Service.extractKeyFromUrl(image.image_url);
  if (key) {
    await s3Service.deleteFile(key);
  }

  await image.destroy();

  response.deleted(res, 'Imagen eliminada exitosamente');
});

/**
 * Reportar mascota perdida
 */
exports.reportLostPet = catchAsync(async (req, res) => {
  const pet = req.pet;
  const { lost_date, lost_location } = req.validatedData;

  await pet.update({
    status: 'lost',
    lost_date,
    lost_location,
  });

  // TODO: Enviar notificaciones, crear alerta pública, etc.

  response.success(res, pet, 'Mascota reportada como perdida');
});

/**
 * Marcar mascota como encontrada
 */
exports.markPetAsFound = catchAsync(async (req, res) => {
  const pet = req.pet;

  await pet.update({
    status: 'active',
    lost_date: null,
    lost_location: null,
  });

  response.success(res, pet, 'Mascota marcada como encontrada');
});

/**
 * Obtener historial médico de mascota
 */
exports.getPetMedicalHistory = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows: records } = await MedicalRecord.findAndCountAll({
    where: { pet_id: req.params.id },
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['date', 'DESC']],
  });

  response.successWithPagination(res, records, {
    page,
    limit,
    total: count,
  });
});

/**
 * Obtener vacunas de mascota
 */
exports.getPetVaccines = catchAsync(async (req, res) => {
  const vaccines = await Vaccine.findAll({
    where: { pet_id: req.params.id },
    order: [['administration_date', 'DESC']],
  });

  // Agregar información de días hasta próxima dosis
  const vaccinesWithInfo = vaccines.map(vaccine => ({
    ...vaccine.toJSON(),
    needs_booster: vaccine.needsBooster(),
    days_until_next_dose: vaccine.daysUntilNextDose(),
  }));

  response.success(res, vaccinesWithInfo);
});

/**
 * Descargar QR de mascota
 */
exports.downloadQR = catchAsync(async (req, res) => {
  const pet = req.pet;
  const format = req.query.format || 'buffer';

  const qrBuffer = await qrService.generateQRForDownload(pet.qr_code, format);

  if (format === 'buffer') {
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="qr-${pet.name}.png"`,
    });
    return res.send(qrBuffer);
  }

  if (format === 'base64') {
    return response.success(res, { qr_code: qrBuffer });
  }

  if (format === 'svg') {
    res.set('Content-Type', 'image/svg+xml');
    return res.send(qrBuffer);
  }

  response.error(res, 'Formato no soportado', 400);
});
