module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'language', {
      type: Sequelize.STRING(10),
      allowNull: true,
      defaultValue: 'es',
      comment: 'Idioma preferido del usuario (es, en, pt, fr)',
    });

    await queryInterface.addColumn('users', 'notification_settings', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Configuración de notificaciones del usuario',
    });

    await queryInterface.addColumn('users', 'preferences', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Preferencias de la aplicación del usuario',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'language');
    await queryInterface.removeColumn('users', 'notification_settings');
    await queryInterface.removeColumn('users', 'preferences');
  },
};
