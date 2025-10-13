const { S3Client } = require('@aws-sdk/client-s3');

// Configurar cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configuración de S3: Un solo bucket con diferentes carpetas
const S3_CONFIG = {
  BUCKET_NAME: process.env.S3_BUCKET_NAME || 'petcare-files',
  FOLDERS: {
    PETS: process.env.S3_FOLDER_PETS || 'pets',
    MEDICAL: process.env.S3_FOLDER_MEDICAL || 'medical',
    CERTIFICATES: process.env.S3_FOLDER_CERTIFICATES || 'certificates',
    PRODUCTS: process.env.S3_FOLDER_PRODUCTS || 'products',
    GENERAL: process.env.S3_FOLDER_GENERAL || 'general',
  },
};

/**
 * Construye la ruta completa (key) para un archivo en S3
 * @param {string} folder - Carpeta dentro del bucket (ej: 'pets', 'medical')
 * @param {string} filename - Nombre del archivo
 * @returns {string} - Ruta completa en S3 (ej: 'pets/imagen.jpg')
 */
const getS3Key = (folder, filename) => {
  return `${folder}/${filename}`;
};

/**
 * Obtiene la URL pública de un archivo en S3
 * @param {string} folder - Carpeta dentro del bucket
 * @param {string} filename - Nombre del archivo
 * @returns {string} - URL completa del archivo
 */
const getS3Url = (folder, filename) => {
  const baseUrl = process.env.S3_BASE_URL || `https://${S3_CONFIG.BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;
  return `${baseUrl}/${folder}/${filename}`;
};

module.exports = {
  s3Client,
  S3_CONFIG,
  getS3Key,
  getS3Url,
};
