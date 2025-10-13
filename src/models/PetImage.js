module.exports = (sequelize, DataTypes) => {
  const PetImage = sequelize.define('PetImage', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    pet_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'pets',
        key: 'id',
      },
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'URL en S3',
    },
    image_type: {
      type: DataTypes.ENUM('profile', 'medical', 'general'),
      defaultValue: 'general',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'pet_images',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['pet_id'] },
    ],
  });

  PetImage.associate = (models) => {
    PetImage.belongsTo(models.Pet, {
      foreignKey: 'pet_id',
      as: 'pet',
    });
  };

  return PetImage;
};
