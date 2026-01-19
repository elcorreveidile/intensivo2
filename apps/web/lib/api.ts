const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'profesor' | 'estudiante';
  profilePictureUrl?: string;
  nativeLanguage?: string;
  proficiencyLevel?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'profesor' | 'estudiante';
}

export interface AssignmentAttachment {
  id: string;
  assignmentId: string;
  fileName: string;
  filePath: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedAt: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  maxScore: number;
  allowedFileTypes: string[];
  maxFileSizeMb: number;
  allowLateSubmission: boolean;
  rubric?: any;
  attachments?: any;
  orderIndex: number;
  publishedAt: string;
  attachmentFiles?: AssignmentAttachment[];
  course?: {
    id: string;
    name: string;
    code: string;
  };
  _count?: {
    submissions: number;
  };
}

export interface CreateAssignmentData {
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  maxScore?: number;
  allowedFileTypes?: string[];
  maxFileSizeMb?: number;
  allowLateSubmission?: boolean;
  rubric?: any;
  attachments?: any;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  professorId: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  professor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    enrollments: number;
    assignments: number;
  };
}

export interface CreateCourseData {
  name: string;
  code: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxStudents?: number;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export const api = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al iniciar sesión', response.status);
    }

    return data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al registrar', response.status);
    }

    return data;
  },

  async getMe(token: string): Promise<{ user: User }> {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al obtener usuario', response.status);
    }

    return data;
  },

  async logout(): Promise<void> {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  // Assignments
  async getAssignments(courseId: string, token: string): Promise<{ assignments: Assignment[] }> {
    const response = await fetch(`${API_URL}/api/courses/${courseId}/assignments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al obtener tareas', response.status);
    }

    return data;
  },

  async getAssignment(assignmentId: string, token: string): Promise<{ assignment: Assignment }> {
    const response = await fetch(`${API_URL}/api/assignments/${assignmentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al obtener tarea', response.status);
    }

    return data;
  },

  async createAssignment(courseId: string, data: CreateAssignmentData, token: string): Promise<{ assignment: Assignment; message: string }> {
    const response = await fetch(`${API_URL}/api/courses/${courseId}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const res = await response.json();

    if (!response.ok) {
      throw new ApiError(res.error?.message || res.message || 'Error al crear tarea', response.status);
    }

    return res;
  },

  async updateAssignment(assignmentId: string, data: Partial<CreateAssignmentData>, token: string): Promise<{ assignment: Assignment; message: string }> {
    const response = await fetch(`${API_URL}/api/assignments/${assignmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const res = await response.json();

    if (!response.ok) {
      throw new ApiError(res.error?.message || res.message || 'Error al actualizar tarea', response.status);
    }

    return res;
  },

  async deleteAssignment(assignmentId: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(data.error?.message || data.message || 'Error al eliminar tarea', response.status);
    }
  },

  // Submissions
  async getMySubmission(assignmentId: string, token: string): Promise<{ submission: any }> {
    const response = await fetch(`${API_URL}/api/assignments/${assignmentId}/my-submission`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al obtener entrega', response.status);
    }

    return data;
  },

  async getSubmissionsForAssignment(assignmentId: string, token: string): Promise<{ submissions: any[] }> {
    const response = await fetch(`${API_URL}/api/assignments/${assignmentId}/submissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al obtener entregas', response.status);
    }

    return data;
  },

  async getSubmission(submissionId: string, token: string): Promise<{ submission: any }> {
    const response = await fetch(`${API_URL}/api/submissions/${submissionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al obtener entrega', response.status);
    }

    return data;
  },

  async createOrUpdateSubmission(assignmentId: string, data: { comments?: string }, token: string): Promise<{ submission: any }> {
    const response = await fetch(`${API_URL}/api/assignments/${assignmentId}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const res = await response.json();

    if (!response.ok) {
      throw new ApiError(res.error?.message || res.message || 'Error al crear entrega', response.status);
    }

    return res;
  },

  async submitAssignment(submissionId: string, token: string): Promise<{ submission: any; message: string }> {
    const response = await fetch(`${API_URL}/api/submissions/${submissionId}/submit`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al entregar', response.status);
    }

    return data;
  },

  async uploadSubmissionFile(submissionId: string, file: File, token: string): Promise<{ file: any; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/submissions/${submissionId}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al subir archivo', response.status);
    }

    return data;
  },

  async deleteSubmissionFile(fileId: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/submissions/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(data.error?.message || data.message || 'Error al eliminar archivo', response.status);
    }
  },

  // Feedback
  async getFeedback(submissionId: string, token: string): Promise<{ feedback: any }> {
    const response = await fetch(`${API_URL}/api/submissions/${submissionId}/feedback`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al obtener feedback', response.status);
    }

    return data;
  },

  async createFeedback(submissionId: string, data: {
    overallScore: number;
    overallComments?: string;
    rubricScores?: Record<string, number>;
  }, token: string): Promise<{ feedback: any; message: string }> {
    const response = await fetch(`${API_URL}/api/submissions/${submissionId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const res = await response.json();

    if (!response.ok) {
      throw new ApiError(res.error?.message || res.message || 'Error al crear feedback', response.status);
    }

    return res;
  },

  async updateFeedback(submissionId: string, data: {
    overallScore?: number;
    overallComments?: string;
    rubricScores?: Record<string, number>;
  }, token: string): Promise<{ feedback: any; message: string }> {
    const response = await fetch(`${API_URL}/api/submissions/${submissionId}/feedback`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const res = await response.json();

    if (!response.ok) {
      throw new ApiError(res.error?.message || res.message || 'Error al actualizar feedback', response.status);
    }

    return res;
  },

  async getProfessorStats(token: string): Promise<{
    totalSubmissions: number;
    submitted: number;
    graded: number;
    pending: number;
  }> {
    const response = await fetch(`${API_URL}/api/profesor/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al obtener estadísticas', response.status);
    }

    return data;
  },

  // Courses
  async getCourses(token: string): Promise<{ courses: Course[] }> {
    const response = await fetch(`${API_URL}/api/courses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al obtener cursos', response.status);
    }

    return data;
  },

  async getCourse(courseId: string, token: string): Promise<{ course: Course }> {
    const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al obtener curso', response.status);
    }

    return data;
  },

  async createCourse(courseData: CreateCourseData, token: string): Promise<{ message: string; course: Course }> {
    const response = await fetch(`${API_URL}/api/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(courseData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al crear curso', response.status);
    }

    return data;
  },

  async updateCourse(courseId: string, courseData: Partial<CreateCourseData>, token: string): Promise<{ message: string; course: Course }> {
    const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(courseData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al actualizar curso', response.status);
    }

    return data;
  },

  async deleteCourse(courseId: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al eliminar curso', response.status);
    }

    return data;
  },

  // Student Management (Professor only)
  async createStudent(studentData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }, token: string): Promise<{ message: string; student: any }> {
    const response = await fetch(`${API_URL}/api/auth/create-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(studentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al crear estudiante', response.status);
    }

    return data;
  },

  async getStudents(token: string): Promise<{ students: any[] }> {
    const response = await fetch(`${API_URL}/api/auth/students`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al obtener estudiantes', response.status);
    }

    return data;
  },

  // Assignment Attachments (Professor only)
  async uploadAssignmentAttachment(assignmentId: string, file: File, token: string): Promise<{ message: string; attachment: any }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/assignments/${assignmentId}/attachments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al adjuntar archivo', response.status);
    }

    return data;
  },

  async getAssignmentAttachments(assignmentId: string, token: string): Promise<{ attachments: any[] }> {
    const response = await fetch(`${API_URL}/api/assignments/${assignmentId}/attachments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error?.message || data.message || 'Error al obtener adjuntos', response.status);
    }

    return data;
  },

  async deleteAssignmentAttachment(attachmentId: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/assignments/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(data.error?.message || data.message || 'Error al eliminar adjunto', response.status);
    }
  },
};