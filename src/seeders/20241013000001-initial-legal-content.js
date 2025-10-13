module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    await queryInterface.bulkInsert('legal_contents', [
      {
        type: 'terms',
        content: JSON.stringify({
          title: 'Términos y Condiciones',
          lastUpdate: 'Octubre 2024',
          sections: [
            {
              title: '1. Aceptación de los Términos',
              content: 'Al acceder y utilizar PetCare, usted acepta cumplir con estos términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestra aplicación.'
            },
            {
              title: '2. Descripción del Servicio',
              content: 'PetCare es una aplicación móvil diseñada para ayudar a los dueños de mascotas a gestionar la información de sus animales, incluyendo:',
              items: [
                'Registro de información médica y vacunas',
                'Gestión de citas veterinarias',
                'Códigos QR de identificación de mascotas',
                'Alertas de mascotas perdidas'
              ]
            },
            {
              title: '3. Cuenta de Usuario',
              content: 'Para utilizar ciertos servicios de PetCare, debe crear una cuenta. Usted es responsable de:',
              items: [
                'Mantener la confidencialidad de su contraseña',
                'Todas las actividades que ocurran bajo su cuenta',
                'Notificarnos inmediatamente sobre cualquier uso no autorizado'
              ]
            },
            {
              title: '4. Uso Apropiado',
              content: 'Usted acepta no utilizar PetCare para:',
              items: [
                'Actividades ilegales o fraudulentas',
                'Distribuir malware o contenido dañino',
                'Violar los derechos de propiedad intelectual',
                'Interferir con el funcionamiento normal de la aplicación'
              ]
            },
            {
              title: '5. Propiedad Intelectual',
              content: 'Todo el contenido, marcas y material de PetCare están protegidos por derechos de autor y otras leyes de propiedad intelectual. No puede copiar, modificar o distribuir nuestro contenido sin autorización previa.'
            },
            {
              title: '6. Limitación de Responsabilidad',
              content: 'PetCare se proporciona "tal cual". No garantizamos que el servicio sea ininterrumpido, seguro o libre de errores. No somos responsables de:',
              items: [
                'Pérdida de datos o información',
                'Daños indirectos o consecuentes',
                'Decisiones veterinarias basadas en la información de la app'
              ]
            },
            {
              title: '7. Modificaciones del Servicio',
              content: 'Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento, con o sin previo aviso. No seremos responsables ante usted o terceros por cualquier modificación, suspensión o interrupción del servicio.'
            },
            {
              title: '8. Ley Aplicable',
              content: 'Estos términos se rigen por las leyes de Chile. Cualquier disputa relacionada con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales chilenos.'
            },
            {
              title: '9. Contacto',
              content: 'Si tiene preguntas sobre estos términos, puede contactarnos en:',
              contact: {
                email: 'legal@petcare.cl',
                phone: '+56 9 5343 1578'
              }
            }
          ]
        }),
        version: '1.0.0',
        is_active: true,
        effective_date: now,
        created_at: now,
        updated_at: now,
      },
      {
        type: 'privacy',
        content: JSON.stringify({
          title: 'Política de Privacidad',
          lastUpdate: 'Octubre 2024',
          sections: [
            {
              title: '1. Información que Recopilamos',
              content: 'En PetCare, recopilamos diferentes tipos de información para proporcionarle nuestros servicios:',
              subsections: [
                {
                  subtitle: 'Información Personal:',
                  items: [
                    'Nombre completo y correo electrónico',
                    'Número de teléfono',
                    'Dirección'
                  ]
                },
                {
                  subtitle: 'Información de Mascotas:',
                  items: [
                    'Datos de identificación (nombre, raza, edad)',
                    'Registros médicos y vacunas',
                    'Fotografías',
                    'Ubicación (solo para mascotas perdidas)'
                  ]
                }
              ]
            },
            {
              title: '2. Cómo Usamos su Información',
              content: 'Utilizamos la información recopilada para:',
              items: [
                'Proporcionar y mantener nuestros servicios',
                'Gestionar su cuenta y perfil de mascotas',
                'Enviar notificaciones sobre vacunas y citas',
                'Ayudar en la búsqueda de mascotas perdidas',
                'Mejorar nuestros servicios y desarrollar nuevas funciones',
                'Comunicarnos con usted sobre actualizaciones y cambios'
              ]
            },
            {
              title: '3. Compartir Información',
              content: 'No vendemos ni alquilamos su información personal. Solo compartimos información en los siguientes casos:',
              items: [
                'Con su consentimiento explícito',
                'Con veterinarios cuando usted comparte registros médicos',
                'En caso de mascotas perdidas, con usuarios cercanos',
                'Cuando sea requerido por ley'
              ]
            },
            {
              title: '4. Seguridad de Datos',
              content: 'Implementamos medidas de seguridad para proteger su información:',
              items: [
                'Encriptación de datos en tránsito y en reposo',
                'Autenticación segura de usuarios',
                'Copias de seguridad regulares',
                'Acceso restringido a datos personales'
              ],
              disclaimer: 'Sin embargo, ningún método de transmisión por Internet es 100% seguro. No podemos garantizar seguridad absoluta.'
            },
            {
              title: '5. Sus Derechos',
              content: 'Usted tiene derecho a:',
              items: [
                'Acceder a su información personal',
                'Corregir datos inexactos',
                'Solicitar la eliminación de sus datos',
                'Oponerse al procesamiento de su información',
                'Exportar sus datos en un formato legible',
                'Retirar su consentimiento en cualquier momento'
              ]
            },
            {
              title: '6. Retención de Datos',
              content: 'Conservamos su información personal mientras su cuenta esté activa o según sea necesario para proporcionarle servicios. Puede solicitar la eliminación de su cuenta en cualquier momento.'
            },
            {
              title: '7. Privacidad de Menores',
              content: 'Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información de menores. Si descubrimos que un menor nos ha proporcionado información, la eliminaremos inmediatamente.'
            },
            {
              title: '8. Cookies y Tecnologías Similares',
              content: 'Utilizamos cookies y tecnologías similares para:',
              items: [
                'Mantener su sesión activa',
                'Recordar sus preferencias',
                'Analizar el uso de la aplicación',
                'Mejorar la experiencia del usuario'
              ]
            },
            {
              title: '9. Cambios en la Política',
              content: 'Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cambios significativos publicando la nueva política en la aplicación y actualizando la fecha de "última actualización".'
            },
            {
              title: '10. Contacto',
              content: 'Si tiene preguntas sobre esta política de privacidad, puede contactarnos:',
              contact: {
                email: 'privacidad@petcare.cl',
                phone: '+56 9 5343 1578',
                address: 'Av. Providencia 1234, Santiago, Chile'
              }
            }
          ]
        }),
        version: '1.0.0',
        is_active: true,
        effective_date: now,
        created_at: now,
        updated_at: now,
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('legal_contents', null, {});
  },
};
