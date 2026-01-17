# Guía de Despliegue en Producción

## Configuración Completa

### 1. Base de Datos (Supabase PostgreSQL)

La aplicación ahora está configurada para usar PostgreSQL en producción:

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > Database
3. Copia la Connection String
4. Formato: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 2. Firebase Storage

Para la subida de archivos en producción:

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Firebase Storage
3. Configura las reglas de seguridad para lectura pública
4. Copia las credenciales desde Project Settings

**Reglas de Firebase Storage recomendadas:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false; // Solo desde el servidor
    }
  }
}
```

### 3. Variables de Entorno

Crea un archivo `.env.production` con las siguientes variables:

```bash
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

# Firebase Storage
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# URLs de Producción (Vercel)
NEXT_PUBLIC_API_URL="https://your-api.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

## Arquitectura de Archivos

### Sistema de Subida de Archivos

La aplicación ahora soporta dos modos de operación:

**Desarrollo (Local):**
- Usa Multer para guardar archivos localmente en `apps/api/uploads/`
- No requiere configuración de Firebase

**Producción:**
- Detecta automáticamente `NODE_ENV=production` o `USE_FIREBASE_STORAGE=true`
- Sube archivos a Firebase Storage
- Guarda URLs públicas en la base de datos

**Archivos modificados:**
- `apps/api/src/lib/firebase.ts` - Servicio de Firebase
- `apps/api/src/middleware/upload-firebase.middleware.ts` - Middleware para Firebase
- `apps/api/src/lib/upload-helper.ts` - Selector de middleware según entorno
- `apps/api/src/controllers/submissions.controller.ts` - Controlador de entregas actualizado
- `apps/api/src/controllers/assignment-attachments.controller.ts` - Controlador de adjuntos actualizado
- `apps/api/src/routes/submissions.routes.ts` - Rutas actualizadas
- `apps/api/src/routes/assignment-attachments.routes.ts` - Rutas actualizadas

## Pasos para Desplegar

### 1. Preparar Base de Datos

```bash
# Aplicar migraciones a la base de datos de producción
npx prisma migrate deploy

# Generar cliente de Prisma
npx prisma generate
```

### 2. Desplegar en Vercel

**Opción A: Usando Vercel CLI**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar frontend (Next.js)
cd apps/web
vercel --prod

# Desplegar backend (Express API)
cd ../api
vercel --prod
```

**Opción B: Desde GitHub**

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel Dashboard
3. Deploy automático en cada push a `main`

### 3. Configurar Dominios (Opcional)

- Añade tu dominio personalizado en Vercel Dashboard
- Actualiza `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_APP_URL`

## Verificación

Después del despliegue, verifica:

1. ✅ La base de datos está conectada (Prisma)
2. ✅ Los usuarios pueden registrarse e iniciar sesión
3. ✅ Los profesores pueden crear tareas con adjuntos
4. ✅ Los estudiantes pueden subir archivos a sus entregas
5. ✅ Los archivos subidos son accesibles públicamente (URLs de Firebase)

## Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que `DATABASE_URL` es correcta
- Confirma que la IP de Vercel está permitida en Supabase

### Error: "Firebase: no matching project"
- Verifica que las credenciales de Firebase son correctas
- Confirma que el Storage bucket está habilitado

### Error: "File upload failed"
- En desarrollo: verifica que la carpeta `apps/api/uploads/` existe
- En producción: verifica las reglas de Firebase Storage
