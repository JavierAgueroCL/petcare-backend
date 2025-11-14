module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    await queryInterface.bulkInsert('appointments', [
      // Citas futuras (próximas)
      {
        user_id: 1,
        pet_id: 1, // Max
        appointment_type: 'checkup',
        appointment_datetime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // En 3 días
        status: 'scheduled',
        clinic_name: 'Clínica Veterinaria San Francisco',
        veterinarian_name: 'María González',
        notes: 'Control de rutina anual. Revisar peso y vacunas al día.',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 1,
        pet_id: 2, // Luna
        appointment_type: 'vaccine',
        appointment_datetime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // En 7 días
        status: 'confirmed',
        clinic_name: 'VetCenter',
        veterinarian_name: 'Carlos Ramírez',
        notes: 'Vacuna antirrábica anual.',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 1,
        pet_id: 3, // Rocky
        appointment_type: 'checkup',
        appointment_datetime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // En 14 días
        status: 'scheduled',
        clinic_name: 'Hospital Veterinario Central',
        veterinarian_name: 'Ana Torres',
        notes: 'Control de displasia de cadera. Traer radiografías previas.',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 1,
        pet_id: 1, // Max
        appointment_type: 'other',
        appointment_datetime: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // En 21 días
        status: 'scheduled',
        clinic_name: 'Peluquería Canina Happy Pet',
        notes: 'Baño, corte de pelo y uñas. Incluye limpieza de oídos. (Servicio de peluquería)',
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Citas pasadas
      {
        user_id: 1,
        pet_id: 1, // Max
        appointment_type: 'checkup',
        appointment_datetime: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Hace 30 días
        status: 'completed',
        clinic_name: 'Clínica Veterinaria San Francisco',
        veterinarian_name: 'María González',
        notes: 'Control general. Todo en orden.',
        cost: 35000,
        created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: 1,
        pet_id: 2, // Luna
        appointment_type: 'emergency',
        appointment_datetime: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // Hace 45 días
        status: 'completed',
        clinic_name: 'VetEmergencias 24h',
        veterinarian_name: 'Pedro Martínez',
        notes: 'Ingesta de planta tóxica. Paciente estabilizado.',
        cost: 95000,
        created_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: 1,
        pet_id: 3, // Rocky
        appointment_type: 'vaccine',
        appointment_datetime: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // Hace 60 días
        status: 'completed',
        clinic_name: 'Hospital Veterinario Central',
        veterinarian_name: 'Ana Torres',
        notes: 'Vacuna pentavalente aplicada. Sin reacciones adversas.',
        cost: 28000,
        created_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: 1,
        pet_id: 2, // Luna
        appointment_type: 'surgery',
        appointment_datetime: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // Hace 90 días
        status: 'completed',
        clinic_name: 'Hospital Veterinario Central',
        veterinarian_name: 'Roberto Silva',
        notes: 'Esterilización. Procedimiento exitoso.',
        cost: 120000,
        created_at: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: 1,
        pet_id: 1, // Max
        appointment_type: 'other',
        appointment_datetime: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // Hace 15 días
        status: 'completed',
        clinic_name: 'Peluquería Canina Happy Pet',
        notes: 'Baño completo y corte de pelo. (Servicio de peluquería)',
        cost: 25000,
        created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },

      // Cita cancelada
      {
        user_id: 1,
        pet_id: 3, // Rocky
        appointment_type: 'checkup',
        appointment_datetime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // Hace 10 días
        status: 'cancelled',
        clinic_name: 'Clínica Veterinaria San Francisco',
        veterinarian_name: 'María González',
        notes: 'Cancelada por el cliente.',
        created_at: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('appointments', null, {});
  },
};
