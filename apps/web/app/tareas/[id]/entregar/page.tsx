'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface UploadedFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export default function EntregarTareaPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [assignmentLoading, setAssignmentLoading] = useState(true);

  const assignmentId = params.id as string;

  // Fetch assignment and submission on load
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
      setAssignmentLoading(true);

      // Fetch assignment details
      const assignmentData = await api.getAssignment(assignmentId, token || '');
      setAssignment(assignmentData.assignment);

      // Fetch my submission
      try {
        const submissionData = await api.getMySubmission(assignmentId, token || '');
        setSubmission(submissionData.submission);
        if (submissionData.submission?.files) {
          setUploadedFiles(submissionData.submission.files);
        }
        if (submissionData.submission?.studentComments) {
          setComments(submissionData.submission.studentComments);
        }
      } catch (err) {
        // No submission yet, that's fine
        console.log('No existing submission');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar tarea');
    } finally {
      setAssignmentLoading(false);
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(Array.from(files));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFiles = async (files: File[]) => {
    // Validate file types
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'audio/mpeg', 'audio/mp3', 'video/mp4'];
    const maxSize = assignment?.maxFileSizeMb ? assignment.maxFileSizeMb * 1024 * 1024 : 100 * 1024 * 1024;

    for (const file of files) {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        setError(`Tipo de archivo no permitido: ${file.type}`);
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        setError(`Archivo demasiado grande (máx ${assignment?.maxFileSizeMb || 100}MB)`);
        return;
      }
    }

    // Upload files
    setUploading(true);
    setError('');

    try {
      // Create/update submission first
      const submissionData = await api.createOrUpdateSubmission(assignmentId, { comments }, token || '');
      setSubmission(submissionData.submission);

      // Upload each file
      for (const file of files) {
        setUploadProgress(0);
        const result = await api.uploadSubmissionFile(submissionData.submission.id, file, token || '');
        setUploadedFiles((prev) => [...prev, result.file]);
        setUploadProgress(100);
      }
    } catch (err: any) {
      setError(err.message || 'Error al subir archivos');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    try {
      await api.deleteSubmissionFile(fileId, token || '');
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar archivo');
    }
  };

  const handleSubmit = async () => {
    if (!submission) {
      setError('Debes subir al menos un archivo antes de entregar');
      return;
    }

    if (uploadedFiles.length === 0) {
      setError('Debes subir al menos un archivo');
      return;
    }

    const confirmed = window.confirm(
      '¿Estás seguro de que quieres entregar esta tarea? No podrás hacer cambios después de entregar.'
    );

    if (!confirmed) return;

    try {
      await api.submitAssignment(submission.id, token || '');
      router.push('/dashboard/estudiante');
    } catch (err: any) {
      setError(err.message || 'Error al entregar tarea');
    }
  };

  const handleSaveDraft = async () => {
    try {
      await api.createOrUpdateSubmission(assignmentId, { comments }, token || '');
      alert('Borrador guardado');
    } catch (err: any) {
      setError(err.message || 'Error al guardar borrador');
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
    router.push('/dashboard');
    return null;
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Link href="/tareas" className="text-blue-600 hover:underline mt-4 inline-block">
            Volver a tareas
          </Link>
        </div>
      </div>
    );
  }

  const dueDate = assignment ? new Date(assignment.dueDate) : null;
  const isPastDue = dueDate && dueDate < new Date();
  const canSubmit = !isPastDue || assignment?.allowLateSubmission;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/tareas/${assignmentId}`} className="text-blue-600 hover:text-blue-700">
            ← Volver a tarea
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {assignment?.title || 'Subir Entrega'}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {assignment && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Instrucciones de la tarea</h2>
            <p className="text-gray-700 mb-2">{assignment.description}</p>
            {assignment.instructions && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.instructions}</p>
              </div>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <div className={`flex items-center ${isPastDue ? 'text-red-600' : ''}`}>
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Fecha límite: {dueDate?.toLocaleString('es-ES')}
                {isPastDue && ' (Vencida)'}
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Máximo: {assignment.maxFileSizeMb}MB
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Tipos: {assignment.allowedFileTypes?.join(', ').toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Subir Archivos</h2>

          {/* Dropzone */}
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              uploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.docx,.mp3,.mp4"
            />

            {uploading ? (
              <div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Subiendo archivos... {uploadProgress}%</p>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4 4h8"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Arrastra y suelta archivos aquí, o{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    haz clic para seleccionar
                  </button>
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, DOCX, MP3, MP4 (máx {assignment?.maxFileSizeMb || 100}MB)
                </p>
              </>
            )}
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-medium text-gray-900">Archivos cargados</h3>
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center flex-1">
                    <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    disabled={submission?.status !== 'draft'}
                    className="ml-4 text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    title="Eliminar archivo"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h2a1 1 0 011 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Comentarios (opcional)</h2>
          <textarea
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            disabled={submission?.status !== 'draft'}
            placeholder="Añade comentarios para el profesor..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleSaveDraft}
            disabled={uploading}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Guardar Borrador
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !canSubmit || uploadedFiles.length === 0}
            className="px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submission?.status !== 'draft' ? 'Ya enviada' : uploading ? 'Procesando...' : 'Entregar Tarea'}
          </button>
        </div>
      </main>
    </div>
  );
}
