"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Aula Virtual CLMABROAD API
 * CORS-enabled Express server with custom middleware
 * Last updated: 2026-01-20
 */
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const assignments_routes_1 = __importDefault(require("./routes/assignments.routes"));
const submissions_routes_1 = __importDefault(require("./routes/submissions.routes"));
const feedback_routes_1 = __importDefault(require("./routes/feedback.routes"));
const courses_routes_1 = __importDefault(require("./routes/courses.routes"));
const assignment_attachments_routes_1 = __importDefault(require("./routes/assignment-attachments.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// CORS configuration - MUST BE FIRST, BEFORE ANY OTHER MIDDLEWARE
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL || 'https://aula-virtual-web.vercel.app'
].filter(Boolean);
// Helper function to check if origin is allowed
const isOriginAllowed = (origin) => {
    if (!origin)
        return true;
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))
        return true;
    if (origin.includes('aula-virtual') && origin.includes('vercel.app'))
        return true;
    if (origin.includes('intensivo2') && origin.includes('vercel.app'))
        return true;
    if (allowedOrigins.includes(origin))
        return true;
    return false;
};
// CRITICAL: Handle ALL requests with CORS headers first
app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log(`[CORS] ${req.method} ${req.path} from origin:`, origin);
    if (isOriginAllowed(origin)) {
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', '600');
        // Handle OPTIONS preflight immediately
        if (req.method === 'OPTIONS') {
            console.log('[CORS] Responding to OPTIONS preflight with 204');
            return res.status(204).end();
        }
    }
    else if (origin) {
        console.log('[CORS] Origin blocked:', origin);
        if (req.method === 'OPTIONS') {
            return res.status(403).json({ error: 'Origin not allowed' });
        }
    }
    next();
});
// Other middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// Body parser with limits for JSON and URL-encoded data
// Note: Don't parse multipart/form-data here - multer handles that
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Aula Virtual CLMABROAD API is running' });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/courses', courses_routes_1.default);
app.use('/api', assignments_routes_1.default);
app.use('/api', submissions_routes_1.default);
app.use('/api', feedback_routes_1.default);
app.use('/api', assignment_attachments_routes_1.default);
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// API Info
app.get('/api', (req, res) => {
    res.json({
        message: 'Aula Virtual CLMABROAD API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            courses: '/api/courses',
            assignments: '/api/assignments',
            submissions: '/api/submissions',
            feedback: '/api/feedback',
            notifications: '/api/notifications'
        }
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    // Handle multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: 'Archivo demasiado grande',
            message: 'El tamaño máximo permitido es 100MB',
        });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            error: 'Error en la subida',
            message: 'Error al procesar el archivo',
        });
    }
    // Handle file type errors
    if (err.message && err.message.includes('Tipo de archivo no permitido')) {
        return res.status(400).json({
            error: 'Tipo de archivo no permitido',
            message: err.message,
        });
    }
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});
// Start server (only in development, not in Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map