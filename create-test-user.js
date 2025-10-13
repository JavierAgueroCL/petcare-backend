/**
 * Script para crear usuario de prueba
 * Ejecutar con: node create-test-user.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User } = require('./src/models');

async function createTestUser() {
  try {
    console.log('Creando usuario de prueba...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      where: { email: 'test@petcare.cl' }
    });

    if (existingUser) {
      console.log('El usuario test@petcare.cl ya existe');
      console.log('Email: test@petcare.cl');
      console.log('Password: password123');
      process.exit(0);
    }

    // Crear usuario
    const user = await User.create({
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
    });

    console.log('\nUsuario creado exitosamente!');
    console.log('================================');
    console.log('Email: test@petcare.cl');
    console.log('Password: password123');
    console.log('Nombre:', user.first_name, user.last_name);
    console.log('Role:', user.role);
    console.log('================================');

    process.exit(0);
  } catch (error) {
    console.error('Error al crear usuario:', error.message);
    process.exit(1);
  }
}

createTestUser();
