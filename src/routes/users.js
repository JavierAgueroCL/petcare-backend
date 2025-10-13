const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { jwtCheck, checkUserExists, checkRole } = require('../middleware/auth');
const { uploadSingleImage } = require('../middleware/upload');
const { validateUpdate } = require('../validators/userValidator');

// Todas las rutas requieren autenticación
router.use(jwtCheck);
router.use(checkUserExists);

// Rutas de perfil propio
router.get('/me', userController.getProfile);
router.put('/me', validateUpdate, userController.updateProfile);
router.post('/me/image', uploadSingleImage, userController.uploadProfileImage);
router.delete('/me/image', userController.deleteProfileImage);

// Rutas de configuración de usuario
router.get('/settings/notifications', userController.getNotificationSettings);
router.put('/settings/notifications', userController.updateNotificationSettings);
router.get('/settings/preferences', userController.getPreferences);
router.put('/settings/preferences', userController.updatePreferences);
router.put('/settings/language', userController.updateLanguage);

// Rutas administrativas (solo admin)
router.get('/', checkRole(['admin']), userController.listUsers);
router.get('/:id', checkRole(['admin']), userController.getUserById);
router.put('/:id/role', checkRole(['admin']), userController.updateUserRole);
router.post('/:id/deactivate', checkRole(['admin']), userController.deactivateUser);
router.post('/:id/activate', checkRole(['admin']), userController.activateUser);

module.exports = router;
