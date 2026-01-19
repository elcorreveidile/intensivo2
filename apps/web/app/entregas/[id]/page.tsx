'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function SubmissionDetailPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();

  const [submission, setSubmission] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const data = await api.getSubmission(submissionId, token || '');
      setSubmission(data.submission);
      setAssignment(data.submission.assignment);
    } catch (err: any) {
      setError(err.message || 'Error al cargar entrega');
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">Borrador</span>;
      case 'submitted':
        return <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">Entregada</span>;
      case 'late':
        return <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">Tarde</span>;
      case 'graded':
        return <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">Calificada</span>;
      default:
        return <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/entregas/pendientes" className="text-blue-600 hover:text-blue-700">
            ← Volver a entregas pendientes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Detalle de Entrega</h1>
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
          <>
            {/* Student Info */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {submission.student.firstName} {submission.student.lastName}
                  </h2>
                  <p className="text-sm text-gray-600">{submission.student.email}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(submission.status)}
                  {submission.submittedAt && (
                    <p className="text-sm text-gray-600 mt-2">
                      Entregado: {new Date(submission.submittedAt).toLocaleString('es-ES')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Assignment Info */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{assignment.title}</h3>
              <p className="text-gray-700 mb-4">{assignment.description}</p>
              {assignment.instructions && (
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.instructions}</p>
                </div>
              )}
            </div>

            {/* Files */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Archivos ({submission.files?.length || 0})
              </h3>

              {submission.files && submission.files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Descargar
                            </a>
                            {(file.fileName.endsWith('.pdf') || file.fileName.endsWith('.mp4')) && (
                              <a
                                href={`${process.env.NEXT_PUBLIC_API_URL}${file.filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Abrir
                              </a>
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

            {/* Student Comments */}
            {submission.studentComments && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Comentarios del Estudiante</h3>
                <div className="bg-blue-50 rounded-md p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.studentComments}</p>
                </div>
              </div>
            )}

            {/* Feedback Section */}
            {submission.feedback ? (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback Enviado</h3>
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-green-900">Calificación Total</span>
                    <span className="text-2xl font-bold text-green-900">
                      {submission.feedback.overallScore || 0}/{assignment.maxScore}
                    </span>
                  </div>
                  {submission.feedback.generalComments && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-green-900 mb-2">Comentarios Generales</p>
                      <p className="text-sm text-green-800 whitespace-pre-wrap">
                        {submission.feedback.generalComments}
                      </p>
                    </div>
                  )}
                  {submission.feedback.rubricScores && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-green-900 mb-2">Desglose por Rúbrica</p>
                      <div className="space-y-2">
                        {Object.entries(submission.feedback.rubricScores).map(([criteria, score]: [string, any]) => (
                          <div key={criteria} className="flex justify-between text-sm">
                            <span className="text-green-800">{criteria}</span>
                            <span className="font-medium text-green-900">{score} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/correccion/${submission.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Editar feedback →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Corregir Entrega</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Añade feedback y calificación para esta entrega
                    </p>
                  </div>
                  <Link
                    href={`/correccion/${submission.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Corregir
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
