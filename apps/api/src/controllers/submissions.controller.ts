import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { getIdParam } from '../lib/utils';

// Get submission by ID
export const getSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const id = getIdParam(req.params);

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            description: true,
            dueDate: true,
            maxScore: true,
            allowedFileTypes: true,
            maxFileSizeMb: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        files: {
          orderBy: { uploadedAt: 'asc' },
        },
        feedback: {
          include: {
            files: true,
            annotations: {
              include: {
                submissionFile: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({
        error: 'Entrega no encontrada',
        message: 'La entrega no existe',
      });
    }

    // Authorization: students can only see their own submissions
    if (req.user?.role === 'estudiante' && submission.studentId !== req.user.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No puedes ver esta entrega',
      });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener entrega',
    });
  }
};

// Get submissions for an assignment (professor only)
export const getSubmissionsForAssignment = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'profesor') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Solo profesores pueden ver todas las entregas',
      });
    }

    const assignmentId = typeof req.params.assignmentId === "string" ? req.params.assignmentId : req.params.assignmentId[0];

    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        files: true,
        feedback: {
          select: {
            id: true,
            overallScore: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener entregas',
    });
  }
};

// Get current user's submission for an assignment
export const getMySubmission = async (req: AuthRequest, res: Response) => {
  try {
    const assignmentId = typeof req.params.assignmentId === "string" ? req.params.assignmentId : req.params.assignmentId[0];

    if (!req.user) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Se requiere autenticación',
      });
    }

    const submission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: req.user.id,
        },
      },
      include: {
        files: {
          orderBy: { uploadedAt: 'asc' },
        },
        feedback: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.json({ submission });
  } catch (error) {
    console.error('Get my submission error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener entrega',
    });
  }
};

// Create or update submission (students only)
export const createOrUpdateSubmission = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'estudiante') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Solo estudiantes pueden crear entregas',
      });
    }

    const assignmentId = typeof req.params.assignmentId === "string" ? req.params.assignmentId : req.params.assignmentId[0];
    const { comments } = req.body;

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea no existe',
      });
    }

    // Check if submission already exists
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: req.user.id,
        },
      },
    });

    let submission;

    if (existingSubmission) {
      // Update existing submission (only if in draft status)
      if (existingSubmission.status !== 'draft') {
        return res.status(400).json({
          error: 'Entrega ya enviada',
          message: 'No puedes modificar una entrega que ya ha sido enviada',
        });
      }

      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          studentComments: comments || undefined,
        },
      });
    } else {
      // Create new submission
      submission = await prisma.submission.create({
        data: {
          assignmentId,
          studentId: req.user.id,
          status: 'draft',
          studentComments: comments,
        },
      });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Create/update submission error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al crear/actualizar entrega',
    });
  }
};

// Submit assignment (change status from draft to submitted)
export const submitAssignment = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'estudiante') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Solo estudiantes pueden entregar tareas',
      });
    }

    const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];

    // Get submission
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        assignment: true,
      },
    }) as any;

    if (!submission) {
      return res.status(404).json({
        error: 'Entrega no encontrada',
        message: 'La entrega no existe',
      });
    }

    // Verify ownership
    if (submission.studentId !== req.user.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No puedes entregar esta tarea',
      });
    }

    // Check if already submitted
    if (submission.status !== 'draft') {
      return res.status(400).json({
        error: 'Entrega ya enviada',
        message: 'Esta tarea ya ha sido entregada',
      });
    }

    // Check if deadline passed (if late submissions not allowed)
    const now = new Date();
    const dueDate = new Date(submission.assignment.dueDate);
    const isLate = now > dueDate;

    if (isLate && !submission.assignment.allowLateSubmission) {
      return res.status(400).json({
        error: 'Fecha límite excedida',
        message: 'La fecha límite ha pasado y no se permiten entregas tardías',
      });
    }

    // Update submission status
    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        status: isLate ? 'late' : 'submitted',
        submittedAt: now,
        isLate,
      },
    });

    res.json({
      message: 'Tarea entregada exitosamente',
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al entregar tarea',
    });
  }
};

