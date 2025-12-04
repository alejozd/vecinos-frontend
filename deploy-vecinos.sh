#!/bin/bash

# Script de despliegue para Vecinos-Frontend

echo "🚀 Iniciando despliegue de Vecinos-Frontend..."

# Navega a la carpeta del frontend
cd /var/www/vecinos/vecinos-frontend || { echo "❌ ERROR: No se pudo acceder a la carpeta"; exit 1; >

# Detiene ejecución si hay un error
set -e

# 1. Actualiza el código desde GitHub
echo "📥 git pull..."
# Usamos 'main' como la rama estándar, ajústala si es 'master'
git pull origin main

# 2. Instala dependencias (solo si package.json ha cambiado)
echo "📦 npm install..."
npm install

# 3. Construye el frontend (genera la carpeta 'dist')
echo "🔨 npm run build..."
# Asegúrate de que el archivo .env.production (o similar) ya exista en el servidor con la VITE_API>
npm run build

# 4. Elimina la carpeta de archivos estáticos anterior y mueve el nuevo build
# Nota: La carpeta 'build' es el nombre que usas para servir los archivos
echo "🗂️  Moviendo 'dist' a 'build'..."
rm -rf build
mv dist build

# 5. Reinicia el servidor web (Apache) para limpiar cualquier caché potencial
echo "🔄 Reiniciando Apache..."
sudo systemctl reload apache2

echo "✅ Despliegue de Vecinos-Frontend completado con éxito!"
