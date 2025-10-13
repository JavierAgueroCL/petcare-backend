module.exports = (sequelize, DataTypes) => {
  const QRCode = sequelize.define('QRCode', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    pet_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      references: {
        model: 'pets',
        key: 'id',
      },
    },
    qr_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    qr_image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Imagen del QR en S3',
    },
    total_scans: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_scanned_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'qr_codes',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['qr_code'] },
    ],
  });

  QRCode.associate = (models) => {
    QRCode.belongsTo(models.Pet, {
      foreignKey: 'pet_id',
      as: 'pet',
    });
  };

  // Método para registrar un escaneo
  QRCode.prototype.recordScan = async function() {
    this.total_scans += 1;
    this.last_scanned_at = new Date();
    await this.save();
  };

  return QRCode;
};
