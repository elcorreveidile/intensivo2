'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, Assignment } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AssignmentWithStatus extends Assignment {
  submissionStatus?: 'draft' | 'submitted' | 'late' | 'graded' | 'none';
  submittedAt?: Date;
}

export default function EstudianteDashboard() {
  const { user, logout, isLoading, token } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'estudiante')) {
      router.push('/login');
      return;
    }

    if (user && token) {
      loadDashboardData();
    }
  }, [user, token, isLoading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get courses for the student
      const coursesData = await api.getCourses(token || '');

      if (coursesData.courses.length === 0) {
        setLoading(false);
        return;
      }

      const courseId = coursesData.courses[0].id;

      // Get all assignments for the course
      const assignmentsData = await api.getAssignments(courseId, token || '');

      // Get submissions status for each assignment
      const assignmentsWithStatus = await Promise.all(
        assignmentsData.assignments.map(async (assignment) => {
          try {
            const submissionData = await api.getMySubmission(assignment.id, token || '');
            return {
              ...assignment,
              submissionStatus: submissionData.submission?.status as 'draft' | 'submitted' | 'late' | 'graded' | 'none',
              submittedAt: submissionData.submission?.submittedAt ? new Date(submissionData.submission.submittedAt) : undefined,
            };
          } catch {
            return {
              ...assignment,
              submissionStatus: 'none' as const,
            };
          }
        })
      );

      setAssignments(assignmentsWithStatus);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
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

  const pendingAssignments = assignments.filter((a) => a.submissionStatus === 'none' || a.submissionStatus === 'draft');
  const completedAssignments = assignments.filter((a) => a.submissionStatus === 'submitted' || a.submissionStatus === 'late' || a.submissionStatus === 'graded');
  const progress = assignments.length > 0 ? Math.round((completedAssignments.length / assignments.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aula Virtual CLMABROAD</h1>
            <p className="text-sm text-gray-600">Panel del Estudiante</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {user.firstName} {user.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Bienvenido, {user.firstName}
          </h2>
          <p className="mt-2 text-gray-600">
            Curso intensivo de español - Nivel C1
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Tu Progreso</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Tareas completadas</span>
              <span className="text-sm font-medium text-gray-700">
                {completedAssignments.length} de {assignments.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{progress}% completado</p>
          </div>
        </div>

        {/* Pending Assignments */}
        {pendingAssignments.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Tareas Pendientes ({pendingAssignments.length})</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingAssignments.map((assignment) => {
                  const isDraft = assignment.submissionStatus === 'draft';
                  const dueDate = new Date(assignment.dueDate);
                  const isLate = dueDate < new Date();

                  return (
                    <div
                      key={assignment.id}
                      className={`border-l-4 ${isLate ? 'border-red-400 bg-red-50' : isDraft ? 'border-yellow-400 bg-yellow-50' : 'border-blue-400 bg-blue-50'} p-4`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isLate ? 'text-red-800' : isDraft ? 'text-yellow-800' : 'text-blue-800'}`}>
                            {assignment.title}
                          </p>
                          <p className={`text-sm mt-1 ${isLate ? 'text-red-700' : isDraft ? 'text-yellow-700' : 'text-blue-700'}`}>
                            Fecha límite: {dueDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            {isLate && ' (Vencida)'}
                          </p>
                          {isDraft && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                              Borrador guardado
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/tareas/${assignment.id}/entregar`}
                          className="ml-4 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                        >
                          {isDraft ? 'Continuar' : 'Entregar'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Completed Assignments */}
        {completedAssignments.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Tareas Completadas ({completedAssignments.length})</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {completedAssignments.map((assignment) => (
                  <div key={assignment.id} className="border-l-4 border-green-400 bg-green-50 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">{assignment.title}</p>
                        <p className="text-sm text-green-700 mt-1">
                          Entregada: {assignment.submittedAt?.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-2">
                          ✓ Entregada
                        </span>
                      </div>
                      <Link
                        href={`/tareas/${assignment.id}`}
                        className="ml-4 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No assignments message */}
        {assignments.length === 0 && (
          <div className="bg-white rounded-lg shadow mb-8 p-6 text-center">
            <p className="text-gray-500">No hay tareas disponibles todavía.</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Acciones Rápidas</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/tareas"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ver Todas las Tareas
            </Link>
            <Link
              href="/entregas/mis-entregas"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mis Entregas
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
