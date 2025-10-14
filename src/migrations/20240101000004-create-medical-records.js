module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medical_records', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
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
      veterinarian_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK a veterinarians (se agregará cuando se cree esa tabla)',
      },
      clinic_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'FK a veterinary_clinics (se agregará cuando se cree esa tabla)',
      },
      record_type: {
        type: Sequelize.ENUM('consultation', 'surgery', 'emergency', 'vaccination', 'checkup', 'other'),
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      diagnosis: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      treatment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      prescriptions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      weight_kg: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      temperature_celsius: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true,
      },
      heart_rate: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      next_appointment: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array de URLs de documentos en S3',
      },
      is_encrypted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Datos sensibles encriptados',
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

    // Agregar índices (pet_id ya tiene índice automático por ser FK)
    await queryInterface.addIndex('medical_records', ['date']);
    await queryInterface.addIndex('medical_records', ['record_type']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('medical_records');
  },
};
