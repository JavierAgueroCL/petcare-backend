#!/usr/bin/env node

/**
 * Script para resetear la base de datos de forma segura
 * Maneja correctamente las claves foráneas
 */

require('dotenv').config();
const { execSync } = require('child_process');
const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petcare_db',
};

async function resetDatabase() {
  let connection;

  try {
    console.log('Conectando a la base de datos...');
    connection = await mysql.createConnection(config);

    console.log('Desactivando verificaciones de claves foráneas...');
    await connection.query('SET FOREIGN_KEY_CHECKS=0');

    console.log('Eliminando tablas existentes...');
    const tables = [
      'appointments',
      'vaccines',
      'qr_codes',
      'medical_records',
      'pet_images',
      'pets',
      'legal_contents',
      'users',
      'SequelizeMeta',
      'SequelizeData'
    ];

    for (const table of tables) {
      try {
        await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
      } catch (err) {
        // Ignorar errores si la tabla no existe
      }
    }

    console.log('Reactivando verificaciones de claves foráneas...');
    await connection.query('SET FOREIGN_KEY_CHECKS=1');

    await connection.end();

    // Solo hacer undo si se pasa el flag
    if (process.argv.includes('--undo-only')) {
      console.log('Reset completado (solo undo)');
      process.exit(0);
    }

    console.log('Ejecutando migraciones...');
    execSync('sequelize-cli db:migrate', { stdio: 'inherit' });

    console.log('Ejecutando seeders...');
    execSync('sequelize-cli db:seed:all', { stdio: 'inherit' });

    console.log('Base de datos reseteada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error reseteando la base de datos:', error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

resetDatabase();
