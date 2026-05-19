import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Auth API
export const login = (credentials) => api.post('/auth/login', credentials);

// Projects API
export const getProjects = () => api.get('/projects');
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const addProjectTime = (id, hours) => api.patch(`/projects/${id}/time`, { hours });
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// Memory Bank API
export const getMemoryItems = (params) => api.get('/memory', { params });
export const createMemoryItem = (data) => api.post('/memory', data);
export const reviewMemoryItem = (id, strength) => api.patch(`/memory/${id}/review`, { strength });
export const deleteMemoryItem = (id) => api.delete(`/memory/${id}`);

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

// Interview API
export const getInterviewQuestions = (params) => api.get('/interview/questions', { params });
export const getRandomQuestions = (params) => api.get('/interview/random', { params });
export const seedInterviewBank = () => api.get('/interview/seed');
export const createInterviewQuestion = (data) => api.post('/interview/questions', data);
export const toggleQuestionFavorite = (id) => api.patch(`/interview/questions/${id}/favorite`);
export const deleteInterviewQuestion = (id) => api.delete(`/interview/questions/${id}`);

// Habits API
export const getHabits = () => api.get('/habits');
export const createHabit = (data) => api.post('/habits', data);
export const toggleHabitComplete = (id) => api.patch(`/habits/${id}/complete`);
export const updateHabit = (id, data) => api.put(`/habits/${id}`, data);
export const deleteHabit = (id) => api.delete(`/habits/${id}`);

// Goals API
export const getGoals = (params) => api.get('/goals', { params });
export const createGoal = (data) => api.post('/goals', data);
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);

// Timer API
export const getTimerSessions = (params) => api.get('/timer', { params });
export const getTimerStats = () => api.get('/timer/stats');
export const saveTimerSession = (data) => api.post('/timer', data);
export const deleteTimerSession = (id) => api.delete(`/timer/${id}`);

export default api;
