module.exports = {
  up: async (queryInterface) => {
    // Verificar si ya existen notificaciones
    const [results] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM notifications'
    );

    if (results[0].count > 0) {
      console.log('Las notificaciones ya existen, omitiendo seeder...');
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await queryInterface.bulkInsert('notifications', [
      // Notificaciones para el usuario Juan Pérez (id: 1)
      {
        user_id: 1,
        pet_id: 1, // Max
        type: 'vaccine_reminder',
        title: 'Recordatorio: Vacuna próxima',
        message: 'La vacuna "Rabia Anual" vence en 7 días. Agenda una cita con tu veterinario.',
        scheduled_date: yesterday,
        is_read: false,
        is_sent: true,
        related_type: 'vaccine',
        related_id: null,
        priority: 'high',
        created_at: yesterday,
        updated_at: yesterday,
      },
      {
        user_id: 1,
        pet_id: 2, // Luna
        type: 'deworming_reminder',
        title: 'Recordatorio: Desparasitación de Luna',
        message: 'Es momento de desparasitar a Luna. La próxima dosis vence en 3 días.',
        scheduled_date: today,
        is_read: false,
        is_sent: true,
        related_type: 'pet',
        related_id: 2,
        priority: 'medium',
        created_at: today,
        updated_at: today,
      },
      {
        user_id: 1,
        pet_id: 1, // Max
        type: 'appointment_reminder',
        title: 'Recordatorio: Cita de Max',
        message: 'Tienes una cita programada mañana para Max. Tipo: Chequeo general',
        scheduled_date: today,
        is_read: false,
        is_sent: true,
        related_type: 'appointment',
        related_id: null,
        priority: 'high',
        created_at: today,
        updated_at: today,
      },
      {
        user_id: 1,
        pet_id: 3, // Rocky
        type: 'medical_record',
        title: 'Registro médico actualizado',
        message: 'Se ha agregado un nuevo registro médico para Rockyy.',
        scheduled_date: yesterday,
        is_read: true,
        is_sent: true,
        related_type: 'medical_record',
        related_id: null,
        priority: 'low',
        created_at: yesterday,
        updated_at: yesterday,
      },
      // Notificaciones para el admin (id: 3)
      {
        user_id: 3,
        pet_id: 4, // Bella
        type: 'vaccine_reminder',
        title: 'Recordatorio: Vacuna próxima',
        message: 'La vacuna "Parvovirus" vence en 7 días. Agenda una cita con tu veterinario.',
        scheduled_date: today,
        is_read: false,
        is_sent: true,
        related_type: 'vaccine',
        related_id: null,
        priority: 'high',
        created_at: today,
        updated_at: today,
      },
      {
        user_id: 3,
        pet_id: 6, // Thor
        type: 'appointment_reminder',
        title: 'Recordatorio: Cita de Thor',
        message: 'Tienes una cita programada en 2 días para Thor. Tipo: Vacunación',
        scheduled_date: today,
        is_read: false,
        is_sent: true,
        related_type: 'appointment',
        related_id: null,
        priority: 'high',
        created_at: today,
        updated_at: today,
      },
      {
        user_id: 3,
        pet_id: null,
        type: 'system',
        title: 'Bienvenido a PetCare',
        message: 'Gracias por usar PetCare. Aquí podrás gestionar la salud de tus mascotas.',
        scheduled_date: yesterday,
        is_read: true,
        is_sent: true,
        related_type: 'none',
        related_id: null,
        priority: 'low',
        created_at: yesterday,
        updated_at: yesterday,
      },
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('notifications', null, {});
  },
};
