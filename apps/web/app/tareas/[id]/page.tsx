'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, Assignment } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function TareaDetallePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const assignmentId = params.id as string;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && token && assignmentId) {
      loadData();
    }
  }, [user, token, assignmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getAssignment(assignmentId, token || '');
      setAssignment(data.assignment);

      // Load submission if student
      if (user && user.role === 'estudiante') {
        try {
          const subData = await api.getMySubmission(assignmentId, token || '');
          setSubmission(subData.submission);
        } catch {
          // No submission yet
          setSubmission(null);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar tarea');
    } finally {
      setLoading(false);
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

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Tarea no encontrada'}</p>
          <Link href="/tareas" className="text-blue-600 hover:underline mt-4 inline-block">
            Volver a tareas
          </Link>
        </div>
      </div>
    );
  }

  const isProfessor = user.role === 'profesor';
  const dueDate = new Date(assignment.dueDate);
  const isPastDue = dueDate < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/tareas" className="text-blue-600 hover:text-blue-700">
            ← Volver a Tareas
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
                <p className="mt-2 text-lg text-gray-600">{assignment.description}</p>
              </div>
              {isProfessor && (
                <Link
                  href={`/tareas/${assignment.id}/editar`}
                  className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                >
                  Editar
                </Link>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Instructions */}
            {assignment.instructions && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Instrucciones</h2>
                <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap">
                  {assignment.instructions}
                </div>
              </div>
            )}

            {/* Assignment Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Detalles de la tarea</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-500">Fecha límite</dt>
                  <dd className={`mt-1 text-sm font-medium ${isPastDue ? 'text-red-600' : 'text-gray-900'}`}>
                    {dueDate.toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {isPastDue && ' (Vencida)'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Puntuación máxima</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{assignment.maxScore} puntos</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Tamaño máximo</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{assignment.maxFileSizeMb} MB</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Entregas tardías</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {assignment.allowLateSubmission ? 'Permitidas' : 'No permitidas'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Allowed File Types */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Tipos de archivo aceptados</h3>
              <div className="flex flex-wrap gap-2">
                {assignment.allowedFileTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {type.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            {/* Assignment Attachments */}
            {assignment.attachmentFiles && assignment.attachmentFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Archivos Adjuntos</h3>
                <div className="space-y-2">
                  {assignment.attachmentFiles.map((file: any) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center flex-1">
                        <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                          <p className="text-xs text-gray-500">{(file.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}${file.filePath}`}
                        download={file.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                      >
                        Descargar
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rubric */}
            {assignment.rubric && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Rúbrica de evaluación</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Criterio
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Puntuación
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignment.rubric.criteria?.map((criterion: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{criterion.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                            {criterion.max} pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              {!isProfessor && (
                <>
                  {submission && (submission.status === 'submitted' || submission.status === 'late' || submission.status === 'graded') ? (
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2 text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">
                          {submission.status === 'graded' ? 'Calificada' : 'Entregada'} el {new Date(submission.submittedAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      {submission.status === 'graded' && submission.feedback && (
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">Nota: {submission.feedback.overallScore || 0}/{assignment.maxScore}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={`/tareas/${assignment.id}/entregar`}
                      className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {submission?.status === 'draft' ? 'Continuar Entrega' : 'Subir Entrega'}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
