module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar nuevos campos de dirección detallada
    await queryInterface.addColumn('users', 'street', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Calle',
    });

    await queryInterface.addColumn('users', 'street_number', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Número de calle',
    });

    await queryInterface.addColumn('users', 'apartment', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Departamento, piso, etc.',
    });

    await queryInterface.addColumn('users', 'city', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Ciudad',
    });

    await queryInterface.addColumn('users', 'postal_code', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Código postal',
    });
  },

  down: async (queryInterface) => {
    // Eliminar campos agregados
    await queryInterface.removeColumn('users', 'street');
    await queryInterface.removeColumn('users', 'street_number');
    await queryInterface.removeColumn('users', 'apartment');
    await queryInterface.removeColumn('users', 'city');
    await queryInterface.removeColumn('users', 'postal_code');
  },
};
