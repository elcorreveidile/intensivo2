// Authentication Routes in JavaScript for Vercel
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper to generate tokens
const generateTokens = (user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    { expiresIn: '7d' }
  );
  return { token };
};

// Register endpoint
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    console.log('[AUTH-JS] Register request:', { email, firstName, lastName, role });

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Email, contraseña, nombre y apellidos son requeridos',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Contraseña débil',
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Usuario ya existe',
        message: 'Ya existe un usuario con este email',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: role || 'estudiante',
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

    console.log('[AUTH-JS] User created:', user.id);

    // Generate token
    const { token } = generateTokens(user);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
      token,
    });
  } catch (error) {
    console.error('[AUTH-JS] Register error:', error);
    res.status(500).json({
      error: 'Error al registrar usuario',
      message: error.message,
    });
  }
};

// Login endpoint
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[AUTH-JS] Login request:', { email });

    if (!email || !password) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Email y contraseña son requeridos',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos',
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'Cuenta inactiva',
        message: 'Tu cuenta ha sido desactivada',
      });
    }

    // Generate token
    const { token } = generateTokens(user);

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
  } catch (error) {
    console.error('[AUTH-JS] Login error:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión',
      message: error.message,
    });
  }
};

// Get current user (me)
const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token no proporcionado',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production');

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          profilePictureUrl: true,
          nativeLanguage: true,
          proficiencyLevel: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
          message: 'El usuario no existe',
        });
      }

      res.json({ user });
    } catch (jwtError) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token no es válido o ha expirado',
      });
    }
  } catch (error) {
    console.error('[AUTH-JS] GetMe error:', error);
    res.status(500).json({
      error: 'Error al obtener usuario',
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
