import axios from 'axios';

// Use your local IP for physical devices or 10.0.2.2 for Android Emulator
const BASE_URL = 'http://192.168.1.211:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = (credentials) => api.post('/auth/login', credentials);

export const getStats = () => api.get('/entries/stats');
export const getEntries = (params) => api.get('/entries', { params });
export const createEntry = (data) => api.post('/entries', data);

export const getLabs = () => api.get('/labs');
export const getLab = (id) => api.get(`/labs/${id}`);
export const updateLab = (id, data) => api.put(`/labs/${id}`, data);
export const addLabStep = (id, data) => api.post(`/labs/${id}/steps`, data);

export const getProjects = () => api.get('/projects');
export const addProjectTime = (id, hours) => api.patch(`/projects/${id}/time`, { hours });

export const getMemoryItems = (params) => api.get('/memory', { params });
export const reviewMemoryItem = (id, strength) => api.patch(`/memory/${id}/review`, { strength });

export const getInterviewQuestions = (params) => api.get('/interview/questions', { params });
export const getRandomQuestions = (params) => api.get('/interview/random', { params });

export default api;
