/**
 * PetCare Backend - Server Principal
 * Punto de entrada de la aplicación
 */

require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

// Verificar conexión a base de datos
const startServer = async () => {
  try {
    // Test de conexión
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida correctamente');

    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('Modelos sincronizados con la base de datos');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║     🐾 PETCARE API SERVER                    ║
║     Servidor iniciado exitosamente           ║
║                                              ║
║     Environment: ${process.env.NODE_ENV?.padEnd(27) || 'development'.padEnd(27)}║
║     Port: ${PORT.toString().padEnd(35)}║
║     URL: http://localhost:${PORT.toString().padEnd(20)}║
╚═══════════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT recibido, cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

startServer();
