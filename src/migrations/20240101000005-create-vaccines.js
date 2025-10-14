module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vaccines', {
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
      medical_record_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'medical_records',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      vaccine_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      vaccine_type: {
        type: Sequelize.ENUM(
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
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      batch_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      administration_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      next_dose_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Fecha de próxima dosis/refuerzo',
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
      certificate_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'PDF del certificado en S3',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    await queryInterface.addIndex('vaccines', ['next_dose_date']);
    await queryInterface.addIndex('vaccines', ['vaccine_type']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('vaccines');
  },
};
