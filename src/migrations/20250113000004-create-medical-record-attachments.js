module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medical_record_attachments', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      medical_record_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'medical_records',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Título de la imagen/documento',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de la imagen/documento',
      },
      file_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'URL del archivo en S3',
      },
      file_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Tipo de archivo (image/jpeg, image/png, application/pdf, etc.)',
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Tamaño del archivo en bytes',
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Fecha asociada a la imagen/documento',
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Orden de visualización',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    // Agregar índices (verificar si no existen)
    try {
      await queryInterface.addIndex('medical_record_attachments', ['medical_record_id']);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) throw error;
    }

    try {
      await queryInterface.addIndex('medical_record_attachments', ['date']);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) throw error;
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('medical_record_attachments');
  },
};
