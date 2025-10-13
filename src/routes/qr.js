const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { jwtCheck, checkUserExists, optionalAuth } = require('../middleware/auth');

// Escaneo de QR - público (con auth opcional para más info)
router.get('/:code', optionalAuth, qrController.scanQR);

// Rutas que requieren autenticación
router.use(jwtCheck);
router.use(checkUserExists);

// Regenerar QR
router.post('/pets/:petId/regenerate', qrController.regenerateQR);

// Historial de escaneos
router.get('/pets/:petId/scans', qrController.getQRScans);

module.exports = router;
