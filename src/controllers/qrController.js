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
