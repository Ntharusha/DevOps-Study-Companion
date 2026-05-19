import axios from 'axios';
import { getObject, setItem } from './utils/storage';

// Use your local IP for physical devices or 10.0.2.2 for Android Emulator
const BASE_URL = 'http://192.168.1.211:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper for cached GET requests
const cachedGet = async (url, config = {}, cacheKey) => {
  const finalKey = cacheKey || url;
  try {
    const response = await api.get(url, config);
    if (response && response.data) {
      setItem(finalKey, response.data);
    }
    return response;
  } catch (error) {
    const cachedData = getObject(finalKey);
    if (cachedData) {
      console.log(`[Offline Cache] Serving ${finalKey} from MMKV`);
      return { data: cachedData, isCached: true };
    }
    throw error;
  }
};

export const login = (credentials) => api.post('/auth/login', credentials);
export const signup = (userData) => api.post('/auth/register', userData);

export const getStats = () => cachedGet('/entries/stats');
export const getEntries = (params) => cachedGet('/entries', { params }, 'entries_' + JSON.stringify(params || {}));
export const createEntry = (data) => api.post('/entries', data);

export const getLabs = () => cachedGet('/labs');
export const getLab = (id) => cachedGet(`/labs/${id}`, {}, `lab_${id}`);
export const createLab = (data) => api.post('/labs', data);
export const updateLab = (id, data) => api.put(`/labs/${id}`, data);
export const addLabStep = (id, data) => api.post(`/labs/${id}/steps`, data);

export const getProjects = () => cachedGet('/projects');
export const createProject = (data) => api.post('/projects', data);
export const addProjectTime = (id, hours) => api.patch(`/projects/${id}/time`, { hours });

export const getMemoryItems = (params) => cachedGet('/memory', { params }, 'memory_' + JSON.stringify(params || {}));
export const createMemoryItem = (data) => api.post('/memory', data);
export const reviewMemoryItem = (id, strength) => api.patch(`/memory/${id}/review`, { strength });

export const getCommands = () => cachedGet('/commands');

export const getInterviewQuestions = (params) => cachedGet('/interview/questions', { params }, 'interview_questions_' + JSON.stringify(params || {}));
export const getRandomQuestions = (params) => cachedGet('/interview/random', { params }, 'random_questions_' + JSON.stringify(params || {}));

// Habits API
export const getHabits = () => cachedGet('/habits');
export const createHabit = (data) => api.post('/habits', data);
export const toggleHabitComplete = (id) => api.patch(`/habits/${id}/complete`);
export const updateHabit = (id, data) => api.put(`/habits/${id}`, data);
export const deleteHabit = (id) => api.delete(`/habits/${id}`);

// Goals API
export const getGoals = (params) => cachedGet('/goals', { params }, 'goals_' + JSON.stringify(params || {}));
export const createGoal = (data) => api.post('/goals', data);
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);

// Timer API
export const getTimerSessions = (params) => cachedGet('/timer', { params }, 'timer_sessions_' + JSON.stringify(params || {}));
export const getTimerStats = () => cachedGet('/timer/stats');
export const saveTimerSession = (data) => api.post('/timer', data);
export const deleteTimerSession = (id) => api.delete(`/timer/${id}`);

export default api;
