const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Password para todos: "password123"
    const hashedPassword = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('users', [
      {
        email: 'owner@petcare.cl',
        password: hashedPassword,
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '+56912345678',
        rut: '12345678-9',
        commune: 'Puente Alto',
        region: 'Región Metropolitana',
        role: 'owner',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'veterinario@petcare.cl',
        password: hashedPassword,
        first_name: 'María',
        last_name: 'González',
        phone: '+56987654321',
        rut: '98765432-1',
        commune: 'Providencia',
        region: 'Región Metropolitana',
        role: 'veterinarian',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'admin@petcare.cl',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'Sistema',
        role: 'admin',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
