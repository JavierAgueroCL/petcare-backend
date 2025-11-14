const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { jwtCheck, checkUserExists, optionalAuth } = require('../middleware/auth');

// Endpoint público para obtener información de mascota por ID (usado por QR escaneado)
router.get('/pet/:petId', qrController.getPetByIdPublic);

// Escaneo de QR por código - público (con auth opcional para más info)
router.get('/:code', optionalAuth, qrController.scanQR);

// Rutas que requieren autenticación
router.use(jwtCheck);
router.use(checkUserExists);

// Generar o obtener QR de una mascota
router.post('/pets/:petId/generate', qrController.generatePetQR);

// Descargar QR como imagen
router.get('/pets/:petId/download', qrController.downloadPetQR);

// Regenerar QR
router.post('/pets/:petId/regenerate', qrController.regenerateQR);

// Historial de escaneos
router.get('/pets/:petId/scans', qrController.getQRScans);

module.exports = router;
