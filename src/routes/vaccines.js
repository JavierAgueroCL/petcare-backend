const express = require('express');
const router = express.Router();
const vaccineController = require('../controllers/vaccineController');
const { jwtCheck, checkUserExists } = require('../middleware/auth');
const { validateCreateVaccine, validateUpdateVaccine } = require('../validators/medicalValidator');

router.use(jwtCheck);
router.use(checkUserExists);

// Crear vacuna para una mascota
router.post('/pets/:petId/vaccines', validateCreateVaccine, vaccineController.createVaccine);

// Próximas vacunas del usuario
router.get('/upcoming', vaccineController.getUpcomingVaccines);

// CRUD de vacunas
router.get('/:id', vaccineController.getVaccine);
router.put('/:id', validateUpdateVaccine, vaccineController.updateVaccine);
router.delete('/:id', vaccineController.deleteVaccine);

module.exports = router;
