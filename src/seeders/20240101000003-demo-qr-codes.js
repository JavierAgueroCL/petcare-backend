module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('qr_codes', [
      {
        pet_id: 1,
        qr_code: 'DEMO01MAXLAB',
        total_scans: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        pet_id: 2,
        qr_code: 'DEMO02LUNASIAM',
        total_scans: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        pet_id: 3,
        qr_code: 'DEMO03ROCKYPAST',
        total_scans: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('qr_codes', null, {});
  },
};
