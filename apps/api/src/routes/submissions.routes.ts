import { Router } from 'express';
import * as submissionsController from '../controllers/submissions.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadSingle } from '../middleware/upload.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my submission for an assignment (student only)
router.get(
  '/assignments/:assignmentId/my-submission',
  authorize('estudiante'),
  submissionsController.getMySubmission
);

// Get submissions for an assignment (professor only)
router.get(
  '/assignments/:assignmentId/submissions',
  authorize('profesor'),
  submissionsController.getSubmissionsForAssignment
);

// Get single submission (professor or own student submission)
router.get('/submissions/:id', submissionsController.getSubmission);

// Create or update submission (students only)
router.post(
  '/assignments/:assignmentId/submissions',
  authorize('estudiante'),
  submissionsController.createOrUpdateSubmission
);

// Submit assignment (change status to submitted)
router.put(
  '/submissions/:id/submit',
  authorize('estudiante'),
  submissionsController.submitAssignment
);

// Upload file to submission
router.post(
  '/submissions/:id/files',
  uploadSingle,
  submissionsController.uploadFile
);

// Delete file from submission
router.delete(
  '/submissions/files/:fileId',
  submissionsController.deleteFile
);

// Get professor statistics (professor only)
router.get(
  '/profesor/stats',
  authorize('profesor'),
  submissionsController.getProfessorStats
);

export default router;
