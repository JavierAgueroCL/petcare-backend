module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pet_images', {
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
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'URL en S3',
      },
      image_type: {
        type: Sequelize.ENUM('profile', 'medical', 'general'),
        defaultValue: 'general',
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      uploaded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    await queryInterface.addIndex('pet_images', ['pet_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pet_images');
  },
};
