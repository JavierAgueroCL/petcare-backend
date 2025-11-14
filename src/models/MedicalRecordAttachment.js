module.exports = (sequelize, DataTypes) => {
  const MedicalRecordAttachment = sequelize.define('MedicalRecordAttachment', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    medical_record_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'medical_records',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Título de la imagen/documento',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción de la imagen/documento',
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'URL del archivo en S3',
    },
    file_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Tipo de archivo (image/jpeg, image/png, application/pdf, etc.)',
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tamaño del archivo en bytes',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Fecha asociada a la imagen/documento',
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Orden de visualización',
    },
  }, {
    tableName: 'medical_record_attachments',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['medical_record_id'] },
      { fields: ['date'] },
    ],
  });

  MedicalRecordAttachment.associate = (models) => {
    MedicalRecordAttachment.belongsTo(models.MedicalRecord, {
      foreignKey: 'medical_record_id',
      as: 'medicalRecord',
    });
  };

  return MedicalRecordAttachment;
};
