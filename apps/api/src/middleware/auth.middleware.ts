import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookie or header
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Se requiere token de acceso',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      id: string;
      email: string;
      role: string;
    };

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Usuario no válido',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Token inválido',
      });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Token expirado',
      });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al verificar autenticación',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Se requiere autenticación',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No tienes permiso para realizar esta acción',
      });
    }

    next();
  };
};
