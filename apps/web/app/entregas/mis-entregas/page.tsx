'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MisEntregasPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string>('');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'estudiante')) {
      router.push('/dashboard');
      return;
    }

    if (user && token) {
      loadData();
    }
  }, [user, token, isLoading]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load courses
      const coursesData = await api.getCourses(token || '');
      if (coursesData.courses.length === 0) {
        setLoading(false);
        return;
      }

      const id = coursesData.courses[0].id;
      setCourseId(id);

      // Load assignments
      const assignmentsData = await api.getAssignments(id, token || '');

      // Load submissions for each assignment
      const submissionsPromises = assignmentsData.assignments.map(async (assignment: any) => {
        try {
          const data = await api.getMySubmission(assignment.id, token || '');
          return { submission: data.submission, assignment };
        } catch {
          // No submission yet
          return { submission: null, assignment };
        }
      });

      const results = await Promise.all(submissionsPromises);
      // Filter to show only assignments with submissions
      const withSubmissions = results.filter((item: any) => item.submission !== null);
      setSubmissions(withSubmissions);
    } catch (err: any) {
      setError(err.message || 'Error al cargar entregas');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeedback = (submissionId: string) => {
    setExpandedFeedback(expandedFeedback === submissionId ? null : submissionId);
  };

  const getStatusBadge = (submission: any) => {
    if (!submission) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">No iniciada</span>;
    }

    switch (submission.status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Borrador</span>;
      case 'submitted':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Entregada</span>;
      case 'late':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Tarde</span>;
      case 'graded':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Calificada</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{submission.status}</span>;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'estudiante') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Volver al Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Mis Entregas</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay entregas aún</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza subiendo tu primera tarea</p>
            <div className="mt-6">
              <Link
                href="/tareas"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Ver Tareas
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((item: any) => (
              <div key={item.assignment.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/tareas/${item.assignment.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-blue-600"
                      >
                        {item.assignment.title}
                      </Link>
                      {getStatusBadge(item.submission)}
                      {item.submission?.feedback && (
                        <>
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            {item.submission.feedback.overallScore || 0}/{item.assignment.maxScore} pts
                          </span>
                          <button
                            onClick={() => toggleFeedback(item.submission?.id || '')}
                            className="text-xs text-blue-600 hover:text-blue-700 underline"
                          >
                            {expandedFeedback === item.submission?.id ? 'Ocultar' : 'Ver'} Feedback
                          </button>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{item.assignment.description}</p>
                    <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {item.submission?.files?.length || 0} archivo{(item.submission?.files?.length || 0) !== 1 ? 's' : ''}
                      </div>
                      {item.submission?.submittedAt && (
                        <div className="flex items-center">
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {new Date(item.submission.submittedAt).toLocaleDateString('es-ES')}
                        </div>
                      )}
                      {item.submission?.feedback && (
                        <div className="flex items-center">
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Calificada
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feedback Section */}
                  {item.submission?.feedback && expandedFeedback === item.submission?.id && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Feedback del Profesor</h4>

                      {item.submission.feedback.overallComments && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {item.submission.feedback.overallComments}
                          </p>
                        </div>
                      )}

                      {item.submission.feedback.rubricScores && Object.keys(item.submission.feedback.rubricScores).length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-xs font-medium text-gray-700 mb-2">Desglose por Rúbrica:</h5>
                          <div className="space-y-1">
                            {Object.entries(item.submission.feedback.rubricScores).map(([criterion, score]) => (
                              <div key={criterion} className="flex justify-between text-xs">
                                <span className="text-gray-600">{criterion}:</span>
                                <span className="font-medium text-gray-900">{String(score)} pts</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900">
                            Calificación Final: {item.submission.feedback.overallScore || 0}/{item.assignment.maxScore}
                          </span>
                          <span className="ml-2 text-gray-600">
                            ({Math.round((item.submission.feedback.overallScore || 0) / item.assignment.maxScore * 100)}%)
                          </span>
                        </div>
                        {item.submission.feedback.teacher && (
                          <div className="text-xs text-gray-600">
                            Por: {item.submission.feedback.teacher.firstName} {item.submission.feedback.teacher.lastName}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 ml-4">
                    {item.submission?.status === 'draft' ? (
                      <Link
                        href={`/tareas/${item.assignment.id}/entregar`}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                      >
                        {item.submission.files?.length > 0 ? 'Continuar' : 'Subir'}
                      </Link>
                    ) : (
                      <Link
                        href={`/tareas/${item.assignment.id}`}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100"
                      >
                        Ver detalle
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
