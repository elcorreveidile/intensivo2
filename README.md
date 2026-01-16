# Aula Virtual CLMABROAD

Plataforma LMS (Learning Management System) para el curso intensivo de español del Centro de Lenguas Modernas de la Universidad de Granada.

## Estado del Proyecto

✅ **Versión 1.0 Estable** - Funcionalidad completa implementada y probada

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
- Creación de tareas con configuración completa
- Lista de tareas para estudiantes y profesores
- Página de detalles de tareas
- Seguimiento de estado de entregas

### ✅ Sistema de Entregas
- Subida de archivos por estudiantes
- Soporte para múltiples archivos
- Validación de tipos de archivo
- Control de tamaño máximo
- Estados: borrador, enviada, tardía, calificada

### ✅ Sistema de Feedback y Calificación
- Calificación de entregas por parte del profesor
- Puntuación sobre nota máxima
- Comentarios generales
- Notificación visual de calificación al estudiante

## Tech Stack

### Frontend
- **Next.js 16.1.1** (App Router con Turbopack)
- **TypeScript**
- **TailwindCSS**
- **React Context API**

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

## Instalación Rápida

```bash
# Clonar repositorio
git clone https://github.com/elcorreveidile/intensivo2.git
cd intensivo2

# Instalar dependencias
npm install

# Iniciar servidores de desarrollo
npm run dev
```

Esto iniciará:
- Frontend en http://localhost:3000
- Backend en http://localhost:4000

## Credenciales de Prueba

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
│   │   ├── app/                  # App Router
│   │   │   ├── login/           # Login
│   │   │   ├── register/        # Registro
│   │   │   ├── dashboard/       # Dashboards
│   │   │   ├── tareas/          # Gestión tareas
│   │   │   ├── entregas/        # Entregas
│   │   │   └── estudiantes/     # Estudiantes
│   │   ├── components/
│   │   └── lib/
│   └── api/                     # Backend Express
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   └── prisma/
│       ├── uploads/
│       └── dev.db               # Base SQLite
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── package.json
```

## Troubleshooting

### Error: "Port already in use"
```bash
# Matar procesos en puertos
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:4000 | xargs kill -9  # Backend
```

### Error: "Token inválido"
```bash
# En consola del navegador:
localStorage.clear()
# Recargar y volver a iniciar sesión
```

## Roadmap

### ✅ Versión 1.0 (Actual - ESTABLE)
- [x] Autenticación completa
- [x] Dashboards por rol
- [x] CRUD de tareas
- [x] Sistema de entregas
- [x] Sistema de calificaciones
- [x] Gestión de estudiantes

### 🚧 Versión 1.1 (Próximamente)
- [ ] Archivos adjuntos en tareas
- [ ] Notificaciones
- [ ] Exportar calificaciones
- [ ] Vista de calendario

### 📋 Versión 2.0 (Futuro)
- [ ] Feedback enriquecido
- [ ] Foro de discusión
- [ ] Notificaciones push
- [ ] Testing automatizado

---

**Versión:** 1.0.0 (Estable)
**Última actualización:** Enero 2026
**Estado:** ✅ Producción
