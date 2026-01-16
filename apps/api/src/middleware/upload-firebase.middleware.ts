import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { uploadFileToFirebase } from '../lib/firebase';

// Configure Multer to store files in memory (not disk)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'audio/mpeg',
    'audio/mp3',
    'video/mp4',
    'audio/mpeg',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
  }
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB in bytes
  },
});

// Middleware to handle single file with Firebase upload
export const uploadSingleFirebase = (folder: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      const file = req.file;
      if (!file) {
        return next();
      }

      try {
        // Upload to Firebase Storage
        const firebaseUrl = await uploadFileToFirebase(
          file.buffer,
          file.originalname,
          folder
        );

        // Attach Firebase URL to request for controller to use
        (req as any).firebaseUrl = firebaseUrl;
        next();
      } catch (error) {
        console.error('[Firebase Upload] Error:', error);
        return next(new Error('Error al subir archivo a Firebase Storage'));
      }
    });
  };
};

// Middleware to handle multiple files with Firebase upload
export const uploadMultipleFirebase = (folder: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    upload.array('files', 10)(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return next();
      }

      try {
        // Upload all files to Firebase Storage
        const uploadPromises = files.map(file =>
          uploadFileToFirebase(file.buffer, file.originalname, folder)
        );

        const firebaseUrls = await Promise.all(uploadPromises);

        // Attach Firebase URLs to request for controller to use
        (req as any).firebaseUrls = firebaseUrls;
        next();
      } catch (error) {
        console.error('[Firebase Upload] Error:', error);
        return next(new Error('Error al subir archivos a Firebase Storage'));
      }
    });
  };
};
