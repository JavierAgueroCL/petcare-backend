module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pets', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      owner_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      species: {
        type: Sequelize.ENUM('dog', 'cat', 'other'),
        allowNull: false,
      },
      breed: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'unknown'),
        allowNull: false,
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      estimated_age_months: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Edad estimada si no se conoce fecha exacta',
      },
      color: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      size: {
        type: Sequelize.ENUM('small', 'medium', 'large', 'extra_large'),
        allowNull: true,
      },
      weight_kg: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      microchip_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
      },
      national_registry_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        comment: 'Número Registro Nacional Ley Cholito',
      },
      profile_image_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL principal en S3',
      },
      qr_code: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Código QR único',
      },
      is_sterilized: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      sterilization_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      special_needs: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Necesidades especiales, alergias, condiciones',
      },
      temperament: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'lost', 'found', 'deceased', 'adopted'),
        defaultValue: 'active',
      },
      lost_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lost_location: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Visible en búsquedas públicas',
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

    // Agregar índices
    await queryInterface.addIndex('pets', ['owner_id']);
    await queryInterface.addIndex('pets', ['microchip_number']);
    await queryInterface.addIndex('pets', ['qr_code']);
    await queryInterface.addIndex('pets', ['status']);
    await queryInterface.addIndex('pets', ['species']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pets');
  },
};
