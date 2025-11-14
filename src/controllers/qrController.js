const qrService = require('../services/qrService');
const { catchAsync } = require('../utils/errors');
const response = require('../utils/response');

/**
 * Obtener información de mascota por código QR
 * Endpoint público para escaneo de QR
 */
exports.scanQR = catchAsync(async (req, res) => {
  const { code } = req.params;

  const result = await qrService.getPetByQRCode(code);

  if (!result) {
    return response.notFound(res, 'Código QR');
  }

  // No exponer datos sensibles del dueño si no está autenticado
  const petData = result.pet.toJSON();

  // Si no hay usuario autenticado o no es el dueño, limitar información
  if (!req.user || req.user.id !== petData.owner.id) {
    petData.owner = {
      first_name: petData.owner.first_name,
      phone: petData.owner.phone, // Para contacto en caso de mascota perdida
    };
    // No exponer email completo
    delete petData.special_needs; // Información privada
  }

  response.success(res, {
    pet: petData,
    total_scans: result.totalScans,
    last_scanned_at: result.lastScannedAt,
  });
});

/**
 * Obtener información de mascota por ID (para la URL del QR)
 * Endpoint público que será usado por el QR escaneado
 */
exports.getPetByIdPublic = catchAsync(async (req, res) => {
  const { petId } = req.params;
  const { Pet, User, QRCode } = require('../models');

  const pet = await Pet.findByPk(petId, {
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['id', 'first_name', 'last_name', 'phone'],
      },
    ],
  });

  if (!pet) {
    return response.notFound(res, 'Mascota');
  }

  // Registrar escaneo si existe código QR
  const qrCode = await QRCode.findOne({ where: { pet_id: petId } });
  if (qrCode) {
    await qrCode.recordScan();
  }

  // Preparar datos públicos de la mascota
  const petData = {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    gender: pet.gender,
    color: pet.color,
    profile_image_url: pet.profile_image_url,
    owner: {
      name: `${pet.owner.first_name} ${pet.owner.last_name}`,
      phone: pet.owner.phone,
    },
  };

  // Calcular edad si existe
  if (pet.date_of_birth || pet.estimated_age_months) {
    const age = pet.getAge();
    if (age) {
      petData.age = age.years > 0 ? `${age.years} años` : `${age.months} meses`;
    }
  }

  response.success(res, petData);
});

/**
 * Regenerar código QR de una mascota
 */
exports.regenerateQR = catchAsync(async (req, res) => {
  const { petId } = req.params;
  const { Pet } = require('../models');

  const pet = await Pet.findOne({
    where: { id: petId, owner_id: req.user.id },
  });

  if (!pet) {
    return response.notFound(res, 'Mascota');
  }

  const newQRCode = await qrService.regenerateQRCode(petId);

  // Actualizar código en mascota
  await pet.update({ qr_code: newQRCode.code });

  response.success(res, newQRCode, 'Código QR regenerado exitosamente');
});

/**
 * Obtener historial de escaneos de QR
 */
exports.getQRScans = catchAsync(async (req, res) => {
  const { petId } = req.params;
  const { QRCode, Pet } = require('../models');

  const pet = await Pet.findOne({
    where: { id: petId, owner_id: req.user.id },
  });

  if (!pet) {
    return response.notFound(res, 'Mascota');
  }

  const qrCode = await QRCode.findOne({
    where: { pet_id: petId },
  });

  if (!qrCode) {
    return response.notFound(res, 'Código QR');
  }

  response.success(res, {
    qr_code: qrCode.qr_code,
    total_scans: qrCode.total_scans,
    last_scanned_at: qrCode.last_scanned_at,
  });
});

/**
 * Generar QR para una mascota (si no existe) o obtener el existente
 */
exports.generatePetQR = catchAsync(async (req, res) => {
  const { petId } = req.params;
  const { Pet, QRCode } = require('../models');

  const pet = await Pet.findOne({
    where: { id: petId, owner_id: req.user.id },
  });

  if (!pet) {
    return response.notFound(res, 'Mascota');
  }

  // Verificar si ya tiene un QR
  let qrCode = await QRCode.findOne({
    where: { pet_id: petId },
  });

  if (qrCode) {
    // Ya tiene QR, devolver el existente
    return response.success(res, {
      id: qrCode.id,
      code: qrCode.qr_code,
      imageUrl: qrCode.qr_image_url,
      publicUrl: `http://petcare.shop/qr/${petId}`,
    });
  }

  // Generar nuevo QR
  const newQRCode = await qrService.createQRCodeForPet(petId);

  response.success(res, newQRCode, 'Código QR generado exitosamente');
});

/**
 * Descargar QR como imagen
 */
exports.downloadPetQR = catchAsync(async (req, res) => {
  const { petId } = req.params;
  const { Pet } = require('../models');

  const pet = await Pet.findOne({
    where: { id: petId, owner_id: req.user.id },
  });

  if (!pet) {
    return response.notFound(res, 'Mascota');
  }

  // Generar QR en formato base64
  const qrBase64 = await qrService.generateQRForDownload(petId, 'base64');

  response.success(res, {
    qr_image: qrBase64,
    pet_name: pet.name,
    url: `http://petcare.shop/qr/${petId}`,
  });
});
