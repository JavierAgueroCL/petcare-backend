const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, S3_CONFIG, getS3Key, getS3Url } = require('../config/aws');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

class S3Service {
  /**
   * Subir imagen optimizada a S3
   * @param {Buffer} fileBuffer - Buffer del archivo
   * @param {String} folder - Carpeta dentro del bucket (ej: 'pets', 'medical')
   * @param {String} subfolder - Subcarpeta opcional (ej: ID del pet)
   * @param {Object} options - Opciones de optimización
   * @returns {Object} - URL y key del archivo
   */
  async uploadImage(fileBuffer, folder, subfolder = '', options = {}) {
    try {
      const {
        width = 1200,
        height = 1200,
        quality = 85,
        format = 'jpeg',
      } = options;

      // Optimizar imagen con sharp
      let optimizedImage = sharp(fileBuffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        });

      // Aplicar formato
      if (format === 'jpeg') {
        optimizedImage = optimizedImage.jpeg({ quality });
      } else if (format === 'png') {
        optimizedImage = optimizedImage.png({ quality });
      } else if (format === 'webp') {
        optimizedImage = optimizedImage.webp({ quality });
      }

      const buffer = await optimizedImage.toBuffer();

      // Construir key: folder/subfolder/uuid.ext
      const uniqueFileName = `${uuidv4()}.${format}`;
      const key = subfolder
        ? getS3Key(folder, `${subfolder}/${uniqueFileName}`)
        : getS3Key(folder, uniqueFileName);

      const contentType = `image/${format}`;

      // Subir a S3
      const command = new PutObjectCommand({
        Bucket: S3_CONFIG.BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read', // Hacer la imagen públicamente accesible
      });

      await s3Client.send(command);

      // Construir URL pública
      const baseUrl = process.env.S3_BASE_URL || `https://${S3_CONFIG.BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;
      const url = `${baseUrl}/${key}`;

      return {
        url,
        key,
        bucket: S3_CONFIG.BUCKET_NAME,
        size: buffer.length,
      };
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw new Error(`Error al subir imagen: ${error.message}`);
    }
  }

  /**
   * Subir documento (PDF, etc) a S3
   * @param {Buffer} fileBuffer - Buffer del archivo
   * @param {String} originalName - Nombre original del archivo
   * @param {String} folder - Carpeta dentro del bucket (ej: 'medical', 'certificates')
   * @param {String} subfolder - Subcarpeta opcional
   * @param {String} contentType - Tipo MIME
   * @returns {Object} - Key y bucket del archivo
   */
  async uploadDocument(fileBuffer, originalName, folder, subfolder = '', contentType) {
    try {
      // Sanitizar nombre de archivo
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${uuidv4()}-${sanitizedName}`;
      const key = subfolder
        ? getS3Key(folder, `${subfolder}/${uniqueFileName}`)
        : getS3Key(folder, uniqueFileName);

      const command = new PutObjectCommand({
        Bucket: S3_CONFIG.BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'public-read', // Hacer el documento públicamente accesible
      });

      await s3Client.send(command);

      return {
        key,
        bucket: S3_CONFIG.BUCKET_NAME,
        size: fileBuffer.length,
      };
    } catch (error) {
      console.error('Error uploading document to S3:', error);
      throw new Error(`Error al subir documento: ${error.message}`);
    }
  }

  /**
   * Generar URL firmada para acceso temporal a archivos privados
   * @param {String} key - Key del archivo en S3
   * @param {Number} expiresIn - Tiempo de expiración en segundos (default: 1 hora)
   * @returns {String} - URL firmada
   */
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: S3_CONFIG.BUCKET_NAME,
        Key: key,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error(`Error al generar URL de acceso: ${error.message}`);
    }
  }

  /**
   * Eliminar archivo de S3
   * @param {String} key - Key del archivo
   * @returns {Boolean}
   */
  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: S3_CONFIG.BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error(`Error al eliminar archivo: ${error.message}`);
    }
  }

  /**
   * Subir múltiples imágenes en paralelo
   * @param {Array} files - Array de buffers
   * @param {String} folder - Carpeta dentro del bucket (ej: 'pets')
   * @param {String} subfolder - Subcarpeta opcional
   * @param {Object} options - Opciones de optimización
   * @returns {Array} - Array de resultados
   */
  async uploadMultipleImages(files, folder, subfolder = '', options = {}) {
    try {
      const uploadPromises = files.map(file =>
        this.uploadImage(file, folder, subfolder, options)
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error(`Error al subir imágenes: ${error.message}`);
    }
  }

  /**
   * Extraer key de una URL de S3
   * @param {String} url - URL completa de S3
   * @returns {String} - Key del archivo
   */
  extractKeyFromUrl(url) {
    try {
      const urlObj = new URL(url);
      // Remover el primer '/' del pathname
      return urlObj.pathname.substring(1);
    } catch (error) {
      return null;
    }
  }

  /**
   * Verificar si un archivo existe en S3
   * @param {String} key - Key del archivo
   * @returns {Boolean}
   */
  async fileExists(key) {
    try {
      const command = new GetObjectCommand({
        Bucket: S3_CONFIG.BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }
}

module.exports = new S3Service();
