module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Password hasheado para autenticación',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    rut: {
      type: DataTypes.STRING(12),
      allowNull: true,
      unique: true,
      comment: 'RUT chileno sin puntos, con guión',
      validate: {
        is: /^[0-9]+-[0-9kK]$/i,
      },
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    profile_image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL de imagen en S3',
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Dirección completa (deprecated, usar campos específicos)',
    },
    street: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Calle',
    },
    street_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Número de calle',
    },
    apartment: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Departamento, piso, etc.',
    },
    commune: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Comuna',
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Ciudad',
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Región',
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Código postal',
    },
    role: {
      type: DataTypes.ENUM('owner', 'veterinarian', 'ngo', 'municipality', 'admin'),
      allowNull: false,
      defaultValue: 'owner',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    phone_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: 'es',
      comment: 'Idioma preferido del usuario (es, en, pt, fr)',
    },
    notification_settings: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuración de notificaciones del usuario',
      get() {
        const rawValue = this.getDataValue('notification_settings');
        if (!rawValue) {
          return {
            pushEnabled: true,
            emailEnabled: true,
            vaccineReminders: true,
            appointmentReminders: true,
            medicalRecords: false,
            lostPetAlerts: true,
            marketingEmails: false,
          };
        }
        return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
      },
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Preferencias de la aplicación del usuario',
      get() {
        const rawValue = this.getDataValue('preferences');
        if (!rawValue) {
          return {
            darkMode: false,
            compactView: false,
            showImages: true,
            autoSync: true,
            offlineMode: false,
          };
        }
        return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
      },
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['role'] },
      { fields: ['commune'] },
    ],
  });

  User.associate = (models) => {
    // Un usuario puede tener muchas mascotas
    User.hasMany(models.Pet, {
      foreignKey: 'owner_id',
      as: 'pets',
    });
  };

  // Métodos de instancia
  User.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    // No exponer datos sensibles
    delete values.password;
    return values;
  };

  return User;
};
