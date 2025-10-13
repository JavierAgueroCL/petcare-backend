'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('users', [
      {
        email: 'test@petcare.cl',
        password: hashedPassword,
        first_name: 'Usuario',
        last_name: 'Prueba',
        phone: '+56912345678',
        rut: '12345678-9',
        role: 'owner',
        is_active: true,
        email_verified: true,
        phone_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'admin@petcare.cl',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'Sistema',
        phone: '+56987654321',
        role: 'admin',
        is_active: true,
        email_verified: true,
        phone_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: ['test@petcare.cl', 'admin@petcare.cl'],
      },
    });
  },
};
