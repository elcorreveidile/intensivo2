"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleFirebase = exports.uploadSingleFirebase = exports.uploadMultiple = exports.uploadSingle = exports.getUploadMultipleMiddleware = exports.getUploadSingleMiddleware = void 0;
const upload_middleware_1 = require("../middleware/upload.middleware");
Object.defineProperty(exports, "uploadSingle", { enumerable: true, get: function () { return upload_middleware_1.uploadSingle; } });
Object.defineProperty(exports, "uploadMultiple", { enumerable: true, get: function () { return upload_middleware_1.uploadMultiple; } });
const upload_firebase_middleware_1 = require("../middleware/upload-firebase.middleware");
Object.defineProperty(exports, "uploadSingleFirebase", { enumerable: true, get: function () { return upload_firebase_middleware_1.uploadSingleFirebase; } });
Object.defineProperty(exports, "uploadMultipleFirebase", { enumerable: true, get: function () { return upload_firebase_middleware_1.uploadMultipleFirebase; } });
// Determine if we should use Firebase (production) or local storage (development)
const useFirebase = process.env.NODE_ENV === 'production' ||
    process.env.USE_FIREBASE_STORAGE === 'true';
/**
 * Returns the appropriate upload middleware for single files
 * @param folder - Folder name for Firebase Storage (only used in production)
 */
const getUploadSingleMiddleware = (folder = 'submissions') => {
    if (useFirebase) {
        console.log(`[Upload] Using Firebase Storage for folder: ${folder}`);
        return (0, upload_firebase_middleware_1.uploadSingleFirebase)(folder);
    }
    console.log('[Upload] Using local file storage');
    return upload_middleware_1.uploadSingle;
};
exports.getUploadSingleMiddleware = getUploadSingleMiddleware;
/**
 * Returns the appropriate upload middleware for multiple files
 * @param folder - Folder name for Firebase Storage (only used in production)
 */
const getUploadMultipleMiddleware = (folder = 'submissions') => {
    if (useFirebase) {
        console.log(`[Upload] Using Firebase Storage for folder: ${folder}`);
        return (0, upload_firebase_middleware_1.uploadMultipleFirebase)(folder);
    }
    console.log('[Upload] Using local file storage');
    return upload_middleware_1.uploadMultiple;
};
exports.getUploadMultipleMiddleware = getUploadMultipleMiddleware;
//# sourceMappingURL=upload-helper.js.map