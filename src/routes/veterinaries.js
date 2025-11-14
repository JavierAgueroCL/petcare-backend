const express = require('express');
const router = express.Router();
const veterinaryController = require('../controllers/veterinaryController');
const { jwtCheck, checkUserExists, checkRole } = require('../middleware/auth');

// Rutas públicas (autenticadas pero cualquier usuario)
router.get('/', jwtCheck, checkUserExists, veterinaryController.getVeterinaries);
router.get('/:id', jwtCheck, checkUserExists, veterinaryController.getVeterinary);

// Rutas admin (solo administradores pueden crear/modificar veterinarias)
router.post('/', jwtCheck, checkUserExists, checkRole(['admin']), veterinaryController.createVeterinary);
router.put('/:id', jwtCheck, checkUserExists, checkRole(['admin']), veterinaryController.updateVeterinary);
router.delete('/:id', jwtCheck, checkUserExists, checkRole(['admin']), veterinaryController.deleteVeterinary);

module.exports = router;
