module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define('Pet', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    owner_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    species: {
      type: DataTypes.ENUM('perro', 'gato', 'raton', 'conejo', 'serpiente', 'vaca', 'burro', 'caballo', 'asno', 'gallina', 'cerdo', 'loro', 'tortuga', 'iguana', 'araña'),
      allowNull: false,
    },
    breed: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'unknown'),
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    estimated_age_months: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Edad estimada si no se conoce fecha exacta',
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    size: {
      type: DataTypes.ENUM('small', 'medium', 'large', 'extra_large'),
      allowNull: true,
    },
    weight_kg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    microchip_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    national_registry_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      comment: 'Número Registro Nacional Ley Cholito',
    },
    profile_image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL principal en S3',
    },
    qr_code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Código QR único',
    },
    is_sterilized: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sterilization_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    special_needs: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Necesidades especiales, alergias, condiciones',
    },
    temperament: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'lost', 'found', 'deceased', 'adopted'),
      defaultValue: 'active',
    },
    lost_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lost_location: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Visible en búsquedas públicas',
    },
  }, {
    tableName: 'pets',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['owner_id'] },
      { fields: ['microchip_number'] },
      { fields: ['qr_code'] },
      { fields: ['status'] },
      { fields: ['species'] },
    ],
  });

  Pet.associate = (models) => {
    // Una mascota pertenece a un usuario
    Pet.belongsTo(models.User, {
      foreignKey: 'owner_id',
      as: 'owner',
    });

    // Una mascota tiene muchas imágenes
    Pet.hasMany(models.PetImage, {
      foreignKey: 'pet_id',
      as: 'images',
    });

    // Una mascota tiene muchos registros médicos
    Pet.hasMany(models.MedicalRecord, {
      foreignKey: 'pet_id',
      as: 'medicalRecords',
    });

    // Una mascota tiene muchas vacunas
    Pet.hasMany(models.Vaccine, {
      foreignKey: 'pet_id',
      as: 'vaccines',
    });

    // Una mascota tiene un QR Code
    Pet.hasOne(models.QRCode, {
      foreignKey: 'pet_id',
      as: 'qrCode',
    });
  };

  // Método para calcular edad
  Pet.prototype.getAge = function() {
    if (this.date_of_birth) {
      const today = new Date();
      const birthDate = new Date(this.date_of_birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return {
        years: age,
        months: age * 12 + monthDiff,
      };
    } else if (this.estimated_age_months) {
      return {
        years: Math.floor(this.estimated_age_months / 12),
        months: this.estimated_age_months,
      };
    }
    return null;
  };

  // Método para obtener próximas vacunas
  Pet.prototype.getUpcomingVaccines = async function() {
    const vaccines = await this.getVaccines({
      where: {
        next_dose_date: {
          [sequelize.Sequelize.Op.gte]: new Date(),
        },
      },
      order: [['next_dose_date', 'ASC']],
    });
    return vaccines;
  };

  return Pet;
};
