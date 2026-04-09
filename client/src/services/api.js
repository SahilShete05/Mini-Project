import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
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
      localStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

export const registerUser = (payload) => api.post('/auth/register', payload);
export const registerDoctorRequest = (payload) => api.post('/auth/register-doctor-request', payload);
export const loginUser = (payload) => api.post('/auth/login', payload);
export const getCurrentUser = () => api.get('/auth/me');

export const getDoctors = () => api.get('/doctors');
export const addDoctor = (payload) => api.post('/doctors', payload);
export const removeDoctor = (id) => api.delete(`/doctors/${id}`);

export const getAppointments = () => api.get('/appointments');
export const bookAppointment = (payload) => api.post('/appointments', payload);
export const approveAppointment = (id) => api.patch(`/appointments/${id}/approve`);
export const rejectAppointment = (id) => api.patch(`/appointments/${id}/reject`);
export const cancelAppointment = (id) => api.delete(`/appointments/${id}`);

export const getUsers = () => api.get('/admin/users');
export const updateUser = (id, payload) => api.put(`/admin/users/${id}`, payload);
export const removeUser = (id) => api.delete(`/admin/users/${id}`);
export const getDoctorRequests = () => api.get('/admin/doctor-requests');
export const updateDoctorRequestStatus = (id, status) => api.patch(`/admin/doctor-requests/${id}`, { status });
export const updateDoctor = (id, payload) => api.put(`/admin/doctors/${id}`, payload);

export default api;