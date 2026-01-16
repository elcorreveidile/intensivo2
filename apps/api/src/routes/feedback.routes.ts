import { Router } from 'express';
import * as feedbackController from '../controllers/feedback.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get feedback for a submission (student or professor)
router.get(
  '/submissions/:submissionId/feedback',
  feedbackController.getFeedback
);

// Create feedback for a submission (professors only)
router.post(
  '/submissions/:submissionId/feedback',
  authorize('profesor'),
  feedbackController.createFeedback
);

// Update feedback for a submission (professors only)
router.put(
  '/submissions/:submissionId/feedback',
  authorize('profesor'),
  feedbackController.updateFeedback
);

// Create annotation on a file (professors only)
router.post(
  '/feedback/:feedbackId/annotations',
  authorize('profesor'),
  feedbackController.createAnnotation
);

// Delete annotation (professors only)
router.delete(
  '/feedback/annotations/:annotationId',
  authorize('profesor'),
  feedbackController.deleteAnnotation
);

export default router;
