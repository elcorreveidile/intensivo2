'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, CreateAssignmentData, Assignment } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditarTareaPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'profesor')) {
      router.push('/dashboard');
      return;
    }

    if (user && token && assignmentId) {
      loadAssignment();
    }
  }, [user, token, assignmentId, isLoading]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const data = await api.getAssignment(assignmentId, token || '');
      const assignment = data.assignment;

      // Format date for datetime-local input
      const dueDate = new Date(assignment.dueDate);
      const formattedDate = dueDate.toISOString().slice(0, 16);

      setFormData({
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions || '',
        dueDate: formattedDate,
        maxScore: assignment.maxScore,
        allowedFileTypes: assignment.allowedFileTypes || ['pdf'],
        maxFileSizeMb: assignment.maxFileSizeMb || 100,
        allowLateSubmission: assignment.allowLateSubmission || false,
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar tarea');
      if (err.message?.includes('not found') || err.message?.includes('404')) {
        router.push('/tareas');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsSubmitting(true);

    try {
      await api.updateAssignment(assignmentId, formData, token || '');
      router.push('/tareas');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar tarea');
      setIsSubmitting(false);
    }
  };

  const handleFileTypeChange = (fileType: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes?.includes(fileType)
        ? prev.allowedFileTypes.filter((t) => t !== fileType)
        : [...(prev.allowedFileTypes || []), fileType],
    }));
  };

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
          <Link href="/tareas" className="text-blue-600 hover:text-blue-700">
            ← Volver a Tareas
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Editar Tarea</h1>
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
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
