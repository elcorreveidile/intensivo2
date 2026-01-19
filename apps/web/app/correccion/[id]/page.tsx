'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function CorreccionPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();

  const [submission, setSubmission] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [overallScore, setOverallScore] = useState<number>(0);
  const [overallComments, setOverallComments] = useState<string>('');
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});

  const submissionId = params.id as string;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && token && submissionId) {
      loadData();
    }
  }, [user, token, submissionId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get submission with all details
      const submissionData = await api.getSubmission(submissionId, token || '');
      setSubmission(submissionData.submission);
      setAssignment(submissionData.submission.assignment);

      // Check if feedback already exists
      try {
        const feedbackData = await api.getFeedback(submissionId, token || '');
        setExistingFeedback(feedbackData.feedback);
        setOverallScore(feedbackData.feedback.overallScore || 0);
        setOverallComments(feedbackData.feedback.overallComments || '');
        if (feedbackData.feedback.rubricScores) {
          setRubricScores(feedbackData.feedback.rubricScores);
        }
      } catch (err) {
        // No feedback yet, that's fine
        console.log('No existing feedback');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar entrega');
    } finally {
      setLoading(false);
    }
  };

  const handleRubricScoreChange = (criterionName: string, score: number) => {
    setRubricScores((prev) => ({
      ...prev,
      [criterionName]: score,
    }));
  };

  const calculateTotalScore = () => {
    if (!assignment?.rubric?.criteria) return overallScore;

    const total = Object.values(rubricScores).reduce((sum: number, score: number) => sum + score, 0);
    return total;
  };

  const handleSubmit = async (sendToStudent: boolean) => {
    if (!assignment) return;

    // Validate score
    const finalScore = assignment.rubric?.criteria ? calculateTotalScore() : overallScore;
    if (finalScore > assignment.maxScore) {
      setError(`La calificación total (${finalScore}) excede el máximo (${assignment.maxScore})`);
      return;
    }

    if (finalScore < 0) {
      setError('La calificación no puede ser negativa');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const feedbackData: any = {
        overallScore: finalScore,
        overallComments,
      };

      // Only include rubricScores if the assignment has a rubric
      if (assignment.rubric?.criteria) {
        feedbackData.rubricScores = rubricScores;
      }

      if (existingFeedback) {
        await api.updateFeedback(submissionId, feedbackData, token || '');
      } else {
        await api.createFeedback(submissionId, feedbackData, token || '');
      }

      if (sendToStudent) {
        alert('Feedback enviado al estudiante exitosamente');
        router.push('/entregas/pendientes');
      } else {
        alert('Feedback guardado exitosamente');
        // Reload to show it was saved
        loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar feedback');
    } finally {
      setSaving(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'pdf':
        return (
          <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'docx':
        return (
          <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'mp3':
        return (
          <svg className="h-8 w-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" clipRule="evenodd" />
          </svg>
        );
      case 'mp4':
        return (
          <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      default:
        return (
          <svg className="h-8 w-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'profesor') {
    router.push('/dashboard');
    return null;
  }

  if (error && !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Link href="/entregas/pendientes" className="text-blue-600 hover:underline mt-4 inline-block">
            Volver a entregas pendientes
          </Link>
        </div>
      </div>
    );
  }

  const finalScore = assignment?.rubric?.criteria ? calculateTotalScore() : overallScore;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/entregas/pendientes" className="text-blue-600 hover:text-blue-700">
            ← Volver a Entregas Pendientes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Corregir Entrega</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {submission && assignment && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Student submission */}
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Estudiante</h2>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {submission.student.firstName[0]}{submission.student.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {submission.student.firstName} {submission.student.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{submission.student.email}</p>
                  </div>
                </div>
                {submission.submittedAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Entregado: {new Date(submission.submittedAt).toLocaleString('es-ES')}
                    </p>
                    {submission.isLate && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 mt-2">
                        Entrega tardía
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Assignment Info */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">{assignment.title}</h2>
                <p className="text-gray-700 mb-4">{assignment.description}</p>
                {assignment.instructions && (
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.instructions}</p>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span>Puntuación máxima: {assignment.maxScore} pts</span>
                  <span>Fecha límite: {new Date(assignment.dueDate).toLocaleDateString('es-ES')}</span>
                </div>
              </div>

              {/* Student Comments */}
              {submission.studentComments && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Comentarios del Estudiante</h2>
                  <div className="bg-blue-50 rounded-md p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.studentComments}</p>
                  </div>
                </div>
              )}

              {/* Files */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Archivos ({submission.files?.length || 0})
                </h2>

                {submission.files && submission.files.length > 0 ? (
                  <div className="space-y-4">
                    {submission.files.map((file: any) => (
                      <div
                        key={file.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">{getFileIcon(file.fileName)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <div className="mt-3 flex gap-2">
                              <a
                                href={`${process.env.NEXT_PUBLIC_API_URL}${file.filePath}`}
                                download
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Descargar
                              </a>
                              {file.fileName.endsWith('.pdf') && (
                                <button
                                  onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}${file.filePath}`, '_blank')}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  Abrir en nueva pestaña
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2">No hay archivos adjuntos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Feedback form */}
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Feedback</h2>
                  {existingFeedback && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      Feedback existente
                    </span>
                  )}
                </div>

                {/* Rubric Section (if assignment has rubric) */}
                {assignment.rubric?.criteria && assignment.rubric.criteria.length > 0 ? (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Rúbrica de Evaluación</h3>
                    <div className="space-y-4">
                      {assignment.rubric.criteria.map((criterion: any) => (
                        <div key={criterion.name} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-900">{criterion.name}</label>
                            <span className="text-sm text-gray-600">Máx: {criterion.max} pts</span>
                          </div>
                          <input
                            type="number"
                            min={0}
                            max={criterion.max}
                            value={rubricScores[criterion.name] || 0}
                            onChange={(e) => handleRubricScoreChange(criterion.name, parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Total Score Display */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">Calificación Total</span>
                        <span className="text-2xl font-bold text-blue-900">
                          {calculateTotalScore()} / {assignment.maxScore}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Simple Score Input (if no rubric) */
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Calificación Total (0 - {assignment.maxScore})
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={assignment.maxScore}
                      value={overallScore}
                      onChange={(e) => setOverallScore(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Overall Comments */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Comentarios Generales
                  </label>
                  <textarea
                    rows={8}
                    value={overallComments}
                    onChange={(e) => setOverallComments(e.target.value)}
                    placeholder="Añade tus comentarios y sugerencias para el estudiante..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={saving}
                    className="w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Guardando...' : 'Enviar Feedback al Estudiante'}
                  </button>
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={saving}
                    className="w-full px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Guardando...' : 'Guardar como Borrador'}
                  </button>
                  <Link
                    href="/entregas/pendientes"
                    className="w-full px-6 py-3 text-center text-base font-medium rounded-md text-gray-700 hover:text-gray-900"
                  >
                    Cancelar
                  </Link>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-yellow-800">
                        Al enviar el feedback, la entrega será marcada como "Calificada" y el estudiante podrá ver la calificación y tus comentarios.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
