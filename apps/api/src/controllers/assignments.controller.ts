import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all assignments for a course
export const getAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const courseId = typeof req.params.courseId === 'string' ? req.params.courseId : req.params.courseId[0];

    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    res.json({ assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener tareas',
    });
  }
};

// Get single assignment
export const getAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
    console.log('[getAssignment] Fetching assignment:', id);

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: { submissions: true },
        },
      },
    });

    if (!assignment) {
      console.log('[getAssignment] Assignment not found');
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea no existe',
      });
    }

    console.log('[getAssignment] Assignment found');
    res.json({ assignment });
  } catch (error) {
    console.error('[getAssignment] Error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener tarea',
    });
  }
};

// Create assignment (only professor)
export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'profesor') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Solo profesores pueden crear tareas',
      });
    }

    const courseId = typeof req.params.courseId === 'string' ? req.params.courseId : req.params.courseId[0];
    const {
      title,
      description,
      instructions,
      dueDate,
      maxScore = 100,
      allowedFileTypes = ['pdf', 'docx', 'mp3', 'mp4'],
      maxFileSizeMb = 100,
      allowLateSubmission = false,
      rubric,
      attachments,
    } = req.body;

    // Validation
    if (!title || !description || !dueDate) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Título, descripción y fecha límite son requeridos',
      });
    }

    // Verify course exists and user is the professor
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({
        error: 'Curso no encontrado',
        message: 'El curso no existe',
      });
    }

    if (course.professorId !== req.user.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No eres el profesor de este curso',
      });
    }

    // Get the highest orderIndex
    const lastAssignment = await prisma.assignment.findFirst({
      where: { courseId },
      orderBy: { orderIndex: 'desc' },
    });

    const orderIndex = lastAssignment ? lastAssignment.orderIndex + 1 : 0;

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        title,
        description,
        instructions,
        dueDate: new Date(dueDate),
        maxScore,
        allowedFileTypes,
        maxFileSizeMb,
        allowLateSubmission,
        rubric,
        attachments,
        orderIndex,
      },
    });

    res.status(201).json({
      message: 'Tarea creada exitosamente',
      assignment,
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al crear tarea',
    });
  }
};

// Update assignment (only professor)
export const updateAssignment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'profesor') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Solo profesores pueden editar tareas',
      });
    }

    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
    const {
      title,
      description,
      instructions,
      dueDate,
      maxScore,
      allowedFileTypes,
      maxFileSizeMb,
      allowLateSubmission,
      rubric,
      attachments,
    } = req.body;

    // Verify assignment exists and get course info
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!existingAssignment) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea no existe',
      });
    }

    // Verify user is the professor of the course
    const course = await prisma.course.findUnique({
      where: { id: existingAssignment.courseId },
    });

    if (!course || course.professorId !== req.user.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No eres el profesor de este curso',
      });
    }

    // Update assignment
    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(instructions !== undefined && { instructions }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(maxScore && { maxScore }),
        ...(allowedFileTypes && { allowedFileTypes }),
        ...(maxFileSizeMb && { maxFileSizeMb }),
        ...(allowLateSubmission !== undefined && { allowLateSubmission }),
        ...(rubric && { rubric }),
        ...(attachments && { attachments }),
      },
    });

    res.json({
      message: 'Tarea actualizada exitosamente',
      assignment,
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al actualizar tarea',
    });
  }
};

// Delete assignment (only professor)
export const deleteAssignment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'profesor') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Solo profesores pueden eliminar tareas',
      });
    }

    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];

    // Verify assignment exists and get course info
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!existingAssignment) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea no existe',
      });
    }

    // Verify user is the professor of the course
    const course = await prisma.course.findUnique({
      where: { id: existingAssignment.courseId },
    });

    if (!course || course.professorId !== req.user.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No eres el profesor de este curso',
      });
    }

    // Check if there are submissions
    const submissionCount = await prisma.submission.count({
      where: { assignmentId: id },
    });

    if (submissionCount > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar',
        message: `La tarea tiene ${submissionCount} entregas. No se puede eliminar.`,
      });
    }

    // Delete assignment
    await prisma.assignment.delete({
      where: { id },
    });

    res.json({
      message: 'Tarea eliminada exitosamente',
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al eliminar tarea',
    });
  }
};
