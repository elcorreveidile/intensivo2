"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleFirebase = exports.uploadSingleFirebase = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const firebase_1 = require("../lib/firebase");
// Configure Multer to store files in memory (not disk)
const storage = multer_1.default.memoryStorage();
// File filter
const fileFilter = (_req, file, cb) => {
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
    }
    else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
    }
};
// Create multer upload instance
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB in bytes
    },
});
// Middleware to handle single file with Firebase upload
const uploadSingleFirebase = (folder) => {
    return async (req, res, next) => {
        exports.upload.single('file')(req, res, async (err) => {
            if (err) {
                return next(err);
            }
            const file = req.file;
            if (!file) {
                return next();
            }
            try {
                // Upload to Firebase Storage
                const firebaseUrl = await (0, firebase_1.uploadFileToFirebase)(file.buffer, file.originalname, folder);
                // Attach Firebase URL to request for controller to use
                req.firebaseUrl = firebaseUrl;
                next();
            }
            catch (error) {
                console.error('[Firebase Upload] Error:', error);
                return next(new Error('Error al subir archivo a Firebase Storage'));
            }
        });
    };
};
exports.uploadSingleFirebase = uploadSingleFirebase;
// Middleware to handle multiple files with Firebase upload
const uploadMultipleFirebase = (folder) => {
    return async (req, res, next) => {
        exports.upload.array('files', 10)(req, res, async (err) => {
            if (err) {
                return next(err);
            }
            const files = req.files;
            if (!files || files.length === 0) {
                return next();
            }
            try {
                // Upload all files to Firebase Storage
                const uploadPromises = files.map(file => (0, firebase_1.uploadFileToFirebase)(file.buffer, file.originalname, folder));
                const firebaseUrls = await Promise.all(uploadPromises);
                // Attach Firebase URLs to request for controller to use
                req.firebaseUrls = firebaseUrls;
                next();
            }
            catch (error) {
                console.error('[Firebase Upload] Error:', error);
                return next(new Error('Error al subir archivos a Firebase Storage'));
            }
        });
    };
};
exports.uploadMultipleFirebase = uploadMultipleFirebase;
//# sourceMappingURL=upload-firebase.middleware.js.map