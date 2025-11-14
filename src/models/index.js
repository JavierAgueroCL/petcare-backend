const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Inicializar Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    timezone: dbConfig.timezone,
    pool: dbConfig.pool,
    define: dbConfig.define,
    dialectOptions: dbConfig.dialectOptions,
  }
);

// Objeto para almacenar todos los modelos
const db = {
  sequelize,
  Sequelize,
};

// Importar modelos
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Pet = require('./Pet')(sequelize, Sequelize.DataTypes);
db.PetImage = require('./PetImage')(sequelize, Sequelize.DataTypes);
db.MedicalRecord = require('./MedicalRecord')(sequelize, Sequelize.DataTypes);
db.MedicalRecordAttachment = require('./MedicalRecordAttachment')(sequelize, Sequelize.DataTypes);
db.Vaccine = require('./Vaccine')(sequelize, Sequelize.DataTypes);
db.QRCode = require('./QRCode')(sequelize, Sequelize.DataTypes);
db.Veterinary = require('./Veterinary')(sequelize, Sequelize.DataTypes);
db.Appointment = require('./Appointment')(sequelize, Sequelize.DataTypes);
db.LegalContent = require('./LegalContent')(sequelize, Sequelize.DataTypes);

// Definir asociaciones
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
