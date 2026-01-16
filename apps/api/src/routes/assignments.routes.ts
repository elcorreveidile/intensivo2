import { Router } from 'express';
import * as assignmentsController from '../controllers/assignments.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get assignments for a course (accessible by both roles)
router.get('/courses/:courseId/assignments', assignmentsController.getAssignments);

// Get single assignment
router.get('/assignments/:id', assignmentsController.getAssignment);

// Create assignment (only professor)
router.post(
  '/courses/:courseId/assignments',
  authorize('profesor'),
  assignmentsController.createAssignment
);

// Update assignment (only professor)
router.put(
  '/assignments/:id',
  authorize('profesor'),
  assignmentsController.updateAssignment
);

// Delete assignment (only professor)
router.delete(
  '/assignments/:id',
  authorize('profesor'),
  assignmentsController.deleteAssignment
);

export default router;
