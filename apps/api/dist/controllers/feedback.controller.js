"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnnotation = exports.createAnnotation = exports.updateFeedback = exports.getFeedback = exports.createFeedback = void 0;
const prisma_1 = require("../prisma");
// Create feedback for a submission (professors only)
const createFeedback = async (req, res) => {
    try {
        if (req.user?.role !== 'profesor') {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'Solo profesores pueden crear feedback',
            });
        }
        const submissionId = typeof req.params.submissionId === "string" ? req.params.submissionId : req.params.submissionId[0];
        const { overallScore, overallComments, rubricScores } = req.body;
        // Get submission with assignment
        const submission = await prisma_1.prisma.submission.findUnique({
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
        // Verify professor teaches this course
        const course = await prisma_1.prisma.course.findUnique({
            where: { id: submission.assignment.courseId },
        });
        if (course?.professorId !== req.user.id) {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'No puedes dar feedback a esta entrega',
            });
        }
        // Validate score doesn't exceed maximum
        const maxScore = submission.assignment.maxScore;
        if (overallScore !== undefined && overallScore > maxScore) {
            return res.status(400).json({
                error: 'Calificación inválida',
                message: `La calificación no puede exceder ${maxScore} puntos`,
            });
        }
        // Check if feedback already exists
        const existingFeedback = await prisma_1.prisma.feedback.findUnique({
            where: { submissionId },
        });
        if (existingFeedback) {
            return res.status(400).json({
                error: 'Feedback ya existe',
                message: 'Esta entrega ya tiene feedback. Usa PUT para actualizarlo.',
            });
        }
        // Create feedback
        const feedback = await prisma_1.prisma.feedback.create({
            data: {
                submissionId,
                teacherId: req.user.id,
                overallScore,
                overallComments,
                rubricScores,
            },
        });
        // Update submission status to 'graded'
        await prisma_1.prisma.submission.update({
            where: { id: submissionId },
            data: { status: 'graded' },
        });
        res.status(201).json({
            message: 'Feedback creado exitosamente',
            feedback,
        });
    }
    catch (error) {
        console.error('Create feedback error:', error);
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al crear feedback',
        });
    }
};
exports.createFeedback = createFeedback;
// Get feedback for a submission
const getFeedback = async (req, res) => {
    try {
        const submissionId = typeof req.params.submissionId === "string" ? req.params.submissionId : req.params.submissionId[0];
        const feedback = await prisma_1.prisma.feedback.findUnique({
            where: { submissionId },
            include: {
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                files: true,
                annotations: {
                    include: {
                        submissionFile: true,
                    },
                },
            },
        });
        if (!feedback) {
            return res.status(404).json({
                error: 'Feedback no encontrado',
                message: 'Esta entrega no tiene feedback aún',
            });
        }
        // Authorization: student can only see their own feedback, professor can see all
        const submission = await prisma_1.prisma.submission.findUnique({
            where: { id: submissionId },
        });
        if (req.user?.role === 'estudiante' && submission?.studentId !== req.user.id) {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'No puedes ver este feedback',
            });
        }
        res.json({ feedback });
    }
    catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al obtener feedback',
        });
    }
};
exports.getFeedback = getFeedback;
// Update feedback for a submission (professors only)
const updateFeedback = async (req, res) => {
    try {
        if (req.user?.role !== 'profesor') {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'Solo profesores pueden actualizar feedback',
            });
        }
        const submissionId = typeof req.params.submissionId === "string" ? req.params.submissionId : req.params.submissionId[0];
        const { overallScore, overallComments, rubricScores } = req.body;
        // Get existing feedback
        const existingFeedback = await prisma_1.prisma.feedback.findUnique({
            where: { submissionId },
            include: {
                submission: {
                    include: {
                        assignment: true,
                    },
                },
            },
        });
        if (!existingFeedback) {
            return res.status(404).json({
                error: 'Feedback no encontrado',
                message: 'Esta entrega no tiene feedback aún',
            });
        }
        // Verify ownership
        if (existingFeedback.teacherId !== req.user.id) {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'No puedes modificar este feedback',
            });
        }
        // Validate score doesn't exceed maximum
        const maxScore = existingFeedback.submission.assignment.maxScore;
        if (overallScore !== undefined && overallScore > maxScore) {
            return res.status(400).json({
                error: 'Calificación inválida',
                message: `La calificación no puede exceder ${maxScore} puntos`,
            });
        }
        // Update feedback
        const feedback = await prisma_1.prisma.feedback.update({
            where: { submissionId },
            data: {
                overallScore: overallScore !== undefined ? overallScore : existingFeedback.overallScore,
                overallComments: overallComments !== undefined ? overallComments : existingFeedback.overallComments,
                rubricScores: rubricScores !== undefined ? rubricScores : existingFeedback.rubricScores,
            },
        });
        res.json({
            message: 'Feedback actualizado exitosamente',
            feedback,
        });
    }
    catch (error) {
        console.error('Update feedback error:', error);
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al actualizar feedback',
        });
    }
};
exports.updateFeedback = updateFeedback;
// Create annotation on a file (professors only)
const createAnnotation = async (req, res) => {
    try {
        if (req.user?.role !== 'profesor') {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'Solo profesores pueden crear anotaciones',
            });
        }
        const feedbackId = typeof req.params.feedbackId === "string" ? req.params.feedbackId : req.params.feedbackId[0];
        const { submissionFileId, annotationType, content, positionData } = req.body;
        // Verify feedback exists and belongs to professor
        const feedback = await prisma_1.prisma.feedback.findUnique({
            where: { id: feedbackId },
        });
        if (!feedback) {
            return res.status(404).json({
                error: 'Feedback no encontrado',
                message: 'El feedback no existe',
            });
        }
        if (feedback.teacherId !== req.user.id) {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'No puedes crear anotaciones en este feedback',
            });
        }
        // Verify submission file exists
        const submissionFile = await prisma_1.prisma.submissionFile.findUnique({
            where: { id: submissionFileId },
        });
        if (!submissionFile) {
            return res.status(404).json({
                error: 'Archivo no encontrado',
                message: 'El archivo no existe',
            });
        }
        // Create annotation
        const annotation = await prisma_1.prisma.feedbackAnnotation.create({
            data: {
                feedbackId,
                submissionFileId,
                annotationType,
                content,
                positionData,
            },
        });
        res.status(201).json({
            message: 'Anotación creada exitosamente',
            annotation,
        });
    }
    catch (error) {
        console.error('Create annotation error:', error);
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al crear anotación',
        });
    }
};
exports.createAnnotation = createAnnotation;
// Delete annotation (professors only)
const deleteAnnotation = async (req, res) => {
    try {
        if (req.user?.role !== 'profesor') {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'Solo profesores pueden eliminar anotaciones',
            });
        }
        const annotationId = typeof req.params.annotationId === "string" ? req.params.annotationId : req.params.annotationId[0];
        // Get annotation
        const annotation = await prisma_1.prisma.feedbackAnnotation.findUnique({
            where: { id: annotationId },
            include: {
                feedback: true,
            },
        });
        if (!annotation) {
            return res.status(404).json({
                error: 'Anotación no encontrada',
                message: 'La anotación no existe',
            });
        }
        // Verify ownership
        if (annotation.feedback.teacherId !== req.user.id) {
            return res.status(403).json({
                error: 'No autorizado',
                message: 'No puedes eliminar esta anotación',
            });
        }
        // Delete annotation
        await prisma_1.prisma.feedbackAnnotation.delete({
            where: { id: annotationId },
        });
        res.json({
            message: 'Anotación eliminada exitosamente',
        });
    }
    catch (error) {
        console.error('Delete annotation error:', error);
        res.status(500).json({
            error: 'Error del servidor',
            message: 'Error al eliminar anotación',
        });
    }
};
exports.deleteAnnotation = deleteAnnotation;
//# sourceMappingURL=feedback.controller.js.map