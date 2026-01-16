import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import assignmentsRoutes from './routes/assignments.routes';
import submissionsRoutes from './routes/submissions.routes';
import feedbackRoutes from './routes/feedback.routes';
import coursesRoutes from './routes/courses.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    // Allow localhost on any port
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    // Allow specific frontend URL from env
    const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Aula Virtual CLMABROAD API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api', assignmentsRoutes);
app.use('/api', submissionsRoutes);
app.use('/api', feedbackRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Info
app.get('/api', (req: Request, res: Response) => {
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
app.use((err: any, req: Request, res: Response, next: any) => {
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
