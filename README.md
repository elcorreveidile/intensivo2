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
- Edición y eliminación de tareas

### ✅ Panel del Estudiante
- Dashboard personalizado con progreso
- Barra de progreso visual de tareas completadas
- Sistema de entregas de archivos
- Subida de múltiples formatos (PDF, DOCX, MP3, MP4)

### ✅ Sistema de Tareas y Entregas
- Creación de tareas completa
- Subida de archivos por estudiantes
- Sistema de calificaciones

## Tech Stack

- **Next.js 16.1.1** + TypeScript
- **Node.js 25** + Express
- **SQLite** + Prisma ORM
- **JWT** + Multer

## Instalación Rápida

\`\`\`bash
git clone https://github.com/elcorreveidile/intensivo2.git
cd intensivo2
npm install
npm run dev
\`\`\`

## Credenciales

**Profesor:** `profesor@test.com` / `profesor123`
**Estudiantes:** `sarah.j@test.com` / `password123`

---

**Versión:** 1.0.0 Estable | **Estado:** ✅ Producción
