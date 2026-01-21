"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudents = exports.createStudent = exports.logout = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../prisma");
// Register new user
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;
        console.log('Register request received:', { email, firstName, lastName, role });
        // Validation
        if (!email || !password || !firstName || !lastName || !role) {
            console.log('Validation failed: missing fields');
            return res.status(400).json({
                error: 'Datos inválidos',
                message: 'Todos los campos son requeridos',
            });
        }
        if (!['profesor', 'estudiante'].includes(role)) {
            console.log('Validation failed: invalid role', role);
            return res.status(400).json({
                error: 'Rol inválido',
                message: 'El rol debe ser "profesor" o "estudiante"',
            });
        }
        if (password.length < 6) {
            console.log('Validation failed: password too short');
            return res.status(400).json({
                error: 'Contraseña débil',
                message: 'La contraseña debe tener al menos 6 caracteres',
            });
        }
        // Check if user already exists
        console.log('Checking if user exists:', email);
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(409).json({
                error: 'Usuario ya existe',
                message: 'Ya existe un usuario con este email',
            });
        }
        // Hash password
        console.log('Hashing password');
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Create user
        console.log('Creating user in database');
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                role,
                nativeLanguage: role === 'estudiante' ? 'English' : null,
                proficiencyLevel: role === 'estudiante' ? 'C1' : null,
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });
        console.log('User created successfully:', user.id);
        // Generate tokens
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' });
        // Set refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        console.log('User registered successfully');
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user,
            token,
        });
    }
    catch (error) {
        console.error('Register error:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
        console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al registrar usuario',
            details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
        });
    }
};
exports.register = register;
// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Datos inválidos',
                message: 'Email y contraseña son requeridos',
            });
        }
        // Find user
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({
                error: 'Credenciales inválidas',
                message: 'Email o contraseña incorrectos',
            });
        }
        if (!user.isActive) {
            return res.status(401).json({
                error: 'Cuenta inactiva',
                message: 'Tu cuenta ha sido desactivada',
            });
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Credenciales inválidas',
                message: 'Email o contraseña incorrectos',
            });
        }
        // Update last login
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        // Generate tokens
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' });
        // Set refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.json({
            message: 'Login exitoso',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            token,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al iniciar sesión',
        });
    }
};
exports.login = login;
// Get current user
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'No autenticado',
                message: 'Se requiere autenticación',
            });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                profilePictureUrl: true,
                nativeLanguage: true,
                proficiencyLevel: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                message: 'Usuario no existe',
            });
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al obtener usuario',
        });
    }
};
exports.getMe = getMe;
// Logout
const logout = async (req, res) => {
    try {
        // Clear refresh token cookie
        res.clearCookie('refreshToken');
        res.json({
            message: 'Logout exitoso',
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al cerrar sesión',
        });
    }
};
exports.logout = logout;
// Create student (professor only)
const createStudent = async (req, res) => {
    try {
        // Only professors can create students
        if (req.user?.role !== 'profesor') {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'Solo profesores pueden crear estudiantes',
            });
        }
        const { email, password, firstName, lastName } = req.body;
        // Validation
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                error: 'Datos inválidos',
                message: 'Todos los campos son requeridos',
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                error: 'Contraseña débil',
                message: 'La contraseña debe tener al menos 6 caracteres',
            });
        }
        // Check if user already exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(409).json({
                error: 'Usuario ya existe',
                message: 'Ya existe un usuario con este email',
            });
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Get professor's course to enroll student
        const professorCourse = await prisma_1.prisma.course.findFirst({
            where: { professorId: req.user.id },
        });
        // Create student
        const student = await prisma_1.prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                role: 'estudiante',
                nativeLanguage: 'English',
                proficiencyLevel: 'C1',
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });
        // Enroll student in professor's course if exists
        if (professorCourse) {
            await prisma_1.prisma.enrollment.create({
                data: {
                    courseId: professorCourse.id,
                    userId: student.id,
                    enrolledAt: new Date(),
                },
            });
        }
        res.status(201).json({
            message: 'Estudiante creado exitosamente',
            student,
        });
    }
    catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al crear estudiante',
        });
    }
};
exports.createStudent = createStudent;
// Get all students (professor only)
const getStudents = async (req, res) => {
    try {
        // Only professors can view students
        if (req.user?.role !== 'profesor') {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'Solo profesores pueden ver estudiantes',
            });
        }
        // Get professor's course
        const professorCourse = await prisma_1.prisma.course.findFirst({
            where: { professorId: req.user.id },
            include: {
                enrollments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                createdAt: true,
                                lastLogin: true,
                            },
                        },
                    },
                },
            },
        });
        if (!professorCourse) {
            return res.json({ students: [] });
        }
        const students = professorCourse.enrollments
            .filter((e) => e.user.role === 'estudiante')
            .map((e) => ({
            ...e.user,
            enrolledAt: e.enrolledAt,
        }));
        res.json({ students });
    }
    catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al obtener estudiantes',
        });
    }
};
exports.getStudents = getStudents;
//# sourceMappingURL=auth.controller.js.map