const express = require('express');
const router = express.Router();
const legalContentController = require('../controllers/legalContentController');
// const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route GET /api/legal/:type
 * @desc Obtener contenido legal activo (términos o política de privacidad)
 * @access Public
 */
router.get('/:type', legalContentController.getLegalContent);

/**
 * @route POST /api/legal
 * @desc Crear o actualizar contenido legal (solo admin)
 * @access Private (Admin)
 */
// router.post('/', authenticate, authorize(['admin']), legalContentController.createOrUpdateLegalContent);
router.post('/', legalContentController.createOrUpdateLegalContent);

/**
 * @route GET /api/legal/:type/versions
 * @desc Obtener todas las versiones de un tipo de contenido (solo admin)
 * @access Private (Admin)
 */
// router.get('/:type/versions', authenticate, authorize(['admin']), legalContentController.getAllVersions);
router.get('/:type/versions', legalContentController.getAllVersions);

module.exports = router;
