module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('appointments', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      pet_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'pets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      appointment_type: {
        type: Sequelize.ENUM('checkup', 'vaccine', 'grooming', 'emergency', 'surgery', 'other'),
        allowNull: false,
      },
      appointment_datetime: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha y hora de la cita',
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'confirmed', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'scheduled',
      },
      clinic_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Nombre de la clínica veterinaria',
      },
      veterinarian_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Nombre del veterinario',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas o motivo de la cita',
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Costo de la cita',
      },
      reminder_sent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si se envió recordatorio',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    // Agregar índices (user_id y pet_id ya tienen índices automáticos por ser FK)
    await queryInterface.addIndex('appointments', ['appointment_datetime']);
    await queryInterface.addIndex('appointments', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('appointments');
  },
};
