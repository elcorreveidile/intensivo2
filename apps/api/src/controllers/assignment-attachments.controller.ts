import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// Upload attachment to assignment
export const uploadAttachment = async (req: AuthRequest, res: Response) => {
  try {
    console.log('[uploadAttachment] Request received');
    console.log('[uploadAttachment] User:', req.user);
    console.log('[uploadAttachment] File:', req.file);

    if (req.user?.role !== 'profesor') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Solo profesores pueden adjuntar archivos',
      });
    }

    if (!req.file) {
      console.log('[uploadAttachment] No file in request');
      return res.status(400).json({
        error: 'No se proporcionó archivo',
        message: 'Debes subir al menos un archivo',
      });
    }

    const assignmentId = typeof req.params.assignmentId === "string" ? req.params.assignmentId : req.params.assignmentId[0];
    console.log('[uploadAttachment] Assignment ID:', assignmentId);

    // Verify assignment exists and belongs to professor's course
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        course: {
          professorId: req.user.id,
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
        message: 'La tarea no existe o no tienes permiso',
      });
    }

    // Store file info in database
    const attachment = await prisma.assignmentAttachment.create({
      data: {
        assignmentId,
        fileName: req.file.originalname,
        filePath: `/uploads/${req.file.filename}`,
        fileSizeBytes: req.file.size,
        mimeType: req.file.mimetype,
      },
    });

    res.status(201).json({
      message: 'Archivo adjuntado exitosamente',
      attachment,
    });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al adjuntar archivo',
    });
  }
};

// Get attachments for assignment
export const getAttachments = async (req: AuthRequest, res: Response) => {
  try {
    const assignmentId = typeof req.params.assignmentId === "string" ? req.params.assignmentId : req.params.assignmentId[0];

    const attachments = await prisma.assignmentAttachment.findMany({
      where: { assignmentId },
      orderBy: { uploadedAt: 'asc' },
    });

    res.json({ attachments });
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al obtener adjuntos',
    });
  }
};

// Delete attachment
export const deleteAttachment = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'profesor') {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'Solo profesores pueden eliminar adjuntos',
      });
    }

    const attachmentId = typeof req.params.attachmentId === "string" ? req.params.attachmentId : req.params.attachmentId[0];

    // Get attachment
    const attachment = await prisma.assignmentAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        assignment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!attachment) {
      return res.status(404).json({
        error: 'Adjunto no encontrado',
        message: 'El adjunto no existe',
      });
    }

    // Verify ownership
    if (attachment.assignment.course.professorId !== req.user.id) {
      return res.status(403).json({
        error: 'No autorizado',
        message: 'No puedes eliminar este adjunto',
      });
    }

    // Delete from database
    await prisma.assignmentAttachment.delete({
      where: { id: attachmentId },
    });

    // TODO: Delete physical file from filesystem

    res.json({
      message: 'Adjunto eliminado exitosamente',
    });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al eliminar adjunto',
    });
  }
};
