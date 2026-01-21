"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourse = exports.getCourses = void 0;
const prisma_1 = require("../prisma");
// Get all courses for current user (professor or student)
const getCourses = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'No autenticado',
                message: 'Se requiere autenticación',
            });
        }
        let courses;
        if (req.user.role === 'profesor') {
            // Professor sees their own courses
            courses = await prisma_1.prisma.course.findMany({
                where: {
                    professorId: req.user.id,
                },
                include: {
                    _count: {
                        select: {
                            enrollments: true,
                            assignments: true,
                        },
                    },
                },
                orderBy: {
                    startDate: 'desc',
                },
            });
        }
        else {
            // Student sees courses they're enrolled in
            courses = await prisma_1.prisma.course.findMany({
                where: {
                    enrollments: {
                        some: {
                            userId: req.user.id,
                        },
                    },
                    isActive: true,
                },
                include: {
                    professor: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            enrollments: true,
                            assignments: true,
                        },
                    },
                },
                orderBy: {
                    startDate: 'desc',
                },
            });
        }
        res.json({ courses });
    }
    catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al obtener cursos',
        });
    }
};
exports.getCourses = getCourses;
// Get single course with details
const getCourse = async (req, res) => {
    try {
        const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        const course = await prisma_1.prisma.course.findUnique({
            where: { id },
            include: {
                professor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                assignments: {
                    include: {
                        _count: {
                            select: { submissions: true },
                        },
                    },
                    orderBy: { orderIndex: 'asc' },
                },
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });
        if (!course) {
            return res.status(404).json({
                error: 'Curso no encontrado',
                message: 'El curso no existe',
            });
        }
        // Check authorization
        if (req.user?.role === 'profesor' && course.professorId !== req.user.id) {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'No tienes acceso a este curso',
            });
        }
        if (req.user?.role === 'estudiante') {
            const isEnrolled = await prisma_1.prisma.enrollment.findFirst({
                where: {
                    courseId: id,
                    userId: req.user.id,
                },
            });
            if (!isEnrolled) {
                return res.status(403).json({
                    error: 'No autorizado',
                    message: 'No estás matriculado en este curso',
                });
            }
        }
        res.json({ course });
    }
    catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al obtener curso',
        });
    }
};
exports.getCourse = getCourse;
// Create course (only professor)
const createCourse = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'profesor') {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'Solo profesores pueden crear cursos',
            });
        }
        const { name, code, description, startDate, endDate, maxStudents = 30 } = req.body;
        // Validation
        if (!name || !code || !startDate || !endDate) {
            return res.status(400).json({
                error: 'Datos inválidos',
                message: 'Nombre, código, fecha de inicio y fin son requeridos',
            });
        }
        // Check if code already exists
        const existingCourse = await prisma_1.prisma.course.findUnique({
            where: { code },
        });
        if (existingCourse) {
            return res.status(400).json({
                error: 'Código duplicado',
                message: 'Ya existe un curso con este código',
            });
        }
        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            return res.status(400).json({
                error: 'Fechas inválidas',
                message: 'La fecha de fin debe ser posterior a la fecha de inicio',
            });
        }
        // Create course
        const course = await prisma_1.prisma.course.create({
            data: {
                name,
                code,
                description,
                professorId: req.user.id,
                startDate: start,
                endDate: end,
                maxStudents,
                isActive: true,
            },
        });
        res.status(201).json({
            message: 'Curso creado exitosamente',
            course,
        });
    }
    catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al crear curso',
        });
    }
};
exports.createCourse = createCourse;
// Update course (only professor who owns it)
const updateCourse = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'profesor') {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'Solo profesores pueden actualizar cursos',
            });
        }
        const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        const { name, code, description, startDate, endDate, maxStudents, isActive } = req.body;
        // Verify course exists and user is the professor
        const course = await prisma_1.prisma.course.findUnique({
            where: { id },
        });
        if (!course) {
            return res.status(404).json({
                error: 'Curso no encontrado',
                message: 'El curso no existe',
            });
        }
        if (course.professorId !== req.user.id) {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'No eres el profesor de este curso',
            });
        }
        // Check if new code conflicts with another course
        if (code && code !== course.code) {
            const existingCourse = await prisma_1.prisma.course.findUnique({
                where: { code },
            });
            if (existingCourse) {
                return res.status(400).json({
                    error: 'Código duplicado',
                    message: 'Ya existe otro curso con este código',
                });
            }
        }
        // Validate dates if provided
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end <= start) {
                return res.status(400).json({
                    error: 'Fechas inválidas',
                    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
                });
            }
        }
        // Update course
        const updatedCourse = await prisma_1.prisma.course.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(code && { code }),
                ...(description !== undefined && { description }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                ...(maxStudents && { maxStudents }),
                ...(isActive !== undefined && { isActive }),
            },
        });
        res.json({
            message: 'Curso actualizado exitosamente',
            course: updatedCourse,
        });
    }
    catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al actualizar curso',
        });
    }
};
exports.updateCourse = updateCourse;
// Delete course (only professor who owns it)
const deleteCourse = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'profesor') {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'Solo profesores pueden eliminar cursos',
            });
        }
        const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        // Verify course exists and user is the professor
        const course = await prisma_1.prisma.course.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        enrollments: true,
                        assignments: true,
                    },
                },
            },
        });
        if (!course) {
            return res.status(404).json({
                error: 'Curso no encontrado',
                message: 'El curso no existe',
            });
        }
        if (course.professorId !== req.user.id) {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'No eres el profesor de este curso',
            });
        }
        // Prevent deletion if there are enrollments or assignments
        if (course._count.enrollments > 0 || course._count.assignments > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar',
                message: 'No se puede eliminar un curso con estudiantes o tareas. Desactívalo en su lugar.',
            });
        }
        // Delete course
        await prisma_1.prisma.course.delete({
            where: { id },
        });
        res.json({
            message: 'Curso eliminado exitosamente',
        });
    }
    catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al eliminar curso',
        });
    }
};
exports.deleteCourse = deleteCourse;
//# sourceMappingURL=courses.controller.js.map