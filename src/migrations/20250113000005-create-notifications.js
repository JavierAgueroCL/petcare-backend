/**
 * Migración para crear tabla de notificaciones
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notifications', {
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
        onDelete: 'CASCADE',
      },
      pet_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'pets',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM(
          'vaccine_reminder',
          'deworming_reminder',
          'appointment_reminder',
          'medical_record',
          'general',
          'system'
        ),
        allowNull: false,
        defaultValue: 'general',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      scheduled_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_sent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      related_type: {
        type: Sequelize.ENUM('vaccine', 'appointment', 'medical_record', 'pet', 'none'),
        allowNull: true,
      },
      related_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Agregar índices
    try {
      await queryInterface.addIndex('notifications', ['user_id']);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) throw error;
    }

    try {
      await queryInterface.addIndex('notifications', ['pet_id']);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) throw error;
    }

    try {
      await queryInterface.addIndex('notifications', ['scheduled_date']);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) throw error;
    }

    try {
      await queryInterface.addIndex('notifications', ['is_read']);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) throw error;
    }

    try {
      await queryInterface.addIndex('notifications', ['type']);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notifications');
  },
};
