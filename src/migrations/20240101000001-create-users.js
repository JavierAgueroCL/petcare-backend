module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Password hasheado para autenticación',
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      rut: {
        type: Sequelize.STRING(12),
        allowNull: true,
        unique: true,
        comment: 'RUT chileno sin puntos, con guión',
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      profile_image_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL de imagen en S3',
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      commune: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      role: {
        type: Sequelize.ENUM('owner', 'veterinarian', 'ngo', 'municipality', 'admin'),
        allowNull: false,
        defaultValue: 'owner',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      phone_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      last_login: {
        type: Sequelize.DATE,
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
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};
