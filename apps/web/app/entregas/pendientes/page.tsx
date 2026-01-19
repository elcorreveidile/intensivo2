'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EntregasPendientesPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'submitted' | 'late' | 'graded'>('all');
  const [courseId, setCourseId] = useState<string>('');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'profesor')) {
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
      setAssignments(assignmentsData.assignments);

      // Load submissions for each assignment
      const submissionsPromises = assignmentsData.assignments.map(async (assignment: any) => {
        try {
          const data = await api.getSubmissionsForAssignment(assignment.id, token || '');
          return data.submissions.map((sub: any) => ({ ...sub, assignment }));
        } catch {
          return [];
        }
      });

      const results = await Promise.all(submissionsPromises);
      const allSubmissions = results.flat();
      setSubmissions(allSubmissions);
    } catch (err: any) {
      setError(err.message || 'Error al cargar entregas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Borrador</span>;
      case 'submitted':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Entregada</span>;
      case 'late':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Tarde</span>;
      case 'graded':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Calificada</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  const pendingCount = submissions.filter((s) => s.status === 'submitted' || s.status === 'late').length;
  const gradedCount = submissions.filter((s) => s.status === 'graded').length;

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'profesor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard/profesor" className="text-blue-600 hover:text-blue-700">
            ← Volver al Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Entregas por Corregir</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entregas</p>
                <p className="text-2xl font-semibold text-gray-900">{submissions.length}</p>
              </div>
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-semibold text-orange-600">{pendingCount}</p>
              </div>
              <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
                <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Corregidas</p>
                <p className="text-2xl font-semibold text-green-600">{gradedCount}</p>
              </div>
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilter('submitted')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    filter === 'submitted'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Entregadas
                </button>
                <button
                  onClick={() => setFilter('late')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    filter === 'late'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tarde
                </button>
                <button
                  onClick={() => setFilter('graded')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    filter === 'graded'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Calificadas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay entregas</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all'
                ? 'Aún no hay entregas de estudiantes'
                : `No hay entregas con estado "${filter}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div key={submission.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {submission.student.firstName} {submission.student.lastName}
                      </h4>
                      {getStatusBadge(submission.status)}
                      {submission.feedback && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          {submission.feedback.overallScore || 0}/{submission.assignment.maxScore} pts
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      <span className="font-medium">{submission.assignment.title}</span>
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
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
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        {submission.student.email}
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {submission.files?.length || 0} archivo{(submission.files?.length || 0) !== 1 ? 's' : ''}
                      </div>
                      {submission.submittedAt && (
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
                          {new Date(submission.submittedAt).toLocaleDateString('es-ES')} {
                            new Date(submission.submittedAt).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          }
                        </div>
                      )}
                      {submission.studentComments && (
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
                              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                            />
                          </svg>
                          Con comentarios
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/entregas/${submission.id}`}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      {submission.status === 'graded' ? 'Ver Corrección' : 'Revisar y Corregir'}
                    </Link>
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
