module.exports = (sequelize, DataTypes) => {
  const Vaccine = sequelize.define('Vaccine', {
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
    medical_record_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'medical_records',
        key: 'id',
      },
    },
    vaccine_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    vaccine_type: {
      type: DataTypes.ENUM(
        'rabies',
        'distemper',
        'parvovirus',
        'hepatitis',
        'leptospirosis',
        'kennel_cough',
        'feline_leukemia',
        'other'
      ),
      allowNull: false,
    },
    manufacturer: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    batch_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    administration_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    next_dose_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Fecha de próxima dosis/refuerzo',
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
    certificate_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'PDF del certificado en S3',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'vaccines',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['pet_id'] },
      { fields: ['next_dose_date'] },
      { fields: ['vaccine_type'] },
    ],
  });

  Vaccine.associate = (models) => {
    Vaccine.belongsTo(models.Pet, {
      foreignKey: 'pet_id',
      as: 'pet',
    });

    Vaccine.belongsTo(models.MedicalRecord, {
      foreignKey: 'medical_record_id',
      as: 'medicalRecord',
    });
  };

  // Método para verificar si necesita refuerzo
  Vaccine.prototype.needsBooster = function() {
    if (!this.next_dose_date) return false;

    const today = new Date();
    const nextDose = new Date(this.next_dose_date);

    return today >= nextDose;
  };

  // Método para calcular días hasta próxima dosis
  Vaccine.prototype.daysUntilNextDose = function() {
    if (!this.next_dose_date) return null;

    const today = new Date();
    const nextDose = new Date(this.next_dose_date);
    const diffTime = nextDose - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return Vaccine;
};
