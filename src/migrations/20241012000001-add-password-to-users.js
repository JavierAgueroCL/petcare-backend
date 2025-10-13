'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'password', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Password hasheado (solo para login local, no Auth0)',
      after: 'email',
    });

    // Hacer auth0_id opcional
    await queryInterface.changeColumn('users', 'auth0_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
      comment: 'ID del usuario en Auth0 (opcional si usa login local)',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'password');

    // Revertir auth0_id a obligatorio
    await queryInterface.changeColumn('users', 'auth0_id', {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
      comment: 'ID del usuario en Auth0',
    });
  },
};
