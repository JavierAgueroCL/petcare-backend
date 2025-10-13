module.exports = (sequelize, DataTypes) => {
  const MedicalRecord = sequelize.define('MedicalRecord', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    pet_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'pets',
        key: 'id',
      },
    },
    veterinarian_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'veterinarians',
        key: 'id',
      },
    },
    clinic_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'veterinary_clinics',
        key: 'id',
      },
    },
    record_type: {
      type: DataTypes.ENUM('consultation', 'surgery', 'emergency', 'vaccination', 'checkup', 'other'),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    treatment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prescriptions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    weight_kg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    temperature_celsius: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
    },
    heart_rate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    next_appointment: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array de URLs de documentos en S3',
      get() {
        const rawValue = this.getDataValue('attachments');
        return rawValue ? JSON.parse(rawValue) : [];
      },
    },
    is_encrypted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Datos sensibles encriptados',
    },
  }, {
    tableName: 'medical_records',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['pet_id'] },
      { fields: ['date'] },
      { fields: ['record_type'] },
    ],
  });

  MedicalRecord.associate = (models) => {
    MedicalRecord.belongsTo(models.Pet, {
      foreignKey: 'pet_id',
      as: 'pet',
    });

    // Si tienes modelo Veterinarian
    // MedicalRecord.belongsTo(models.Veterinarian, {
    //   foreignKey: 'veterinarian_id',
    //   as: 'veterinarian',
    // });

    // Si tienes modelo VeterinaryClinic
    // MedicalRecord.belongsTo(models.VeterinaryClinic, {
    //   foreignKey: 'clinic_id',
    //   as: 'clinic',
    // });
  };

  // Hook para encriptar datos sensibles antes de guardar
  MedicalRecord.beforeSave(async (record) => {
    if (record.changed('diagnosis') || record.changed('treatment')) {
      // Aquí implementarías la lógica de encriptación si is_encrypted es true
      // const crypto = require('crypto');
      // if (record.is_encrypted) {
      //   record.diagnosis = encrypt(record.diagnosis);
      //   record.treatment = encrypt(record.treatment);
      // }
    }
  });

  return MedicalRecord;
};
