const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../validators/authValidator');

// Rutas públicas (sin autenticación)
router.post('/login', validateLogin, authController.login);
router.post('/register', validateRegister, authController.register);

// Ruta para validar token (opcional)
router.get('/validate', authController.validateToken);

module.exports = router;
