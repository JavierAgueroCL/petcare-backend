const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { jwtCheck, checkUserExists, checkOwnership } = require('../middleware/auth');
const { uploadSingleImage, uploadMultipleImages } = require('../middleware/upload');
const {
  validateCreatePet,
  validateUpdatePet,
  validateReportLostPet,
} = require('../validators/petValidator');

// Todas las rutas requieren autenticación
router.use(jwtCheck);
router.use(checkUserExists);

// Rutas de listado y creación
router.get('/', petController.listMyPets);
router.post('/', uploadSingleImage, validateCreatePet, petController.createPet);

// Rutas específicas de mascota (requieren ownership)
router.get('/:id', checkOwnership('pet'), petController.getPet);
router.put('/:id', checkOwnership('pet'), validateUpdatePet, petController.updatePet);
router.delete('/:id', checkOwnership('pet'), petController.deletePet);

// Imágenes
router.post('/:id/images', checkOwnership('pet'), uploadSingleImage, petController.uploadPetImage);
router.post('/:id/images/multiple', checkOwnership('pet'), uploadMultipleImages, petController.uploadMultiplePetImages);
router.delete('/:id/images/:imageId', checkOwnership('pet'), petController.deletePetImage);

// Mascota perdida
router.post('/:id/lost', checkOwnership('pet'), validateReportLostPet, petController.reportLostPet);
router.post('/:id/found', checkOwnership('pet'), petController.markPetAsFound);

// Historial médico y vacunas
router.get('/:id/medical-history', checkOwnership('pet'), petController.getPetMedicalHistory);
router.get('/:id/vaccines', checkOwnership('pet'), petController.getPetVaccines);

// QR Code
router.get('/:id/qr/download', checkOwnership('pet'), petController.downloadQR);

module.exports = router;
