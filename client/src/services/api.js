import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://videoconf-api.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadAvatar: (formData) => api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const roomAPI = {
  createRoom: (title) => api.post('/api/rooms/create', { title }),
  joinRoom: (roomCode) => api.post(`/api/rooms/join/${roomCode}`),
  getRoom: (roomCode) => api.get(`/api/rooms/${roomCode}`),
  endRoom: (roomCode) => api.delete(`/api/rooms/${roomCode}`),
  getUserRooms: () => api.get('/api/rooms/user/rooms'),
  getMyMeetings: () => api.get('/api/rooms/user/meetings')
};

export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: () => api.get('/api/admin/users'),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
  getRooms: () => api.get('/api/admin/rooms'),
  deleteRoom: (id) => api.delete(`/api/admin/rooms/${id}`)
};

export default api;
