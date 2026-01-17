# Guía de Deployment en Producción - Aula Virtual CLMABROAD

## Arquitectura del Proyecto

Este es un monorepo con dos aplicaciones:

1. **Frontend (Next.js)**: `apps/web` - Se despliega en Vercel
2. **Backend (Express API)**: `apps/api` - Se despliega en Railway, Render o Fly.io
3. **Base de datos**: SQLite (desarrollo) → PostgreSQL (producción)

---

## Opción 1: Deployment Recomendado

### Frontend en Vercel + Backend en Railway

#### Paso 1: Preparar la Base de Datos (Railway)

1. Crear cuenta en [railway.app](https://railway.app)
2. Crear nuevo proyecto → Add PostgreSQL
3. Copiar la **DATABASE_URL** que te proporciona Railway

#### Paso 2: Desplegar el Backend API (Railway)

1. En Railway, añadir un nuevo servicio → "Deploy from GitHub repo"
2. Seleccionar tu repositorio de Intensivo2
3. Configurar las variables de entorno en Railway:

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=<pegar la DATABASE_URL de PostgreSQL>
FRONTEND_URL=https://tu-dominio-vercel.vercel.app
JWT_SECRET=<generar_una_clave_secreta_segura>
JWT_REFRESH_SECRET=<generar_otra_clave_secreta_segura>
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

4. Configurar el root directory: `apps/api`
5. Railway detectará automáticamente que es Node.js con Express
6. Desplegar

7. **Importante**: Copiar la URL de tu backend API (ej: `https://tu-api.railway.app`)

#### Paso 3: Configurar el Frontend (Vercel)

1. Instalar Vercel CLI:
```bash
npm install -g vercel
```

2. Login en Vercel:
```bash
vercel login
```

3. En el directorio raíz del proyecto, ejecutar:
```bash
vercel link
```

4. Configurar variables de entorno en Vercel (dashboard o CLI):

```bash
vercel env add NEXT_PUBLIC_API_URL production
# Valor: https://tu-api.railway.app
```

5. Desplegar:
```bash
vercel --prod
```

---

## Opción 2: Todo en Vercel (No recomendado para producción)

**Nota**: Express API con file uploads y Prisma no es ideal para Vercel Functions. Usa esta opción solo para prototipos.

### Pasos:

1. Crear carpetas `api/` en `apps/web` con serverless functions
2. Migrar lógica de Express a funciones serverless
3. Configurar Vercel Postgres para base de datos

---

## Variables de Entorno Producción

### Backend API (Railway/Render/Fly.io)

```bash
# Entorno
NODE_ENV=production

# Servidor
PORT=4000

# Frontend URL (para CORS)
FRONTEND_URL=https://tu-dominio.vercel.app

# Base de Datos (PostgreSQL en producción)
DATABASE_URL=postgresql://usuario:password@host:puerto/database?schema=public

# JWT (usar claves seguras únicas)
JWT_SECRET=tu-clave-super-segura-minimo-32-caracteres
JWT_REFRESH_SECRET=tu-otra-clave-super-segura-minimo-32-caracteres
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Uploads (Nota: En producción usar S3 o Cloudinary)
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600  # 100MB
```

### Frontend (Vercel)

```bash
NEXT_PUBLIC_API_URL=https://tu-api-backend.railway.app
```

---

## Generar Claves JWT Seguras

### Opción 1: OpenSSL
```bash
openssl rand -base64 32
# Usar esto para JWT_SECRET

openssl rand -base64 32
# Usar esto para JWT_REFRESH_SECRET
```

### Opción 2: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Ejecutar Migraciones y Seed en Producción

### Opción 1: Desde Railway (Recomendado)

1. En Railway, entrar al servicio de API
2. Ir a "New Command" o "Migrations"
3. Ejecutar:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### Opción 2: Localmente apuntando a producción

```bash
# En apps/api
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma db seed
```

---

## Limitaciones Importantes

### Storage Local (Archivos Subidos)

La configuración actual usa almacenamiento local (`./uploads`). **Esto NO funciona en producción** porque:

- Railway/Render resetean el filesystem en cada deploy
- Los archivos subidos se perderán

**Solución**: Integrar servicio cloud storage:

- **AWS S3** (más económico a largo plazo)
- **Cloudinary** (fácil para imágenes/videos)
- **Vercel Blob** (si usas Vercel para todo)
- **Supabase Storage** (alternativa open source)

---

## Pasos Post-Deployment

### 1. Verificar Conexión Frontend-Backend

```bash
# Test backend health
curl https://tu-api.railway.app/health

# Debe retornar: {"status":"ok","message":"Aula Virtual CLMABROAD API is running"}
```

### 2. Crear Primer Usuario Profesor

```bash
# Register endpoint
curl -X POST https://tu-api.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "profesor@clmabroad.com",
    "password": "tu-contrasena-segura",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "role": "profesor"
  }'
```

### 3. Actualizar CORS en Backend

Si el frontend URL cambia, actualizar `FRONTEND_URL` en el backend y redeploy.

---

## Monitoreo y Logs

### Railway
- Dashboard → Select service → "Metrics"
- Ver logs en tiempo real

### Vercel
- Dashboard → Project → "Logs"
- Analytics en "Analytics" tab

---

## Checklist de Pre-Production

- [ ] Cambiar SQLite a PostgreSQL en producción
- [ ] Generar claves JWT seguras
- [ ] Configurar FRONTEND_URL correctamente
- [ ] Ejecutar migraciones (`prisma migrate deploy`)
- [ ] Ejecutar seed de datos iniciales
- [ ] Probar registro/login
- [ ] Probar subida de archivos
- [ ] Probar creación de tareas (profesor)
- [ ] Probar entrega de tareas (estudiante)
- [ ] Configurar dominio personalizado (opcional)
- [ ] Implementar storage cloud para archivos (S3/Cloudinary)
- [ ] Configurar HTTPS (automático en Railway/Vercel)
- [ ] Configurar backups de base de datos

---

## Solución de Problemas Comunes

### Error: "Database connection failed"

- Verificar DATABASE_URL es correcta
- Confirmar PostgreSQL está corriendo
- Chequear firewall permite conexiones externas

### Error: "CORS blocked"

- Verificar FRONTEND_URL en backend coincide con dominio Vercel
- Revisar console del navegador para ver el origen bloqueado

### Error: "No autenticado"

- Verificar cookies se están enviando
- Confirmar JWT_SECRET es el mismo en backend
- Chequear NODE_ENV=production

### Files no se suben

- Verificar MAX_FILE_SIZE en backend
- Chequear que req.file se recibe correctamente
- Revisar logs del backend

---

## Costos Estimados (Mensuales)

### Railway
- PostgreSQL: $5/mes (hobby plan)
- API: $5/mes (hobby plan)
- **Total backend**: ~$10/mes

### Vercel
- Hobby plan: GRATIS
- Incluye: 100GB bandwidth, builds infinitos

### Storage Cloud (S3/Cloudinary)
- S3: ~$0.023/GB
- Cloudinary: Free tier hasta 25GB

**Total estimado**: ~$10-20/mes para operación básica

---

## Dominio Personalizado (Opcional)

### Vercel
1. Dashboard → Settings → Domains
2. Añadir dominio (ej: `aula.clmabroad.com`)
3. Configurar DNS según instrucciones de Vercel

### Railway
1. Settings → Domains → Generate domain
2. Configurar DNS con CNAME

---

## Actualizar Producción

### Backend (Railway)
- Push a GitHub → Railway redeploya automáticamente
- O activar "Manual Deploy" en dashboard

### Frontend (Vercel)
- Push a GitHub → Vercel redeploya automáticamente
- O `vercel --prod` manual

---

## Soporte

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Prisma Docs: https://www.prisma.io/docs
