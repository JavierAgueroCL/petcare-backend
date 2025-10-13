module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('qr_codes', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      pet_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
        references: {
          model: 'pets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      qr_code: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      qr_image_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Imagen del QR en S3',
      },
      total_scans: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      last_scanned_at: {
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

    await queryInterface.addIndex('qr_codes', ['qr_code']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('qr_codes');
  },
};
