const multer = require('multer');

// Configurar multer para almacenar archivos en memoria
const storage = multer.memoryStorage();

/**
 * Filtro para validar que solo sean imágenes
 */
const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Tipo de archivo no permitido. Solo se aceptan: ${allowedMimeTypes.join(', ')}`
      ),
      false
    );
  }
};

/**
 * Filtro para validar documentos (PDFs e imágenes)
 */
const documentFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Tipo de archivo no permitido. Solo se aceptan: ${allowedMimeTypes.join(', ')}`
      ),
      false
    );
  }
};

/**
 * Middleware para upload de una sola imagen
 * Límite: 10MB
 */
const uploadSingleImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024,
  },
}).single('image');

/**
 * Middleware para upload de múltiples imágenes
 * Límite: 5 imágenes, 10MB cada una
 */
const uploadMultipleImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024,
    files: parseInt(process.env.MAX_IMAGES_PER_PET || '5'),
  },
}).array('images', parseInt(process.env.MAX_IMAGES_PER_PET || '5'));

/**
 * Middleware para upload de documentos
 * Límite: 20MB
 */
const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
}).single('document');

/**
 * Middleware para upload de fotos/documentos médicos
 * Límite: 20MB
 */
const uploadMedicalDocument = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});

/**
 * Middleware de manejo de errores de multer
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Errores específicos de Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Archivo demasiado grande',
        message: `El archivo no debe superar ${
          parseInt(process.env.MAX_FILE_SIZE_MB || '10')
        }MB`,
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Demasiados archivos',
        message: `Solo se permiten hasta ${
          parseInt(process.env.MAX_IMAGES_PER_PET || '5')
        } archivos`,
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Campo de archivo inesperado',
        message: 'El campo del archivo no coincide con el esperado',
      });
    }

    return res.status(400).json({
      error: 'Error de upload',
      message: err.message,
    });
  }

  if (err) {
    // Otros errores (ej: filtro de tipo de archivo)
    return res.status(400).json({
      error: 'Error de validación',
      message: err.message,
    });
  }

  next();
};

/**
 * Wrapper para manejar errores de multer automáticamente
 */
const wrapMulter = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  };
};

module.exports = {
  uploadSingleImage: wrapMulter(uploadSingleImage),
  uploadMultipleImages: wrapMulter(uploadMultipleImages),
  uploadDocument: wrapMulter(uploadDocument),
  uploadMedicalDocument,
  handleMulterError,
};
