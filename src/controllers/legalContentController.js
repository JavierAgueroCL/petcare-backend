const { LegalContent } = require('../models');

/**
 * Obtener el contenido legal activo por tipo
 * @route GET /api/legal/:type
 */
exports.getLegalContent = async (req, res) => {
  try {
    const { type } = req.params;

    if (!['terms', 'privacy'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo inválido. Debe ser "terms" o "privacy"',
      });
    }

    const content = await LegalContent.findOne({
      where: {
        type,
        is_active: true,
      },
      order: [['created_at', 'DESC']],
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Contenido no encontrado',
      });
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Error al obtener contenido legal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el contenido legal',
      error: error.message,
    });
  }
};

/**
 * Crear o actualizar contenido legal (admin)
 * @route POST /api/legal
 */
exports.createOrUpdateLegalContent = async (req, res) => {
  try {
    const { type, content, version, effective_date } = req.body;

    if (!['terms', 'privacy'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo inválido. Debe ser "terms" o "privacy"',
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'El contenido es requerido',
      });
    }

    // Desactivar versiones anteriores
    await LegalContent.update(
      { is_active: false },
      { where: { type, is_active: true } }
    );

    // Crear nueva versión
    const newContent = await LegalContent.create({
      type,
      content,
      version: version || '1.0.0',
      effective_date: effective_date || new Date(),
      is_active: true,
    });

    res.status(201).json({
      success: true,
      message: 'Contenido legal creado exitosamente',
      data: newContent,
    });
  } catch (error) {
    console.error('Error al crear contenido legal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el contenido legal',
      error: error.message,
    });
  }
};

/**
 * Obtener todas las versiones de un tipo de contenido (admin)
 * @route GET /api/legal/:type/versions
 */
exports.getAllVersions = async (req, res) => {
  try {
    const { type } = req.params;

    if (!['terms', 'privacy'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo inválido. Debe ser "terms" o "privacy"',
      });
    }

    const versions = await LegalContent.findAll({
      where: { type },
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: versions,
    });
  } catch (error) {
    console.error('Error al obtener versiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las versiones',
      error: error.message,
    });
  }
};
