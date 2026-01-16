import admin from 'firebase-admin';

const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const storage = admin.storage();

/**
 * Upload a file to Firebase Storage
 * @param file - Buffer to upload
 * @param fileName - Name of the file in Storage
 * @param folder - Folder path (e.g., 'submissions', 'attachments')
 * @returns Public URL of the uploaded file
 */
export async function uploadFileToFirebase(
  file: Buffer,
  fileName: string,
  folder: string
): Promise<string> {
  try {
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    const storagePath = `${folder}/${uniqueFileName}`;

    // Get bucket reference
    const bucket = storage.bucket();

    // Create reference
    const fileRef = bucket.file(storagePath);

    // Upload file
    await fileRef.save(file, {
      contentType: 'application/octet-stream',
    });

    // Make file public
    await fileRef.makePublic();

    // Get public URL
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    return downloadURL;
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    throw new Error('Error al subir archivo a Firebase Storage');
  }
}

/**
 * Delete a file from Firebase Storage
 * @param fileURL - Full URL of the file to delete
 */
export async function deleteFileFromFirebase(fileURL: string): Promise<void> {
  try {
    // Extract path from URL
    // URL format: https://storage.googleapis.com/bucket-name/folder/file
    const url = new URL(fileURL);
    const pathParts = url.pathname.split('/');
    // Remove first empty element and bucket name
    const storagePath = pathParts.slice(2).join('/');

    if (!storagePath) {
      throw new Error('URL de archivo inválida');
    }

    const bucket = storage.bucket();
    const fileRef = bucket.file(storagePath);

    // Delete file
    await fileRef.delete();

    console.log('File deleted successfully:', storagePath);
  } catch (error) {
    console.error('Error deleting from Firebase:', error);
    throw new Error('Error al eliminar archivo de Firebase Storage');
  }
}

export { storage };
