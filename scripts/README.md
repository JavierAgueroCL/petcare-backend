# Scripts de Base de Datos

Este directorio contiene scripts personalizados para gestionar la base de datos.

## db-reset.js

Script robusto para resetear la base de datos manejando correctamente las claves foráneas.

### Uso

```bash
# Resetear completamente la base de datos (undo + migrate + seed)
npm run db:reset

# Solo deshacer las migraciones (equivalente a db:migrate:undo:all)
npm run db:migrate:undo:all
```

### Cómo funciona

El script:

1. Se conecta a MySQL usando las credenciales del archivo `.env`
2. Desactiva temporalmente las verificaciones de claves foráneas (`SET FOREIGN_KEY_CHECKS=0`)
3. Elimina todas las tablas en el orden correcto
4. Reactiva las verificaciones de claves foráneas
5. Si no es solo `--undo-only`:
   - Ejecuta todas las migraciones (`sequelize-cli db:migrate`)
   - Ejecuta todos los seeders (`sequelize-cli db:seed:all`)

### Por qué es necesario

El comando nativo `sequelize-cli db:migrate:undo:all` falla cuando intenta eliminar tablas con relaciones de claves foráneas porque:

- Intenta eliminar las tablas en orden inverso al de creación
- No desactiva las verificaciones de FK antes de eliminar
- Esto causa errores como: `Cannot drop table 'users' referenced by a foreign key constraint`

Este script personalizado soluciona ese problema manejando las FK correctamente.

### Requisitos

- Node.js >= 18.0.0
- Paquete `mysql2` instalado (ya incluido en dependencies)
- Archivo `.env` configurado con las credenciales de MySQL

### Variables de entorno utilizadas

```
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```
