'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, Assignment, Course } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AssignmentWithSubmission extends Assignment {
  submission?: {
    id: string;
    status: string;
    submittedAt?: string;
    feedback?: {
      overallScore?: number;
      overallComments?: string;
      rubricScores?: Record<string, number>;
    };
  };
}

export default function TareasPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && token) {
      loadCourses();
    }
  }, [user, token, isLoading]);

  useEffect(() => {
    if (selectedCourse && token) {
      loadAssignments();
    }
  }, [selectedCourse, token]);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      console.log('[Tareas] Loading courses, user role:', user?.role);
      const data = await api.getCourses(token || '');
      console.log('[Tareas] Courses received:', data.courses.length);
      setCourses(data.courses);

      // Auto-select first course if available
      if (data.courses.length > 0 && !selectedCourse) {
        setSelectedCourse(data.courses[0].id);
      }
    } catch (err: any) {
      console.error('[Tareas] Error loading courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadAssignments = async () => {
    if (!selectedCourse) return;

    const isProf = user?.role === 'profesor';

    try {
      setLoading(true);
      const data = await api.getAssignments(selectedCourse, token || '');

      // For students, load their submissions
      if (!isProf) {
        const assignmentsWithSubmissions = await Promise.all(
          data.assignments.map(async (assignment) => {
            try {
              const subData = await api.getMySubmission(assignment.id, token || '');
              return {
                ...assignment,
                submission: subData.submission ? {
                  id: subData.submission.id,
                  status: subData.submission.status,
                  submittedAt: subData.submission.submittedAt,
                  feedback: subData.submission.feedback,
                } : undefined,
              };
            } catch {
              return { ...assignment, submission: undefined };
            }
          })
        );
        setAssignments(assignmentsWithSubmissions);
      } else {
        setAssignments(data.assignments);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
      await api.deleteAssignment(assignmentId, token || '');
      await loadAssignments();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar tarea');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isProfessor = user.role === 'profesor';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                ← Volver al Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                {isProfessor ? 'Gestión de Tareas' : 'Mis Tareas'}
              </h1>
            </div>
            {isProfessor && (
              <Link
                href="/tareas/crear"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                + Nueva Tarea
              </Link>
            )}
          </div>

          {/* Course Selector */}
          {courses.length > 0 && (
            <div className="mt-4">
              <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-1">
                Curso
              </label>
              <select
                id="course-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {assignments.length === 0 ? (
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tareas</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isProfessor
                ? 'Crea tu primera tarea para comenzar'
                : 'No hay tareas disponibles aún'}
            </p>
            {isProfessor && (
              <div className="mt-6">
                <Link
                  href="/tareas/crear"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Crear Tarea
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const dueDate = new Date(assignment.dueDate);
              const isPastDue = dueDate < new Date();
              const hasSubmission = assignment.submission !== undefined;
              const isGraded = assignment.submission?.feedback !== undefined;
              const submissionStatus = assignment.submission?.status;

              return (
                <div
                  key={assignment.id}
                  className={`bg-white shadow rounded-lg p-6 border-l-4 ${
                    isGraded
                      ? 'border-green-500'
                      : hasSubmission
                      ? 'border-blue-500'
                      : isPastDue
                      ? 'border-red-400'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-medium text-gray-900">
                          {assignment.title}
                        </h3>

                        {/* Status badges for students */}
                        {!isProfessor && (
                          <>
                            {isGraded ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Calificada: {assignment.submission?.feedback?.overallScore || 0}/{assignment.maxScore}
                              </span>
                            ) : hasSubmission ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                ✓ Entregada
                              </span>
                            ) : isPastDue ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ¡Vencida!
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Pendiente
                              </span>
                            )}
                          </>
                        )}

                        {/* Professor stats */}
                        {isProfessor && assignment._count && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {assignment._count.submissions} entregas
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-gray-600">{assignment.description}</p>

                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 flex-wrap">
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
                          {dueDate.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {isPastDue && !hasSubmission && ' (Vencida)'}
                        </div>
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
                              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                            />
                          </svg>
                          {assignment.maxScore} puntos
                        </div>

                        {/* Submission date for students */}
                        {!isProfessor && assignment.submission?.submittedAt && (
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
                                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                              />
                            </svg>
                            Entregado: {new Date(assignment.submission.submittedAt).toLocaleDateString('es-ES')}
                          </div>
                        )}
                      </div>

                      {/* Feedback preview for graded submissions */}
                      {!isProfessor && isGraded && assignment.submission?.feedback?.overallComments && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm text-green-800">
                            <span className="font-medium">Feedback del profesor:</span> {assignment.submission.feedback.overallComments}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/tareas/${assignment.id}`}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                      >
                        Ver detalles
                      </Link>

                      {/* Action button for students */}
                      {!isProfessor && (
                        <>
                          {isGraded ? (
                            <span className="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded">
                              ✓ Corregida
                            </span>
                          ) : hasSubmission ? (
                            <span className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded">
                              ✓ Entregada
                            </span>
                          ) : (
                            <Link
                              href={`/tareas/${assignment.id}/entregar`}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                            >
                              Entregar
                            </Link>
                          )}
                        </>
                      )}

                      {/* Actions for professors */}
                      {isProfessor && (
                        <>
                          <Link
                            href={`/tareas/${assignment.id}/editar`}
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(assignment.id)}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
