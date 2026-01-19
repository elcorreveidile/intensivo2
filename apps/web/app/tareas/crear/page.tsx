'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, CreateAssignmentData, Course } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CrearTareaPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<CreateAssignmentData>({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    maxScore: 100,
    allowedFileTypes: ['pdf'],
    maxFileSizeMb: 100,
    allowLateSubmission: false,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [createdAssignmentId, setCreatedAssignmentId] = useState<string | null>(null);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'profesor')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && token && user.role === 'profesor') {
      loadCourses();
    }
  }, [user, token]);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      console.log('[CrearTarea] Loading courses, user role:', user?.role);
      const data = await api.getCourses(token || '');
      console.log('[CrearTarea] Courses received:', data.courses.length);
      setCourses(data.courses);

      // Auto-select first course if available
      if (data.courses.length > 0 && !selectedCourse) {
        setSelectedCourse(data.courses[0].id);
      }
    } catch (err: any) {
      console.error('[CrearTarea] Error loading courses:', err);
      setError(err.message || 'Error al cargar cursos');
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCourse) {
      setError('Debes seleccionar un curso');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await api.createAssignment(selectedCourse, formData, token || '');
      setCreatedAssignmentId(result.assignment.id);

      // Upload attachments if any
      if (attachmentFiles.length > 0) {
        setUploadingAttachments(true);
        for (const file of attachmentFiles) {
          await api.uploadAssignmentAttachment(result.assignment.id, file, token || '');
        }
      }

      router.push('/tareas');
    } catch (err: any) {
      setError(err.message || 'Error al crear tarea');
      setIsSubmitting(false);
      setUploadingAttachments(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachmentFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileTypeChange = (fileType: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes?.includes(fileType)
        ? prev.allowedFileTypes.filter((t) => t !== fileType)
        : [...(prev.allowedFileTypes || []), fileType],
    }));
  };

  if (isLoading || isSubmitting || uploadingAttachments) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-sm text-gray-600">
          {uploadingAttachments ? 'Subiendo archivos adjuntos...' : isSubmitting ? 'Creando tarea...' : 'Cargando...'}
        </p>
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
          <Link href="/tareas" className="text-blue-600 hover:text-blue-700">
            ← Volver a Tareas
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Crear Nueva Tarea</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h2>

            <div className="space-y-4">
              {/* Course Selector */}
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                  Curso *
                </label>
                {loadingCourses ? (
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando cursos...
                  </div>
                ) : courses.length === 0 ? (
                  <div className="mt-1">
                    <p className="text-sm text-gray-500 mb-2">No tienes cursos creados.</p>
                    <Link
                      href="/cursos/crear"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Crear nuevo curso
                    </Link>
                  </div>
                ) : (
                  <select
                    id="course"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecciona un curso</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Título de la tarea *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Crónica de Granada"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción breve *
                </label>
                <textarea
                  id="description"
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción corta de la tarea"
                />
              </div>

              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                  Instrucciones detalladas
                </label>
                <textarea
                  id="instructions"
                  rows={6}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Instrucciones completas para los estudiantes..."
                />
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                  Fecha límite de entrega *
                </label>
                <input
                  type="datetime-local"
                  id="dueDate"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700">
                  Puntuación máxima
                </label>
                <input
                  type="number"
                  id="maxScore"
                  min="0"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* File Configuration */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración de Archivos</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipos de archivo permitidos
                </label>
                <div className="flex flex-wrap gap-2">
                  {['pdf', 'docx', 'mp3', 'mp4'].map((type) => (
                    <label key={type} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.allowedFileTypes?.includes(type)}
                        onChange={() => handleFileTypeChange(type)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 uppercase">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="maxFileSize" className="block text-sm font-medium text-gray-700">
                  Tamaño máximo de archivo (MB)
                </label>
                <input
                  type="number"
                  id="maxFileSize"
                  min="1"
                  max="500"
                  value={formData.maxFileSizeMb}
                  onChange={(e) => setFormData({ ...formData, maxFileSizeMb: parseInt(e.target.value) || 100 })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowLate"
                  checked={formData.allowLateSubmission}
                  onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label htmlFor="allowLate" className="ml-2 text-sm text-gray-700">
                  Permitir entregas tardías
                </label>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Archivos Adjuntos (Opcional)</h2>
            <p className="text-sm text-gray-600 mb-4">
              Puedes adjuntar archivos adicionales para la tarea (PDFs, documentos, audios, videos).
            </p>

            <div className="space-y-4">
              {/* File Input */}
              <div>
                <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">
                  Seleccionar archivos
                </label>
                <input
                  type="file"
                  id="attachments"
                  multiple
                  accept=".pdf,.docx,.mp3,.mp4"
                  onChange={handleFileSelect}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {/* File List */}
              {attachmentFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Archivos seleccionados:</h4>
                  <ul className="space-y-2">
                    {attachmentFiles.map((file, index) => (
                      <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center flex-1">
                          <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="ml-2 text-red-600 hover:text-red-700"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link
              href="/tareas"
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
