import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Entries API
export const getEntries = (params) => api.get('/entries', { params });
export const getStats = () => api.get('/entries/stats');
export const getEntry = (id) => api.get(`/entries/${id}`);
export const createEntry = (data) => api.post('/entries', data);
export const updateEntry = (id, data) => api.put(`/entries/${id}`, data);
export const deleteEntry = (id) => api.delete(`/entries/${id}`);

// Labs API
export const getLabs = (params) => api.get('/labs', { params });
export const getLabStats = () => api.get('/labs/stats');
export const getLab = (id) => api.get(`/labs/${id}`);
export const createLab = (data) => api.post('/labs', data);
export const updateLab = (id, data) => api.put(`/labs/${id}`, data);
export const addLabStep = (id, data) => api.post(`/labs/${id}/steps`, data);
export const addLabError = (id, data) => api.post(`/labs/${id}/errors`, data);
export const deleteLab = (id) => api.delete(`/labs/${id}`);

// Commands API
export const getCommands = (params) => api.get('/commands', { params });
export const getCommandStats = () => api.get('/commands/stats');
export const createCommand = (data) => api.post('/commands', data);
export const updateCommand = (id, data) => api.put(`/commands/${id}`, data);
export const useCommand = (id) => api.post(`/commands/${id}/use`);
export const toggleFavorite = (id) => api.patch(`/commands/${id}/favorite`);
export const deleteCommand = (id) => api.delete(`/commands/${id}`);

// Errors API
export const getErrors = (params) => api.get('/errors', { params });
export const getErrorStats = () => api.get('/errors/stats');
export const suggestFixes = (search) => api.get(`/errors/suggest/${encodeURIComponent(search)}`);
export const createError = (data) => api.post('/errors', data);
export const updateError = (id, data) => api.put(`/errors/${id}`, data);
export const resolveError = (id, data) => api.patch(`/errors/${id}/resolve`, data);
export const deleteError = (id) => api.delete(`/errors/${id}`);

// Reports API
export const getWeeklyReport = () => api.get('/reports/weekly');
export const getSkillScore = () => api.get('/reports/skill');

export default api;
