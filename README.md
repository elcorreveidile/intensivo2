# Aula Virtual CLMABROAD

Plataforma LMS (Learning Management System) para el curso intensivo de español del Centro de Lenguas Modernas de la Universidad de Granada.

## Estado del Proyecto

✅ **Versión Estable 1.0** - Funcionalidad completa implementada y probada

## Características Implementadas

### ✅ Sistema de Autenticación
- Registro e inicio de sesión de usuarios
- Autenticación JWT con tokens seguros
- Roles de usuario (Profesor y Estudiante)
- Protección de rutas por rol
- Gestión de sesiones

### ✅ Panel del Profesor
- Dashboard con estadísticas en tiempo real
- Contador de tareas activas y entregas pendientes
- Vista de entregas por corregir
- Gestión completa de estudiantes (crear, listar)
- CRUD completo de tareas académicas
- Formulario de creación con todas las configuraciones
- Edición y eliminación de tareas

### ✅ Panel del Estudiante
- Dashboard personalizado con progreso
- Barra de progreso visual de tareas completadas
- Lista de tareas con estado de entrega
- Vista detallada de cada tarea
- Sistema de entregas de archivos
- Subida de múltiples formatos (PDF, DOCX, MP3, MP4)
- Estado de entrega (pendiente, enviada, calificada)

### ✅ Sistema de Tareas
- Creación de tareas con:
  - Título y descripción
  - Instrucciones detalladas
  - Fecha y hora límite
  - Puntuación máxima
  - Tipos de archivo aceptados
  - Tamaño máximo de archivos
  - Configuración de entregas tardías
  - Rúbricas de evaluación
- Lista de tareas para estudiantes y profesores
- Página de detalles completa
- Seguimiento de estado de entregas

### ✅ Sistema de Entregas
- Subida de archivos por estudiantes
- Soporte para múltiples archivos
- Validación de tipos de archivo
- Control de tamaño máximo
- Estados: borrador, enviada, tardía, calificada
- Historial de entregas

### ✅ Sistema de Feedback y Calificación
- Calificación de entregas por parte del profesor
- Puntuación sobre nota máxima
- Comentarios generales
- Evaluación por rúbricas
- Notificación visual de calificación al estudiante

## Tech Stack

### Frontend
- **Next.js 16.1.1** (App Router con Turbopack)
- **TypeScript** para tipado estático
- **TailwindCSS** para estilos
- **React Context API** para gestión de estado global

### Backend
- **Node.js 25.2.0** con Express
- **TypeScript**
- **Prisma ORM** con SQLite
- **JWT** para autenticación
- **Multer** para subida de archivos

### Base de Datos
- **SQLite** (almacenamiento local)
- Prisma como ORM

## Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0

No requiere base de datos externa - usa SQLite local

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/elcorreveidile/intensivo2.git
cd intensivo2
```

### 2. Instalar dependencias

```bash
npm install
```

Esto instalará las dependencias de todos los paquetes del monorepo.

### 3. Iniciar los servidores de desarrollo

```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará automáticamente:
- Frontend (Next.js) en http://localhost:3000
- Backend (Express) en http://localhost:4000

### Iniciar servidores individualmente

```bash
# Solo frontend
cd apps/web
npm run dev

# Solo backend
cd apps/api
npm run dev
```

## Credenciales de Prueba

El sistema viene con datos de prueba precargados:

**Profesor:**
- Email: `profesor@test.com`
- Contraseña: `profesor123`

**Estudiantes:**
- Sarah: `sarah.j@test.com` / `password123`
- Michael: `michael.c@test.com` / `password123`
- Emma: `emma.d@test.com` / `password123`
- (Y 4 estudiantes más)

**Cuenta de Producción:**
- Email: `informa@blablaele.com`
- Contraseña: `profesor123`

## Estructura del Proyecto

```
intensivo2/
├── apps/
│   ├── web/                      # Frontend Next.js
│   │   ├── app/                  # App Router páginas
│   │   │   ├── login/           # Página de login
│   │   │   ├── register/        # Página de registro
│   │   │   ├── dashboard/       # Dashboards
│   │   │   │   ├── profesor/    # Dashboard profesor
│   │   │   │   └── estudiante/  # Dashboard estudiante
│   │   │   ├── tareas/          # Gestión de tareas
│   │   │   │   ├── [id]/        # Detalle de tarea
│   │   │   │   ├── crear/       # Crear tarea
│   │   │   │   └── [id]/editar/ # Editar tarea
│   │   │   ├── entregas/        # Gestión de entregas
│   │   │   └── estudiantes/     # Gestión estudiantes
│   │   ├── components/          # Componentes React reutilizables
│   │   └── lib/                 # Utilidades y API client
│   └── api/                     # Backend Express
│       ├── src/
│       │   ├── routes/          # Rutas API
│       │   ├── controllers/     # Lógica de negocio
│       │   ├── middleware/      # Middleware (auth, etc)
│       │   └── prisma/          # Config Prisma
│       ├── uploads/             # Archivos subidos
│       └── dev.db               # Base de datos SQLite
├── prisma/
│   ├── schema.prisma           # Esquema de base de datos
│   └── seed.ts                 # Script de seed
└── package.json                # Workspace config
```

