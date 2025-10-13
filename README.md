# PetCare Backend API

Backend de la plataforma PetCare - Sistema integral de gestión de mascotas para Chile.

## Descripción

API RESTful desarrollada con Node.js y Express que gestiona:
- Identificación digital de mascotas con QR
- Historial médico y recordatorios
- Sistema de adopciones
- Marketplace pet-friendly
- Integración con municipalidades y ONGs

## Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Base de datos**: MySQL + Sequelize ORM
- **Autenticación**: Auth0 (OAuth 2.0 / JWT)
- **Almacenamiento**: AWS S3
- **Seguridad**: Helmet, CORS, Rate Limiting
- **Validación**: Joi / Express Validator
- **Documentación**: Swagger/OpenAPI

## Requisitos previos

- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL >= 8.0
- Cuenta Auth0 (configurada)
- Cuenta AWS con S3 (configurada)

## Instalación

### 1. Clonar el repositorio

```bash
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales reales. Ver sección [Variables de Entorno](#variables-de-entorno).

### 4. Configurar base de datos

Crear la base de datos en MySQL:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE petcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Importar el esquema:

```bash
mysql -u root -p petcare_db < ../database/schema.sql
```

### 5. Configurar Auth0

Seguir la guía: [docs/AUTH0_SETUP.md](../docs/AUTH0_SETUP.md)

### 6. Configurar AWS S3

Seguir la guía: [docs/AWS_S3_SETUP.md](../docs/AWS_S3_SETUP.md)

## Ejecución

### Desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`

### Producción

```bash
npm start
```

## Scripts disponibles

```bash
npm run dev              # Desarrollo con nodemon
npm start                # Producción
npm test                 # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:integration # Solo tests de integración
npm run test:unit        # Solo tests unitarios
npm run lint             # Linting con ESLint
npm run lint:fix         # Linting + auto-fix
npm run format           # Formatear código con Prettier
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Ejecutar seeders
npm run db:reset         # Reset completo de BD
npm run docs             # Generar documentación Swagger
```

## Variables de Entorno

### Esenciales

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=petcare_db
DB_USER=root
DB_PASSWORD=tu_password

# Auth0
AUTH0_DOMAIN=tu-tenant.auth0.com
AUTH0_AUDIENCE=https://api.petcare.cl
AUTH0_CLIENT_ID=tu_client_id
AUTH0_CLIENT_SECRET=tu_client_secret

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
S3_BUCKET_PETS=petcare-pets-images
S3_BUCKET_MEDICAL=petcare-medical-documents
S3_BUCKET_CERTIFICATES=petcare-certificates
```

Ver `.env.example` para la lista completa.

## Estructura del proyecto

```
backend/
├── src/
│   ├── config/           # Configuraciones (DB, AWS, Auth0)
│   ├── middleware/       # Middlewares (auth, upload, validation)
│   ├── models/           # Modelos de Sequelize
│   ├── controllers/      # Controladores de rutas
│   ├── services/         # Lógica de negocio
│   ├── routes/           # Definición de rutas
│   ├── utils/            # Utilidades y helpers
│   ├── validators/       # Validadores de datos
│   ├── app.js            # Configuración de Express
│   └── server.js         # Punto de entrada
├── tests/
│   ├── unit/             # Tests unitarios
│   └── integration/      # Tests de integración
├── docs/                 # Documentación
├── .env.example          # Template de variables de entorno
├── .eslintrc.json        # Configuración ESLint
├── .prettierrc.json      # Configuración Prettier
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Health Check

```
GET /health
```

### Autenticación

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Usuarios

```
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Mascotas

```
GET    /api/pets
POST   /api/pets
GET    /api/pets/:id
PUT    /api/pets/:id
DELETE /api/pets/:id
POST   /api/pets/:id/image
```

### Historial Médico

```
GET    /api/pets/:petId/medical-records
POST   /api/pets/:petId/medical-records
GET    /api/medical-records/:id
PUT    /api/medical-records/:id
DELETE /api/medical-records/:id
```

### Vacunas

```
GET    /api/pets/:petId/vaccines
POST   /api/pets/:petId/vaccines
GET    /api/vaccines/:id
PUT    /api/vaccines/:id
DELETE /api/vaccines/:id
```

### Adopciones

```
GET    /api/adoptions
POST   /api/adoptions
GET    /api/adoptions/:id
PUT    /api/adoptions/:id
DELETE /api/adoptions/:id
POST   /api/adoptions/:id/request
```

### QR Codes

```
GET    /api/qr/:code
POST   /api/qr/generate/:petId
GET    /api/qr/:code/scans
```

Ver documentación completa en `/api/docs` (Swagger UI).

## Autenticación

Todas las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

Obtener token desde Auth0:

```javascript
// React Native / React
const { getAccessTokenSilently } = useAuth0();
const token = await getAccessTokenSilently();
```

## Roles y Permisos

- **Owner**: Usuario regular (dueño de mascota)
- **Veterinarian**: Veterinario verificado
- **NGO**: Organización de rescate
- **Municipality**: Municipalidad
- **Admin**: Administrador del sistema

## Testing

### Ejecutar todos los tests

```bash
npm test
```

### Tests específicos

```bash
npm run test:unit               # Solo unitarios
npm run test:integration        # Solo integración
npm run test -- pets.test.js    # Test específico
```

### Coverage

```bash
npm test -- --coverage
```

## Seguridad

Implementado:

- HTTPS obligatorio en producción
- Helmet.js para headers de seguridad
- CORS configurado
- Rate limiting (100 requests/15min)
- Validación y sanitización de inputs
- Protección contra SQL Injection (Sequelize)
- Protección contra XSS
- JWT con Auth0
- Encriptación de datos sensibles
- Logs de auditoría

## Deployment

### Heroku

```bash
heroku create petcare-api
heroku addons:create cleardb:ignite
heroku config:set AUTH0_DOMAIN=...
heroku config:set AWS_ACCESS_KEY_ID=...
git push heroku main
```

### AWS EC2

Ver guía: [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)

### Docker

```bash
docker build -t petcare-backend .
docker run -p 3000:3000 --env-file .env petcare-backend
```

## Monitoreo

- **Logs**: Winston + CloudWatch
- **Errores**: Sentry
- **Performance**: New Relic / Datadog
- **Uptime**: Pingdom / UptimeRobot

## Contribuir

1. Fork del repositorio
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## Convenciones de código

- ESLint: Airbnb style guide
- Prettier para formateo
- Commits: Conventional Commits
- Branches: feature/, bugfix/, hotfix/

## Documentación adicional

- [Configuración Auth0](../docs/AUTH0_SETUP.md)
- [Configuración AWS S3](../docs/AWS_S3_SETUP.md)
- [Arquitectura técnica](../docs/ARCHITECTURE.md)
- [Esquema de base de datos](../database/schema.sql)

## Soporte

- Email: soporte@petcare.cl
- Issues: [GitHub Issues](https://github.com/petcare/backend/issues)
- Documentación: [docs.petcare.cl](https://docs.petcare.cl)

## Licencia

MIT License - PetCare Chile 2024

---

Desarrollado con dedicación para mejorar el cuidado responsable de mascotas en Chile
