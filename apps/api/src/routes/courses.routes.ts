import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as coursesController from '../controllers/courses.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all courses for current user
router.get('/', coursesController.getCourses);

// Create course (professor only)
router.post('/', coursesController.createCourse);

// Get single course
router.get('/:id', coursesController.getCourse);

// Update course
router.put('/:id', coursesController.updateCourse);

// Delete course
router.delete('/:id', coursesController.deleteCourse);

export default router;
