module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('pets', [
      {
        owner_id: 1, // Juan Pérez
        name: 'Max',
        species: 'perro',
        breed: 'Labrador',
        gender: 'male',
        date_of_birth: '2020-05-15',
        color: 'Dorado',
        size: 'large',
        weight_kg: 32.5,
        qr_code: 'DEMO01MAXLAB',
        is_sterilized: true,
        sterilization_date: '2021-01-10',
        status: 'active',
        is_public: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        owner_id: 1,
        name: 'Luna',
        species: 'gato',
        breed: 'Siamés',
        gender: 'female',
        date_of_birth: '2021-08-20',
        color: 'Crema y marrón',
        size: 'small',
        weight_kg: 4.2,
        qr_code: 'DEMO02LUNASIAM',
        is_sterilized: true,
        status: 'active',
        is_public: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        owner_id: 1,
        name: 'Rockyy',
        species: 'perro',
        breed: 'Pastor Alemán',
        gender: 'male',
        estimated_age_months: 48,
        color: 'Negro y café',
        size: 'large',
        weight_kg: 38.0,
        qr_code: 'DEMO03ROCKYPAST',
        is_sterilized: false,
        status: 'active',
        special_needs: 'Displasia de cadera leve',
        is_public: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('pets', null, {});
  },
};
