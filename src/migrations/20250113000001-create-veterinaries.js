module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('veterinaries', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      opening_hours: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Horarios de atención por día',
      },
      services: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Lista de servicios ofrecidos',
      },
      emergency_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      has_parking: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      accepts_card_payment: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      website: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      rating: {
        type: Sequelize.DECIMAL(2, 1),
        allowNull: true,
        defaultValue: 0.0,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    // Agregar índices (verificar si no existen)
    try {
      await queryInterface.addIndex('veterinaries', ['city']);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) throw error;
    }

    try {
      await queryInterface.addIndex('veterinaries', ['is_active']);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) throw error;
    }

    try {
      await queryInterface.addIndex('veterinaries', ['emergency_available']);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) throw error;
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('veterinaries');
  },
};
