const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const s3Service = require('./s3Service');
const { S3_CONFIG } = require('../config/aws');

class QRService {
  /**
   * Generar código QR único
   * @returns {String} - Código único
   */
  generateUniqueCode() {
    // Generar UUID y tomar los primeros 12 caracteres
    const uuid = uuidv4().replace(/-/g, '');
    return uuid.substring(0, 12).toUpperCase();
  }

  /**
   * Generar imagen QR como buffer
   * @param {String} code - Código a codificar
   * @param {Object} options - Opciones de generación
   * @returns {Buffer} - Imagen QR en buffer
   */
  async generateQRImage(code, options = {}) {
    try {
      const {
        width = 300,
        margin = 2,
        color = {
          dark: '#000000',
          light: '#FFFFFF',
        },
      } = options;

      // Construir URL del QR
      const qrUrl = `${process.env.QR_CODE_BASE_URL || 'https://petcare.cl/qr/'}${code}`;

      // Generar QR como buffer
      const qrBuffer = await QRCode.toBuffer(qrUrl, {
        width,
        margin,
        color,
        type: 'png',
        errorCorrectionLevel: 'H', // Alto nivel de corrección de errores
      });

      return qrBuffer;
    } catch (error) {
      console.error('Error generating QR image:', error);
      throw new Error(`Error al generar imagen QR: ${error.message}`);
    }
  }

  /**
   * Generar QR y subirlo a S3
   * @param {String} code - Código del QR
   * @param {String} petId - ID de la mascota
   * @returns {Object} - URL del QR en S3
   */
  async generateAndUploadQR(code, petId) {
    try {
      // Generar imagen QR
      const qrBuffer = await this.generateQRImage(code);

      // Subir a S3
      const result = await s3Service.uploadDocument(
        qrBuffer,
        `qr-${code}.png`,
        S3_CONFIG.FOLDERS.GENERAL,
        `qr-codes/${petId}`,
        'image/png'
      );

      // Construir URL pública
      const baseUrl = process.env.S3_BASE_URL || `https://${S3_CONFIG.BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;
      const url = `${baseUrl}/${result.key}`;

      return {
        url,
        key: result.key,
      };
    } catch (error) {
      console.error('Error generating and uploading QR:', error);
      throw new Error(`Error al generar y subir QR: ${error.message}`);
    }
  }

  /**
   * Crear código QR completo para una mascota
   * @param {Number} petId - ID de la mascota
   * @returns {Object} - Código QR generado
   */
  async createQRCodeForPet(petId) {
    try {
      const { QRCode: QRCodeModel } = require('../models');

      // Generar código único
      let code = this.generateUniqueCode();

      // Verificar que sea único (muy improbable colisión pero por seguridad)
      let exists = await QRCodeModel.findOne({ where: { qr_code: code } });
      while (exists) {
        code = this.generateUniqueCode();
        exists = await QRCodeModel.findOne({ where: { qr_code: code } });
      }

      // Generar y subir imagen QR
      const { url, key } = await this.generateAndUploadQR(code, petId);

      // Crear registro en BD
      const qrCode = await QRCodeModel.create({
        pet_id: petId,
        qr_code: code,
        qr_image_url: url,
      });

      return {
        id: qrCode.id,
        code: qrCode.qr_code,
        imageUrl: qrCode.qr_image_url,
        publicUrl: `${process.env.QR_CODE_BASE_URL || 'https://petcare.cl/qr/'}${code}`,
      };
    } catch (error) {
      console.error('Error creating QR code for pet:', error);
      throw new Error(`Error al crear código QR: ${error.message}`);
    }
  }

  /**
   * Obtener información de mascota desde código QR
   * @param {String} code - Código QR
   * @returns {Object} - Información de la mascota
   */
  async getPetByQRCode(code) {
    try {
      const { QRCode: QRCodeModel, Pet, User } = require('../models');

      const qrCode = await QRCodeModel.findOne({
        where: { qr_code: code },
        include: [
          {
            model: Pet,
            as: 'pet',
            include: [
              {
                model: User,
                as: 'owner',
                attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
              },
            ],
          },
        ],
      });

      if (!qrCode) {
        return null;
      }

      // Registrar escaneo
      await qrCode.recordScan();

      return {
        pet: qrCode.pet,
        totalScans: qrCode.total_scans,
        lastScannedAt: qrCode.last_scanned_at,
      };
    } catch (error) {
      console.error('Error getting pet by QR code:', error);
      throw new Error(`Error al obtener mascota por QR: ${error.message}`);
    }
  }

  /**
   * Regenerar código QR (en caso de pérdida o robo)
   * @param {Number} petId - ID de la mascota
   * @returns {Object} - Nuevo código QR
   */
  async regenerateQRCode(petId) {
    try {
      const { QRCode: QRCodeModel } = require('../models');

      // Buscar QR existente
      const oldQRCode = await QRCodeModel.findOne({
        where: { pet_id: petId },
      });

      if (oldQRCode) {
        // Eliminar imagen antigua de S3
        if (oldQRCode.qr_image_url) {
          const key = s3Service.extractKeyFromUrl(oldQRCode.qr_image_url);
          if (key) {
            await s3Service.deleteFile(key);
          }
        }

        // Eliminar registro antiguo
        await oldQRCode.destroy();
      }

      // Crear nuevo QR
      return await this.createQRCodeForPet(petId);
    } catch (error) {
      console.error('Error regenerating QR code:', error);
      throw new Error(`Error al regenerar código QR: ${error.message}`);
    }
  }

  /**
   * Generar QR para descarga (sin guardar en BD)
   * @param {String} code - Código a codificar
   * @param {String} format - Formato de salida ('buffer', 'base64', 'dataURL')
   * @returns {Buffer|String} - QR en el formato solicitado
   */
  async generateQRForDownload(code, format = 'buffer') {
    try {
      const qrUrl = `${process.env.QR_CODE_BASE_URL || 'https://petcare.cl/qr/'}${code}`;

      switch (format) {
        case 'buffer':
          return await QRCode.toBuffer(qrUrl, {
            width: 500,
            margin: 2,
            errorCorrectionLevel: 'H',
          });

        case 'base64':
          return await QRCode.toDataURL(qrUrl, {
            width: 500,
            margin: 2,
            errorCorrectionLevel: 'H',
          });

        case 'svg':
          return await QRCode.toString(qrUrl, {
            type: 'svg',
            errorCorrectionLevel: 'H',
          });

        default:
          throw new Error(`Formato no soportado: ${format}`);
      }
    } catch (error) {
      console.error('Error generating QR for download:', error);
      throw new Error(`Error al generar QR para descarga: ${error.message}`);
    }
  }
}

module.exports = new QRService();
