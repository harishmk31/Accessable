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

// Auth endpoints
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData)
};

// Place endpoints
export const placeService = {
  getPlaces: (params = {}) => api.get('/places', { params }),
  getPlaceById: (id) => api.get(`/places/${id}`),
  createPlace: (placeData) => api.post('/places', placeData),
  updatePlace: (id, placeData) => api.put(`/places/${id}`, placeData),
  deletePlace: (id) => api.delete(`/places/${id}`),
  verifyPlace: (id, payload) => api.patch(`/places/${id}/verify`, payload),
  getPlaceStats: () => api.get('/places/stats/overview')
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