// Upload file to submission
export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file && !req.firebaseUrl) {
      return res.status(400).json({
        error: 'No se proporcionó archivo',
        message: 'Debes subir al menos un archivo',
      });
    }

    const submissionId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];

    // Get submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
      },
    });

    if (!submission) {
      return res.status(404).json({
        error: 'Entrega no encontrada',
        message: 'La entrega no existe',
      });
    }

    // Verify ownership (student) or professor role
    if (req.user?.role === 'estudiante' && submission.studentId !== req.user.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No puedes subir archivos a esta entrega',
      });
    }

    // Check if submission is still in draft status
    if (submission.status !== 'draft') {
      return res.status(400).json({
        error: 'Entrega ya enviada',
        message: 'No puedes subir archivos a una entrega ya enviada',
      });
    }

    // Use Firebase URL if available (production), otherwise use local file (development)
    const filePath = req.firebaseUrl || `/uploads/${req.file?.filename}`;

    // Store file info in database
    const file = await prisma.submissionFile.create({
      data: {
        submissionId,
        fileName: req.file?.originalname || 'archivo',
        filePath,
        fileType: req.file?.mimetype.split('/')[1] || 'file',
        fileSizeBytes: req.file?.size || 0,
        mimeType: req.file?.mimetype || 'application/octet-stream',
      },
    });

    res.status(201).json({
      message: 'Archivo subido exitosamente',
      file,
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al subir archivo',
    });
  }
};

// Delete file from submission
export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const fileId = typeof req.params.fileId === "string" ? req.params.fileId : req.params.fileId[0];

    // Get file
    const file = await prisma.submissionFile.findUnique({
      where: { id: fileId },
      include: {
        submission: true,
      },
    }) as any;

    if (!file) {
      return res.status(404).json({
        error: 'Archivo no encontrado',
        message: 'El archivo no existe',
      });
    }

    // Verify ownership
    if (req.user?.role === 'estudiante' && file.submission.studentId !== req.user.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No puedes eliminar este archivo',
      });
    }

    // Check if submission is still in draft status
    if (file.submission.status !== 'draft') {
      return res.status(400).json({
        error: 'Entrega ya enviada',
        message: 'No puedes eliminar archivos de una entrega ya enviada',
      });
    }

    // Delete file from database
    await prisma.submissionFile.delete({
      where: { id: fileId },
    });

    // TODO: Delete physical file from filesystem

    res.json({
      message: 'Archivo eliminado exitosamente',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al eliminar archivo',
    });
  }
};

// Get professor statistics (pending submissions count, etc.)
export const getProfessorStats = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'profesor') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Solo profesores pueden ver estadísticas',
      });
    }

    // Get all courses taught by this professor
    const courses = await prisma.course.findMany({
      where: { professorId: req.user.id },
      select: { id: true },
    });

    const courseIds = courses.map(c => c.id);

    // Get all assignments for these courses
    const assignments = await prisma.assignment.findMany({
      where: { courseId: { in: courseIds } },
      select: { id: true },
    });

    const assignmentIds = assignments.map(a => a.id);

    // Count submissions by status
    const allSubmissions = await prisma.submission.findMany({
      where: {
        assignmentId: { in: assignmentIds },
      },
      include: {
        feedback: {
          select: { id: true },
        },
      },
    });

    const submitted = allSubmissions.filter(s => s.status === 'submitted' || s.status === 'late').length;
    const graded = allSubmissions.filter(s => s.status === 'graded').length;
    const pending = allSubmissions.filter(s => !s.feedback && (s.status === 'submitted' || s.status === 'late')).length;

    res.json({
      totalSubmissions: allSubmissions.length,
      submitted,
      graded,
      pending,
    });
  } catch (error) {
    console.error('Get professor stats error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener estadísticas',
    });
  }
};
