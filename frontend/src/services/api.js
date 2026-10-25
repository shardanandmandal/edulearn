// API Service layer communicating with backend

const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('edulearn_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateProfile(updates) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Courses
  async getCourses(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.category) params.append('category', filters.category);

    const res = await fetch(`${API_BASE}/courses?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getCourse(id) {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getCourseClassroom(id) {
    const res = await fetch(`${API_BASE}/courses/${id}/learn`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async toggleLessonProgress(courseId, lessonId) {
    const res = await fetch(`${API_BASE}/courses/${courseId}/progress`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lessonId })
    });
    return res.json();
  },

  async getMyLearning() {
    const res = await fetch(`${API_BASE}/courses/student/my-learning`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Payments
  async generateQR(courseId) {
    const res = await fetch(`${API_BASE}/payments/generate-qr/${courseId}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async submitUTR(data) {
    const res = await fetch(`${API_BASE}/payments/submit-utr`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getMyPayments() {
    const res = await fetch(`${API_BASE}/payments/my-history`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Content (Protected document reader)
  async getDocumentContent(courseId, lessonId) {
    const token = localStorage.getItem('edulearn_token');
    const res = await fetch(`${API_BASE}/content/document/${courseId}/${lessonId}?token=${encodeURIComponent(token || '')}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Admin APIs
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async createCourse(formData) {
    const token = localStorage.getItem('edulearn_token');
    const res = await fetch(`${API_BASE}/admin/courses`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData // multipart/form-data
    });
    return res.json();
  },

  async updateCourse(courseId, formData) {
    const token = localStorage.getItem('edulearn_token');
    const res = await fetch(`${API_BASE}/admin/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    return res.json();
  },

  async deleteCourse(courseId) {
    const res = await fetch(`${API_BASE}/admin/courses/${courseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async uploadLesson(courseId, formData) {
    const token = localStorage.getItem('edulearn_token');
    const res = await fetch(`${API_BASE}/admin/courses/${courseId}/lessons`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    return res.json();
  },

  async deleteLesson(lessonId) {
    const res = await fetch(`${API_BASE}/admin/lessons/${lessonId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getAdminPayments() {
    const res = await fetch(`${API_BASE}/admin/payments`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updatePaymentStatus(paymentId, status) {
    const res = await fetch(`${API_BASE}/admin/payments/${paymentId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async getAdminSettings() {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateAdminSettings(settings) {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    return res.json();
  }
};