## Guía de Uso

### Como Profesor

1. **Inicia sesión** con tu cuenta de profesor
2. **Dashboard** - Ve las estadísticas del curso
3. **Crear Tarea** - Crea nuevas tareas con configuración completa
4. **Ver Entregas** - Revisa las entregas de estudiantes
5. **Calificar** - Califica las entregas y da feedback
6. **Gestionar Estudiantes** - Crea nuevos estudiantes

### Como Estudiante

1. **Inicia sesión** con tu cuenta de estudiante
2. **Dashboard** - Ve tu progreso general
3. **Ver Tareas** - Lista de todas las tareas del curso
4. **Subir Entrega** - Envía tus tareas antes de la fecha límite
5. **Ver Calificación** - Revisa tus notas y feedback

## Comandos Útiles

### Desarrollo

```bash
# Iniciar ambos servidores
npm run dev

# Iniciar solo frontend
cd apps/web && npm run dev

# Iniciar solo backend
cd apps/api && npm run dev

# Construir para producción
npm run build

# Iniciar producción
npm run start
```

### Base de Datos

```bash
# Generar Prisma Client
cd apps/api
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Abrir Prisma Studio (interfaz visual)
npx prisma studio

# Poblar datos de prueba
npm run seed
```

## Troubleshooting

### Error: "Port 3000/4000 already in use"

```bash
# Matar procesos en puertos
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:4000 | xargs kill -9  # Backend
```

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules apps/*/node_modules
npm install
```

### Error: Token inválido

```bash
# Limpiar localStorage del navegador
# En consola del navegador:
localStorage.clear()
# Luego recargar y volver a iniciar sesión
```

### La base de datos no se actualiza

```bash
# Regenerar Prisma Client
cd apps/api
npx prisma generate
```

## Flujo de Trabajo

### Crear una Nueva Tarea (Profesor)

1. Inicia sesión como profesor
2. Ve a "Tareas" en el menú
3. Haz clic en "Crear Nueva Tarea"
4. Completa el formulario:
   - Información básica (título, descripción)
   - Selecciona el curso
   - Configura fecha límite y puntuación
   - Define tipos de archivo aceptados
   - Opcional: Añade rúbrica de evaluación
5. Haz clic en "Crear Tarea"

### Entregar una Tarea (Estudiante)

1. Inicia sesión como estudiante
2. Ve a "Tareas" en el menú
3. Haz clic en "Ver Detalles" de la tarea
4. Haz clic en "Subir Entrega"
5. Arrastra o selecciona los archivos
6. Haz clic en "Enviar Entrega"

### Calificar una Entrega (Profesor)

1. Ve a "Entregas Pendientes"
2. Selecciona la entrega a calificar
3. Revisa los archivos enviados
4. Asigna puntuación y comentarios
5. Haz clic en "Guardar Calificación"

## Características Técnicas

### Seguridad
- Autenticación JWT con expiración
- Middleware de autenticación en rutas protegidas
- Validación de tipos de archivo subidos
- Control de tamaño máximo de archivos
- Sanitización de inputs

### Base de Datos
- SQLite para desarrollo local
- Prisma ORM con schema migrable
- Relaciones con cascade delete
- Índices optimizados

### API REST
- Endpoints bien estructurados
- Manejo de errores consistente
- Códigos de estado HTTP apropiados
- Validación de datos de entrada

### Frontend
- Server Components de Next.js
- Client Components para interactividad
- Optimización de imágenes automáticas
- Routing dinámico

## Roadmap

### ✅ Versión 1.0 (Actual - ESTABLE)
- [x] Sistema de autenticación completo
- [x] Dashboards por rol
- [x] CRUD de tareas
- [x] Sistema de entregas
- [x] Sistema de calificaciones
- [x] Gestión de estudiantes

### 🚧 Versión 1.1 (Próximamente)
- [ ] Archivos adjuntos en tareas
- [ ] Notificaciones de nuevas tareas
- [ ] Historial de cambios en tareas
- [ ] Exportar calificaciones a CSV
- [ ] Vista de calendario de tareas

### 📋 Versión 2.0 (Futuro)
- [ ] Feedback enriquecido (anotaciones en PDF)
- [ ] Foro de discusión
- [ ] Chat en tiempo real
- [ ] Integración con servicios de almacenamiento (S3)
- [ ] Sistema de notificaciones push
- [ ] Modo offline con PWA
- [ ] Testing automatizado
- [ ] Analytics y reportes

## Contribuir

Este proyecto es mantenido por el Centro de Lenguas Modernas de la Universidad de Granada.

## Licencia

Este proyecto fue desarrollado para uso educativo en el Centro de Lenguas Modernas de la Universidad de Granada.

---

**Versión:** 1.0.0 (Estable)
**Última actualización:** Enero 2026
**Estado:** ✅ Producción
