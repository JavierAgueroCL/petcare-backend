module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Primero, actualizar registros existentes que tengan 'grooming' a 'other'
    await queryInterface.sequelize.query(`
      UPDATE appointments
      SET appointment_type = 'other'
      WHERE appointment_type = 'grooming';
    `);

    // Agregar columna veterinary_id
    await queryInterface.addColumn('appointments', 'veterinary_id', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'veterinaries',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Agregar índice para veterinary_id
    await queryInterface.addIndex('appointments', ['veterinary_id']);

    // Modificar el ENUM de appointment_type
    // En MySQL, necesitamos cambiar el tipo de columna completamente
    await queryInterface.sequelize.query(`
      ALTER TABLE appointments
      MODIFY COLUMN appointment_type ENUM('checkup', 'vaccine', 'emergency', 'surgery', 'consultation', 'other')
      NOT NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar columna veterinary_id
    await queryInterface.removeColumn('appointments', 'veterinary_id');

    // Revertir el ENUM de appointment_type
    await queryInterface.sequelize.query(`
      ALTER TABLE appointments
      MODIFY COLUMN appointment_type ENUM('checkup', 'vaccine', 'grooming', 'emergency', 'surgery', 'other')
      NOT NULL;
    `);
  },
};
