import { uploadSingle, uploadMultiple } from '../middleware/upload.middleware';
import { uploadSingleFirebase, uploadMultipleFirebase } from '../middleware/upload-firebase.middleware';

// Determine if we should use Firebase (production) or local storage (development)
const useFirebase = process.env.NODE_ENV === 'production' ||
                    process.env.USE_FIREBASE_STORAGE === 'true';

/**
 * Returns the appropriate upload middleware for single files
 * @param folder - Folder name for Firebase Storage (only used in production)
 */
export const getUploadSingleMiddleware = (folder: string = 'submissions') => {
  if (useFirebase) {
    console.log(`[Upload] Using Firebase Storage for folder: ${folder}`);
    return uploadSingleFirebase(folder);
  }
  console.log('[Upload] Using local file storage');
  return uploadSingle;
};

/**
 * Returns the appropriate upload middleware for multiple files
 * @param folder - Folder name for Firebase Storage (only used in production)
 */
export const getUploadMultipleMiddleware = (folder: string = 'submissions') => {
  if (useFirebase) {
    console.log(`[Upload] Using Firebase Storage for folder: ${folder}`);
    return uploadMultipleFirebase(folder);
  }
  console.log('[Upload] Using local file storage');
  return uploadMultiple;
};

export { uploadSingle, uploadMultiple, uploadSingleFirebase, uploadMultipleFirebase };
