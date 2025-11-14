const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { jwtCheck, checkUserExists, isAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(jwtCheck);
router.use(checkUserExists);

// Obtener notificaciones del usuario
router.get('/', notificationController.getNotifications);

// Obtener contador de notificaciones no leídas
router.get('/unread-count', notificationController.getUnreadCount);

// Marcar todas las notificaciones como leídas
router.post('/mark-all-read', notificationController.markAllAsRead);

// Marcar una notificación como leída
router.put('/:id/read', notificationController.markAsRead);

// Eliminar una notificación
router.delete('/:id', notificationController.deleteNotification);

// Crear recordatorio personal (usuarios normales)
router.post('/', notificationController.createUserNotification);

// Crear notificación (solo admin o para uso interno)
router.post('/admin', isAdmin, notificationController.createNotification);

module.exports = router;
