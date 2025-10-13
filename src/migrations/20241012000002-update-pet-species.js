module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Paso 1: Agregar una columna temporal para almacenar los valores
    await queryInterface.addColumn('pets', 'species_temp', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    // Paso 2: Copiar y mapear los valores existentes
    await queryInterface.sequelize.query(`
      UPDATE pets
      SET species_temp = CASE
        WHEN species = 'dog' THEN 'perro'
        WHEN species = 'cat' THEN 'gato'
        ELSE 'perro'
      END
    `);

    // Paso 3: Eliminar la columna original
    await queryInterface.removeColumn('pets', 'species');

    // Paso 4: Crear la nueva columna con el ENUM actualizado
    await queryInterface.addColumn('pets', 'species', {
      type: Sequelize.ENUM(
        'perro',
        'gato',
        'raton',
        'conejo',
        'serpiente',
        'vaca',
        'burro',
        'caballo',
        'asno',
        'gallina',
        'cerdo',
        'loro',
        'tortuga',
        'iguana',
        'araña'
      ),
      allowNull: false,
      defaultValue: 'perro',
    });

    // Paso 5: Copiar los valores de la columna temporal
    await queryInterface.sequelize.query(`
      UPDATE pets SET species = species_temp
    `);

    // Paso 6: Eliminar la columna temporal
    await queryInterface.removeColumn('pets', 'species_temp');
  },

  down: async (queryInterface, Sequelize) => {
    // Paso 1: Agregar columna temporal
    await queryInterface.addColumn('pets', 'species_temp', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    // Paso 2: Mapear valores de vuelta
    await queryInterface.sequelize.query(`
      UPDATE pets
      SET species_temp = CASE
        WHEN species = 'perro' THEN 'dog'
        WHEN species = 'gato' THEN 'cat'
        ELSE 'other'
      END
    `);

    // Paso 3: Eliminar columna actual
    await queryInterface.removeColumn('pets', 'species');

    // Paso 4: Recrear con ENUM original
    await queryInterface.addColumn('pets', 'species', {
      type: Sequelize.ENUM('dog', 'cat', 'other'),
      allowNull: false,
      defaultValue: 'dog',
    });

    // Paso 5: Copiar valores
    await queryInterface.sequelize.query(`
      UPDATE pets SET species = species_temp
    `);

    // Paso 6: Eliminar columna temporal
    await queryInterface.removeColumn('pets', 'species_temp');
  },
};
