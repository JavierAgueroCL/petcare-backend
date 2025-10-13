module.exports = (sequelize, DataTypes) => {
  const LegalContent = sequelize.define('LegalContent', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM('terms', 'privacy'),
      allowNull: false,
      comment: 'Tipo de contenido legal: terms (términos y condiciones) o privacy (política de privacidad)',
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      comment: 'Contenido HTML o texto del documento legal',
    },
    version: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '1.0.0',
      comment: 'Versión del documento',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Indica si esta es la versión activa',
    },
    effective_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Fecha en que entra en vigencia',
    },
  }, {
    tableName: 'legal_contents',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['type'] },
      { fields: ['is_active'] },
      { fields: ['type', 'is_active'] },
    ],
  });

  return LegalContent;
};
