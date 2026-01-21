"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../prisma");
const authenticate = async (req, res, next) => {
    try {
        // Get token from cookie or header
        const token = req.cookies?.token ||
            req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                error: 'No autenticado',
                message: 'Se requiere token de acceso',
            });
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        // Get user from database
        const user = await prisma_1.prisma.user.findUnique({
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
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                error: 'No autenticado',
                message: 'Token inválido',
            });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
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
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
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
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map