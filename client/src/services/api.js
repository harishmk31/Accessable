import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessable_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth endpoints & bookmarks
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  toggleSavePlace: (placeId) => api.post(`/auth/save-place/${placeId}`),
  getSavedPlaces: () => api.get('/auth/saved-places')
};

// Place endpoints with geospatial and Tamil Nadu regional queries
export const placeService = {
  getPlaces: (params = {}) => api.get('/places', { params }),
  getNearbyPlaces: (params = {}) => api.get('/places/nearby', { params }),
  searchPlaces: (q) => api.get('/places/search', { params: { q } }),
  getCategories: () => api.get('/places/categories'),
  getDistricts: () => api.get('/places/districts'),
  getPlaceById: (id) => api.get(`/places/${id}`),
  getPlaceAccessibility: (id) => api.get(`/places/${id}/accessibility`),
  createPlace: (placeData) => api.post('/places', placeData),
  updatePlace: (id, placeData) => api.put(`/places/${id}`, placeData),
  deletePlace: (id) => api.delete(`/places/${id}`),
  verifyPlace: (id, payload) => api.patch(`/places/${id}/verify`, payload),
  getPlaceStats: () => api.get('/places/stats/overview'),
  getProviderStatus: () => api.get('/places/provider/status'),

  // Report inaccuracy
  submitReport: (placeId, reportData) => api.post(`/places/${placeId}/reports`, reportData),
  getAdminReports: () => api.get('/places/admin/reports'),
  updateReportStatus: (id, payload) => api.patch(`/places/admin/reports/${id}`, payload)
};

// Review endpoints
export const reviewService = {
  getPlaceReviews: (placeId) => api.get(`/reviews/place/${placeId}`),
  addReview: (placeId, reviewData) => api.post(`/reviews/place/${placeId}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getAllReviewsAdmin: () => api.get('/reviews/admin/all'),
  toggleModerateReview: (id) => api.patch(`/reviews/${id}/moderate`)
};

export default api;
