#!/bin/bash

echo "=========================================="
echo "VERIFICACIÓN ANTES DEL DESPLIEGUE EN VERCEL"
echo "=========================================="
echo ""

# Verificar Node.js
echo "1️⃣ Verificando Node.js..."
if command -v node &> /dev/null; then
    echo "✅ Node.js instalado: $(node --version)"
else
    echo "❌ Node.js NO instalado. Instálalo desde https://nodejs.org/"
    exit 1
fi

# Verificar npm
echo ""
echo "2️⃣ Verificando npm..."
if command -v npm &> /dev/null; then
    echo "✅ npm instalado: $(npm --version)"
else
    echo "❌ npm NO instalado"
    exit 1
fi

# Verificar Vercel CLI
echo ""
echo "3️⃣ Verificando Vercel CLI..."
if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI instalado: $(vercel --version)"
else
    echo "❌ Vercel CLI NO instalado"
    echo "   Ejecuta: npm install -g vercel"
    exit 1
fi

# Verificar estructura del proyecto
echo ""
echo "4️⃣ Verificando estructura del proyecto..."
if [ -d "apps/api" ] && [ -d "apps/web" ]; then
    echo "✅ Estructura correcta"
else
    echo "❌ Estructura incorrecta. Asegúrate de estar en la raíz del proyecto"
    exit 1
fi

# Verificar archivos de configuración
echo ""
echo "5️⃣ Verificando archivos de configuración..."
FILES=(
    "apps/api/vercel.json"
    "vercel.json"
    ".env.production.example"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file NO existe"
    fi
done

# Verificar build
echo ""
echo "6️⃣ Verificando que compila..."
echo "   Haciendo build de la API..."
cd apps/api
if npm run build &> /dev/null; then
    echo "✅ API compila correctamente"
else
    echo "❌ Error al compilar la API"
    exit 1
fi

cd ../..

echo ""
echo "   Haciendo build del web..."
cd apps/web
if npm run build &> /dev/null; then
    echo "✅ Web compila correctamente"
else
    echo "❌ Error al compilar el web"
    exit 1
fi

cd ../..

echo ""
echo "=========================================="
echo "✅ TODO LISTO PARA DESPLEGAR EN VERCEL"
echo "=========================================="
echo ""
echo "Siguiente paso: Lee VERCEL-DEPLOYMENT-GUIDE.md y sigue los pasos"
