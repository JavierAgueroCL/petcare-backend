module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('legal_contents', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: Sequelize.ENUM('terms', 'privacy'),
        allowNull: false,
        comment: 'Tipo de contenido legal: terms (términos y condiciones) o privacy (política de privacidad)',
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
        comment: 'Contenido HTML o texto del documento legal',
      },
      version: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: '1.0.0',
        comment: 'Versión del documento',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Indica si esta es la versión activa',
      },
      effective_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Fecha en que entra en vigencia',
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
    await queryInterface.addIndex('legal_contents', ['type', 'is_active']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('legal_contents');
  },
};
