#!/bin/bash

# Script para diagnosticar y reparar el servidor PetCare
# Ejecutar en el servidor: bash scripts/fix-server.sh

set -e

echo "========================================="
echo "PetCare Backend - Diagnóstico y Reparación"
echo "========================================="
echo ""

# 1. Verificar directorio
echo "1. Directorio actual:"
pwd
echo ""

# 2. Actualizar código
echo "2. Actualizando código desde Git..."
git pull
echo ""

# 3. Ver procesos de Node corriendo
echo "3. Procesos de Node.js corriendo:"
ps aux | grep node | grep -v grep || echo "No hay procesos de Node corriendo"
echo ""

# 4. Matar procesos anteriores
echo "4. Deteniendo procesos anteriores..."
pkill -f "node src/server.js" || echo "No había procesos para detener"
sleep 2
echo ""

# 5. Verificar .env
echo "5. Verificando archivo .env..."
if [ ! -f .env ]; then
    echo "ERROR: .env no existe. Cópialo desde .env.example"
    exit 1
fi

# Verificar si HOST está en .env
if grep -q "^HOST=" .env; then
    CURRENT_HOST=$(grep "^HOST=" .env | cut -d'=' -f2)
    if [ "$CURRENT_HOST" != "0.0.0.0" ]; then
        echo "HOST está configurado incorrectamente: $CURRENT_HOST"
        echo "Corrigiendo a HOST=0.0.0.0..."
        sed -i 's/^HOST=.*/HOST=0.0.0.0/' .env
    else
        echo "HOST ya está configurado correctamente: 0.0.0.0"
    fi
else
    echo "Agregando HOST=0.0.0.0 al .env..."
    echo "HOST=0.0.0.0" >> .env
fi

# Verificar y configurar ALLOWED_ORIGINS
if grep -q "^ALLOWED_ORIGINS=" .env; then
    echo "ALLOWED_ORIGINS ya está configurado"
else
    echo "Agregando ALLOWED_ORIGINS al .env..."
    echo "ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,http://localhost:19000,http://localhost:8081,http://demo.devmania.cl:8081,http://demo.devmania.cl:19006" >> .env
fi
echo ""

# 6. Verificar variables críticas
echo "6. Variables de entorno críticas:"
echo "NODE_ENV: $(grep ^NODE_ENV= .env || echo 'NO DEFINIDO')"
echo "PORT: $(grep ^PORT= .env || echo 'NO DEFINIDO - usará 3000')"
echo "HOST: $(grep ^HOST= .env || echo 'NO DEFINIDO - usará 0.0.0.0')"
echo "DB_HOST: $(grep ^DB_HOST= .env || echo 'NO DEFINIDO')"
echo "DB_NAME: $(grep ^DB_NAME= .env || echo 'NO DEFINIDO')"
echo ""

# 7. Verificar dependencias
echo "7. Verificando dependencias..."
if [ ! -d node_modules ]; then
    echo "Instalando dependencias..."
    npm install
else
    echo "node_modules existe"
fi
echo ""

# 8. Verificar puerto 3000
echo "8. Verificando si el puerto 3000 está ocupado:"
if netstat -tlnp 2>/dev/null | grep :3000; then
    echo "ADVERTENCIA: Puerto 3000 está ocupado"
else
    echo "Puerto 3000 está libre"
fi
echo ""

# 9. Verificar firewall
echo "9. Verificando firewall (si existe ufw)..."
if command -v ufw &> /dev/null; then
    sudo ufw status | grep 3000 || echo "Puerto 3000 no está en reglas de firewall"
else
    echo "ufw no está instalado"
fi
echo ""

# 10. Iniciar servidor
echo "10. Iniciando servidor en modo QA..."
echo "Ejecutando: NODE_ENV=qa node src/server.js"
echo ""

NODE_ENV=qa node src/server.js &
SERVER_PID=$!

echo "Servidor iniciado con PID: $SERVER_PID"
sleep 3
echo ""

# 11. Verificar que el servidor esté corriendo
echo "11. Verificando servidor..."
if ps -p $SERVER_PID > /dev/null; then
    echo "Servidor está corriendo (PID: $SERVER_PID)"
else
    echo "ERROR: El servidor no está corriendo"
    exit 1
fi
echo ""

# 12. Verificar conexión
echo "12. Verificando conexión en localhost..."
sleep 2
curl -s http://localhost:3000/api/health || echo "ERROR: No se pudo conectar a /api/health"
echo ""
echo ""

# 13. Verificar endpoint de auth
echo "13. Verificando endpoint de auth..."
curl -s http://localhost:3000/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{}' || echo "ERROR: No se pudo conectar a /api/auth/login"
echo ""
echo ""

# 14. Verificar interfaz de red
echo "14. Servidor escuchando en:"
netstat -tlnp 2>/dev/null | grep :3000 || echo "No se pudo verificar netstat"
echo ""

echo "========================================="
echo "Diagnóstico completado"
echo "========================================="
echo ""
echo "El servidor está corriendo en background."
echo "PID del servidor: $SERVER_PID"
echo ""
echo "Para ver logs en tiempo real:"
echo "  tail -f /var/log/petcare-backend.log"
echo ""
echo "Para detener el servidor:"
echo "  kill $SERVER_PID"
echo ""
echo "Para mantenerlo corriendo permanentemente, usa pm2:"
echo "  npm install -g pm2"
echo "  pm2 start src/server.js --name petcare-backend"
echo "  pm2 save"
echo "  pm2 startup"
echo ""
