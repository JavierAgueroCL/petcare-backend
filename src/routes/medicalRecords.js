const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { jwtCheck, checkUserExists, checkRole } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/upload');
const { validateCreateMedicalRecord } = require('../validators/medicalValidator');

router.use(jwtCheck);
router.use(checkUserExists);

// Obtener registros médicos de una mascota
router.get('/pets/:petId/medical-records', medicalRecordController.getPetMedicalRecords);

// Crear registro médico para una mascota
router.post('/pets/:petId/medical-records', validateCreateMedicalRecord, medicalRecordController.createMedicalRecord);

// CRUD de registros médicos
router.get('/:id', medicalRecordController.getMedicalRecord);
router.put('/:id', validateCreateMedicalRecord, medicalRecordController.updateMedicalRecord);
router.delete('/:id', medicalRecordController.deleteMedicalRecord);

// Upload de documentos médicos
router.post('/:id/document', uploadDocument, medicalRecordController.uploadMedicalDocument);

module.exports = router;
