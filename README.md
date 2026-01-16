# Aula Virtual CLMABROAD

Plataforma LMS (Learning Management System) para el curso intensivo de español del Centro de Lenguas Modernas de la Universidad de Granada.

## Características

- ✅ Sistema de autenticación (registro, login, logout)
- ✅ Roles de usuario (Profesor y Estudiante)
- ✅ Dashboards personalizados por rol
- ✅ Gestión completa de tareas (CRUD)
- ✅ Lista de tareas para estudiantes y profesores
- ✅ Formulario de creación de tareas con todas las configuraciones
- ✅ Página de detalle de tareas con rúbricas
- 🚧 Sistema de entregas de archivos (próximamente)
- 🚧 Feedback detallado con rúbricas (próximamente)
- 🚧 Notificaciones (próximamente)

## Tech Stack

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- TailwindCSS
- React Context API para estado global

### Backend
- Node.js con Express
- TypeScript
- Prisma ORM
- JWT para autenticación

### Base de Datos
- PostgreSQL

## Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL (local con Docker o en la nube)

## Instalación

### 1. Clonar el repositorio

```bash
cd /path/to/project
```

### 2. Instalar dependencias

```bash
npm install
```

Esto instalará las dependencias de todos los paquetes del monorepo.

### 3. Configurar la base de datos

#### Opción A: Usar Docker (recomendado para desarrollo)

```bash
docker compose up -d
```

Esto iniciará un contenedor de PostgreSQL en `localhost:5432`.

#### Opción B: Base de datos en la nube

Usa Supabase, Railway, o cualquier servicio de PostgreSQL. Actualiza la URL en el archivo `.env`:

```env
DATABASE_URL="postgresql://usuario:password@host:puerto/database?schema=public"
```

### 4. Configurar variables de entorno

Copia el archivo de ejemplo y actualízalo con tus credenciales:

```bash
cp apps/api/.env.example apps/api/.env
```

El archivo `.env` debe contener:

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

DATABASE_URL="postgresql://postgres:password@localhost:5432/aula_virtual?schema=public"

JWT_SECRET=your-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

### 5. Ejecutar migraciones de Prisma

```bash
npm run db:migrate
```

### 6. Poblar la base de datos con datos de prueba (opcional)

```bash
npm run db:seed
```

Esto creará:
- 1 usuario profesor (profesor@test.com / password123)
- 7 usuarios estudiantes (estudiante1@test.com / password123)
- 1 curso (CLMABROAD-2025)
- 3 tareas de ejemplo
- 3 recursos de ejemplo

## Desarrollo

### Iniciar ambos servidores (frontend y backend)

```bash
npm run dev
```

Esto iniciará:
- Frontend (Next.js) en http://localhost:3000
- Backend (Express) en http://localhost:4000

### Iniciar solo el frontend

```bash
npm run dev:web
```

### Iniciar solo el backend

```bash
npm run dev:api
```

## Estructura del Proyecto

```
aula-virtual-clmabroad/
├── apps/
│   ├── web/                 # Frontend Next.js
│   │   ├── app/             # App Router
│   │   │   ├── login/       # Página de login
│   │   │   ├── register/    # Página de registro
│   │   │   └── dashboard/   # Dashboards por rol
│   │   ├── components/      # Componentes React
│   │   └── lib/             # Utilidades y hooks
│   └── api/                 # Backend Express
│       ├── src/
│       │   ├── routes/      # Rutas de la API
│       │   ├── controllers/ # Controladores
│       │   ├── middleware/  # Middleware
│       │   └── lib/         # Utilidades
│       └── prisma/          # Configuración de Prisma
├── prisma/
│   ├── schema.prisma        # Esquema de base de datos
│   └── seed.ts              # Script de seed
├── docker-compose.yml       # PostgreSQL local
└── package.json             # Workspace configuration
```

## Credenciales de Prueba

Después de ejecutar el seed, puedes usar estas credenciales:

**Profesor:**
- Email: `profesor@test.com`
- Contraseña: `password123`

**Estudiantes:**
- Email: `sarah.j@test.com` (y 6 más)
- Contraseña: `password123`

## Comandos Útiles

### Base de datos

```bash
# Ejecutar migraciones
npm run db:migrate

# Poblar datos de prueba
npm run db:seed

# Abrir Prisma Studio (interfaz visual)
npm run db:studio

# Generar Prisma Client
npm run db:generate
```

### Desarrollo

```bash
# Instalar nuevas dependencias
npm install <paquete> --workspace=apps/web
npm install <paquete> --workspace=apps/api

# Compilar TypeScript
npm run build

# Iniciar producción
npm run start
```

## Funcionalidades Implementadas

### ✅ Sistema de Autenticación
- Registro de usuarios (solo desarrollo)
- Login con JWT
- Logout
- Middleware de autenticación
- Protección de rutas

### ✅ Dashboards
- Dashboard del profesor con estadísticas
- Dashboard del estudiante con progreso
- Redirección automática según rol

### 🚧 Próximas Funcionalidades
- CRUD de tareas
- Sistema de entregas con subida de archivos
- Feedback con rúbricas
- Notificaciones
- Recursos del curso

## Troubleshooting

### Error: "Cannot connect to database"

Asegúrate de que:
1. PostgreSQL esté corriendo (`docker compose ps`)
2. La URL de conexión en `.env` sea correcta
3. Las migraciones se hayan ejecutado (`npm run db:migrate`)

### Error: "JWT_SECRET is not defined"

Asegúrate de crear el archivo `.env` desde `.env.example`:

```bash
cp apps/api/.env.example apps/api/.env
```

### Error: "Module not found"

Borra `node_modules` y reinstala:

```bash
rm -rf node_modules apps/*/node_modules
npm install
```

## Roadmap

### MVP (Actual)
- [x] Autenticación de usuarios
- [x] Dashboards básicos
- [ ] CRUD de tareas
- [ ] Sistema de entregas
- [ ] Feedback básico

### Fase 2
- [ ] Feedback enriquecido (anotaciones PDF, audio)
- [ ] Integración con S3 para archivos
- [ ] Recursos del curso
- [ ] Foro de discusión

### Fase 3
- [ ] Notificaciones en tiempo real
- [ ] Testing automatizado
- [ ] Optimizaciones de performance

## Licencia

Este proyecto fue desarrollado para el Centro de Lenguas Modernas de la Universidad de Granada.

## Contacto

Para preguntas o sugerencias, contacta al equipo de desarrollo.

---

**Estado del proyecto:** MVP en desarrollo 🚧
