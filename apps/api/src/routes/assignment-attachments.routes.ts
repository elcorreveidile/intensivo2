import { Router } from 'express';
import * as assignmentAttachmentsController from '../controllers/assignment-attachments.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getUploadSingleMiddleware } from '../lib/upload-helper';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload attachment to assignment (professor only)
router.post(
  '/assignments/:assignmentId/attachments',
  authorize('profesor'),
  getUploadSingleMiddleware('attachments'),
  assignmentAttachmentsController.uploadAttachment
);

// Get attachments for assignment
router.get(
  '/assignments/:assignmentId/attachments',
  assignmentAttachmentsController.getAttachments
);

// Delete attachment (professor only)
router.delete(
  '/assignments/attachments/:attachmentId',
  authorize('profesor'),
  assignmentAttachmentsController.deleteAttachment
);

export default router;
