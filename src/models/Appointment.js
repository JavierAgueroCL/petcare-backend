module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    pet_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'pets',
        key: 'id',
      },
    },
    appointment_type: {
      type: DataTypes.ENUM('checkup', 'vaccine', 'emergency', 'surgery', 'consultation', 'other'),
      allowNull: false,
    },
    veterinary_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'veterinaries',
        key: 'id',
      },
    },
    appointment_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'confirmed', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'scheduled',
    },
    clinic_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    veterinarian_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    reminder_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'appointments',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['pet_id'] },
      { fields: ['appointment_datetime'] },
      { fields: ['status'] },
    ],
  });

  Appointment.associate = (models) => {
    Appointment.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    Appointment.belongsTo(models.Pet, {
      foreignKey: 'pet_id',
      as: 'pet',
    });

    Appointment.belongsTo(models.Veterinary, {
      foreignKey: 'veterinary_id',
      as: 'veterinary',
    });
  };

  return Appointment;
};
