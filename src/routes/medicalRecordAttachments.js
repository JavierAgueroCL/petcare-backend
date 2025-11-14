const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/medicalRecordAttachmentController');
const { jwtCheck, checkUserExists } = require('../middleware/auth');
const { uploadMedicalDocument } = require('../middleware/upload');

// Todas las rutas requieren autenticación
router.use(jwtCheck);
router.use(checkUserExists);

// Agregar foto a un registro médico
router.post(
  '/medical-records/:medicalRecordId/photos',
  uploadMedicalDocument.single('photo'),
  attachmentController.addAttachment
);

// Obtener todas las fotos de un registro médico
router.get('/medical-records/:medicalRecordId/photos', attachmentController.getAttachments);

// Actualizar una foto
router.put('/photos/:id', attachmentController.updateAttachment);

// Eliminar una foto
router.delete('/photos/:id', attachmentController.deleteAttachment);

// Reordenar fotos
router.post('/medical-records/:medicalRecordId/photos/reorder', attachmentController.reorderAttachments);

module.exports = router;
