module.exports = (sequelize, DataTypes) => {
  const Veterinary = sequelize.define('Veterinary', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    opening_hours: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Horarios de atención por día',
    },
    services: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Lista de servicios ofrecidos',
    },
    emergency_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    has_parking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    accepts_card_payment: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: true,
      defaultValue: 0.0,
      validate: {
        min: 0.0,
        max: 5.0,
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'veterinaries',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['city'] },
      { fields: ['is_active'] },
      { fields: ['emergency_available'] },
    ],
  });

  Veterinary.associate = (models) => {
    // Una veterinaria puede tener muchas citas
    Veterinary.hasMany(models.Appointment, {
      foreignKey: 'veterinary_id',
      as: 'appointments',
    });
  };

  return Veterinary;
};
