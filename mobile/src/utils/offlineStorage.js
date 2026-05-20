import { storage } from './storage';

// Helper to get/set tables in MMKV
const getTable = (tableName) => {
  const data = storage.getString(`offline_${tableName}`);
  return data ? JSON.parse(data) : [];
};

const setTable = (tableName, data) => {
  storage.set(`offline_${tableName}`, JSON.stringify(data));
};

// Unique ID generator
const generateId = () => {
  return Math.random().toString(36).substring(2, 11);
};

// Week number helper
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getCurrentWeekLabel() {
  const d = new Date();
  const year = d.getFullYear();
  const weekNum = getWeekNumber(d);
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

// XP and Plant helpers
function calculateTimerXP(minutes, mode) {
  const base = Math.floor(minutes / 5) * 5; 
  const multiplier = mode === 'pomodoro' ? 1.5 : 1;
  return Math.max(5, Math.round(base * multiplier));
}

export function getPlantLevel(xp) {
  if (xp < 50) return { level: 1, name: 'Seed 🌱', emoji: '🌱', next: 50 };
  if (xp < 150) return { level: 2, name: 'Sprout 🌿', emoji: '🌿', next: 150 };
  if (xp < 300) return { level: 3, name: 'Sapling 🌾', emoji: '🌾', next: 300 };
  if (xp < 500) return { level: 4, name: 'Bush 🌳', emoji: '🌳', next: 500 };
  if (xp < 800) return { level: 5, name: 'Young Tree 🌲', emoji: '🌲', next: 800 };
  if (xp < 1200) return { level: 6, name: 'Tree 🌴', emoji: '🌴', next: 1200 };
  return { level: 7, name: 'Ancient Tree 🎋', emoji: '🎋', next: null };
}

// Seed initial database
export const initDB = (force = false) => {
  const initialized = storage.getBoolean('offline_initialized');
  if (initialized && !force) return;

  const currentWeek = getCurrentWeekLabel();

  // 1. Commands
  const initialCommands = [
    {
      _id: 'cmd_1',
      title: 'List Docker Containers',
      command: 'docker ps -a',
      description: 'Show all docker containers, both running and stopped.',
      category: 'Docker',
      isFavorite: true,
      useCount: 5,
      tags: ['docker', 'cli'],
      notes: 'Use without -a for only running containers',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'cmd_2',
      title: 'Get Kubernetes Pods',
      command: 'kubectl get pods -A',
      description: 'List all pods in all namespaces.',
      category: 'Kubernetes',
      isFavorite: false,
      useCount: 3,
      tags: ['k8s', 'cli'],
      notes: '',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'cmd_3',
      title: 'Check Disk Space',
      command: 'df -h',
      description: 'Show disk space usage in human-readable format.',
      category: 'Linux',
      isFavorite: false,
      useCount: 8,
      tags: ['linux', 'fundamentals'],
      notes: '',
      createdAt: new Date().toISOString()
    }
  ];

  // 2. Questions
  const initialQuestions = [
    {
      _id: 'q_1',
      question: "What is the difference between a process and a thread?",
      answer: "A process is an independent program execution with its own memory space. A thread is a subset of a process that shares the same memory space but executes independently. Processes are heavier and safer; threads are lighter and faster for communication.",
      category: "Linux",
      difficulty: "Medium",
      tags: ["os", "fundamentals"],
      isFavorite: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'q_2',
      question: "What is the difference between an Image and a Container?",
      answer: "An Image is a read-only template with instructions for creating a Docker container. A Container is a runnable instance of an image. Think of an image as a Class and a container as an Instance of that class.",
      category: "Docker",
      difficulty: "Easy",
      tags: ["basics"],
      isFavorite: false,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'q_3',
      question: "What is a Pod in Kubernetes?",
      answer: "A Pod is the smallest deployable unit in Kubernetes. It represents a single instance of a running process in your cluster and can contain one or more containers that share network and storage.",
      category: "Kubernetes",
      difficulty: "Easy",
      tags: ["basics"],
      isFavorite: false,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'q_4',
      question: "What is the difference between 'git fetch' and 'git pull'?",
      answer: "'git fetch' only downloads the latest changes from the remote repository but doesn't merge them. 'git pull' does a 'git fetch' followed immediately by a 'git merge' into your current branch.",
      category: "Git",
      difficulty: "Easy",
      tags: ["basics"],
      isFavorite: true,
      createdAt: new Date().toISOString()
    }
  ];

  // 3. Habits
  const initialHabits = [
    {
      _id: 'habit_1',
      name: 'Daily Linux Lab',
      description: 'Solve one command-line challenge or scripting exercise',
      category: 'Lab',
      targetDaysPerWeek: 5,
      color: '#10B981',
      icon: '🐧',
      isActive: true,
      completions: [],
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'habit_2',
      name: 'DevOps Flashcards',
      description: 'Review 5-10 concepts in the Memory Bank',
      category: 'Review',
      targetDaysPerWeek: 7,
      color: '#3B82F6',
      icon: '🧠',
      isActive: true,
      completions: [],
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date().toISOString()
    }
  ];

  // 4. Goals
  const initialGoals = [
    {
      _id: 'goal_1',
      topic: 'Kubernetes',
      targetHours: 4,
      weekLabel: currentWeek,
      color: '#3B82F6',
      notes: 'Finish the K8s deployment lab and practice Helm charts',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'goal_2',
      topic: 'Docker',
      targetHours: 3,
      weekLabel: currentWeek,
      color: '#10B981',
      notes: 'Dockerize study companion app',
      createdAt: new Date().toISOString()
    }
  ];

  // 5. Projects
  const initialProjects = [
    {
      _id: 'proj_1',
      name: 'DevOps Study Companion',
      description: 'A dashboard and tracking tool for learning cloud native technologies',
      status: 'in-progress',
      timeSpent: 15,
      technologies: ['React Native', 'Express', 'MongoDB', 'Docker'],
      startDate: new Date().toISOString(),
      tasks: [
        { title: 'Setup API Server', completed: true },
        { title: 'Build Mobile UI', completed: true },
        { title: 'Implement Offline Mode', completed: false }
      ],
      notes: 'Excellent learning experience with monorepos',
      createdAt: new Date().toISOString()
    }
  ];

  // 6. Labs
  const initialLabs = [
    {
      _id: 'lab_1',
      title: 'Docker Multi-stage Builds',
      topic: 'Docker',
      description: 'Optimize image sizes by separating build and runtime steps',
      steps: [
        { _id: 'step_1', command: 'docker build -t test-app .', output: 'Successfully built image', notes: 'Initial build', status: 'success' }
      ],
      labErrors: [],
      environment: 'Local PC',
      status: 'completed',
      duration: 30,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'lab_2',
      title: 'Kubernetes Pod Deployment',
      topic: 'Kubernetes',
      description: 'Deploy a static pod using kubectl manifests',
      steps: [
        { _id: 'step_2', command: 'kubectl apply -f pod.yaml', output: 'pod/nginx created', notes: 'Pod definition file', status: 'success' }
      ],
      labErrors: [],
      environment: 'Minikube',
      status: 'in-progress',
      duration: 15,
      createdAt: new Date().toISOString()
    }
  ];

  // 7. Study Entries
  const initialEntries = [
    {
      _id: 'entry_1',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      topic: 'Docker',
      description: 'Learned about multi-stage builds and optimized my production container image size.',
      timeSpent: 2,
      difficulty: 'Medium',
      tags: ['docker', 'optimization'],
      notes: 'Reduced size from 800MB to 50MB using alpine.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'entry_2',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      topic: 'Linux',
      description: 'Practiced Linux file permissions, ACLs, and basic system administration utilities.',
      timeSpent: 1.5,
      difficulty: 'Easy',
      tags: ['linux', 'fundamentals'],
      notes: 'Understood chmod, chown, and getfacl.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'entry_3',
      date: new Date().toISOString(),
      topic: 'Kubernetes',
      description: 'Implemented deployment manifests, services, and local port forwarding in Minikube.',
      timeSpent: 3,
      difficulty: 'Hard',
      tags: ['k8s', 'minikube'],
      notes: 'Slight issue with cluster networking but resolved by resetting minikube.',
      createdAt: new Date().toISOString()
    }
  ];

  // 8. Memory Items
  const initialMemory = [
    {
      _id: 'mem_1',
      concept: 'Processes vs Threads',
      explanation: 'Processes have independent memory. Threads share process memory. Threads are lightweight but can corrupt each other.',
      category: 'Linux',
      tags: ['os'],
      strength: 3,
      lastReviewed: new Date().toISOString(),
      nextReview: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ];

  setTable('commands', initialCommands);
  setTable('questions', initialQuestions);
  setTable('habits', initialHabits);
  setTable('goals', initialGoals);
  setTable('projects', initialProjects);
  setTable('labs', initialLabs);
  setTable('entries', initialEntries);
  setTable('memory', initialMemory);
  setTable('timer', []);

  storage.set('offline_initialized', true);
};

// Calculate Dashboard Stats locally
function calculateStats() {
  const entries = getTable('entries');
  const labs = getTable('labs');
  const memory = getTable('memory');

  const totalEntries = entries.length;
  const totalHours = entries.reduce((sum, e) => sum + e.timeSpent, 0);

  // Calculate unique study days
  const uniqueDays = new Set(
    entries.map((e) => new Date(e.date).toISOString().split('T')[0])
  );
  const totalStudyDays = uniqueDays.size;

  // Calculate streaks
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedDays = Array.from(uniqueDays).sort().reverse();

  if (sortedDays.length > 0) {
    const latestDay = new Date(sortedDays[0]);
    latestDay.setHours(0, 0, 0, 0);

    const diffFromToday = Math.floor(
      (today - latestDay) / (1000 * 60 * 60 * 24)
    );

    if (diffFromToday <= 1) {
      currentStreak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const current = new Date(sortedDays[i - 1]);
        const prev = new Date(sortedDays[i]);
        const diff = Math.floor(
          (current - prev) / (1000 * 60 * 60 * 24)
        );
        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  let longestStreak = 0;
  let tempStreak = 1;
  const sortedDaysAsc = Array.from(uniqueDays).sort();
  for (let i = 1; i < sortedDaysAsc.length; i++) {
    const current = new Date(sortedDaysAsc[i]);
    const prev = new Date(sortedDaysAsc[i - 1]);
    const diff = Math.floor((current - prev) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  if (sortedDaysAsc.length === 0) longestStreak = 0;

  // Weekly activity (last 7 days)
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weeklyActivity = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekAgo);
    day.setDate(day.getDate() + i);
    const dayStr = day.toISOString().split('T')[0];
    const dayEntries = entries.filter(
      (e) => new Date(e.date).toISOString().split('T')[0] === dayStr
    );
    weeklyActivity.push({
      date: dayStr,
      dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
      entries: dayEntries.length,
      hours: dayEntries.reduce((sum, e) => sum + e.timeSpent, 0),
    });
  }

  // Topic distribution
  const topicCounts = {};
  const topicHours = {};
  entries.forEach((e) => {
    topicCounts[e.topic] = (topicCounts[e.topic] || 0) + 1;
    topicHours[e.topic] = (topicHours[e.topic] || 0) + e.timeSpent;
  });

  const topicDistribution = Object.keys(topicCounts).map((topic) => ({
    topic,
    count: topicCounts[topic],
    hours: Math.round(topicHours[topic] * 10) / 10,
  }));

  // Difficulty distribution
  const difficultyCount = { Easy: 0, Medium: 0, Hard: 0, Expert: 0 };
  entries.forEach((e) => {
    if (difficultyCount[e.difficulty] !== undefined) {
      difficultyCount[e.difficulty]++;
    }
  });

  // Calculate XP and Levels
  const questXP = storage.getNumber('offline_quest_xp') || 0;
  const totalXP = (totalHours * 100) + (totalEntries * 10) + questXP;
  const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;

  const labsCompleted = labs.filter((l) => l.status === 'completed').length;
  const memoriesMastered = memory.filter((m) => m.strength >= 4).length;
  const timer = getTable('timer');
  const focusSessionsCount = timer.filter((t) => t.completed).length;

  const avgHoursPerDay =
    totalStudyDays > 0
      ? Math.round((totalHours / totalStudyDays) * 10) / 10
      : 0;

  return {
    totalEntries,
    totalStudyDays,
    totalHours: Math.round(totalHours * 10) / 10,
    currentStreak,
    longestStreak,
    avgHoursPerDay,
    totalXP,
    level,
    labsCompleted,
    memoriesMastered,
    focusSessionsCount,
    weeklyActivity,
    topicDistribution,
    difficultyDistribution: difficultyCount,
  };
}

// Streak helper for habits
function calculateHabitStreak(completions) {
  if (!completions.length) return { current: 0, longest: 0 };

  const dates = [...new Set(completions.map((c) => c.date))].sort().reverse();
  let current = 0;
  let longest = 0;
  let temp = 0;
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];
    if (dates[i] === expectedStr) {
      temp++;
      if (i === 0 || dates[0] === today) current = temp;
    } else {
      longest = Math.max(longest, temp);
      temp = 1;
    }
  }
  longest = Math.max(longest, temp, current);
  return { current, longest };
}

// Offline Request handler
export const handleOfflineRequest = async (config) => {
  let path = config.url || '';
  if (path.startsWith('http')) {
    try {
      const match = path.match(/https?:\/\/[^\/]+(.*)/);
      if (match) path = match[1];
    } catch (e) {}
  }
  if (path.startsWith('/api')) {
    path = path.substring(4);
  }
  // Strip query parameters
  const pathNoQuery = path.split('?')[0];

  const method = (config.method || 'GET').toUpperCase();
  const data = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : null;
  
  // Extract path parameters (e.g. /entries/123 -> id = 123)
  const segments = pathNoQuery.split('/').filter(Boolean);

  // Health check
  if (pathNoQuery === '/health') {
    return { status: 'ok', offline: true };
  }

  // Auth login
  if (pathNoQuery === '/auth/login') {
    return {
      success: true,
      user: {
        username: data?.username || 'ghost69',
        token: 'simple-auth-token-offline-mode',
        offline: true
      }
    };
  }

  // Entries endpoints
  if (segments[0] === 'entries') {
    if (segments[1] === 'stats') {
      return { success: true, data: calculateStats() };
    }
    const entries = getTable('entries');
    if (method === 'GET') {
      if (segments[1]) {
        // GET /entries/:id
        const entry = entries.find(e => e._id === segments[1]);
        if (!entry) throw { status: 404, message: 'Entry not found' };
        return { success: true, data: entry };
      }
      // GET /entries (with pagination or filtering)
      return { success: true, data: entries, pagination: { total: entries.length, page: 1, pages: 1 } };
    }
    if (method === 'POST') {
      const newEntry = {
        _id: `entry_${generateId()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      entries.unshift(newEntry);
      setTable('entries', entries);
      return { success: true, data: newEntry };
    }
    if (method === 'PUT' && segments[1]) {
      const idx = entries.findIndex(e => e._id === segments[1]);
      if (idx === -1) throw { status: 404, message: 'Entry not found' };
      entries[idx] = { ...entries[idx], ...data, updatedAt: new Date().toISOString() };
      setTable('entries', entries);
      return { success: true, data: entries[idx] };
    }
    if (method === 'DELETE' && segments[1]) {
      const filtered = entries.filter(e => e._id !== segments[1]);
      setTable('entries', filtered);
      return { success: true, message: 'Entry deleted successfully' };
    }
  }

  // Labs endpoints
  if (segments[0] === 'labs') {
    const labs = getTable('labs');
    if (method === 'GET') {
      if (segments[1]) {
        const lab = labs.find(l => l._id === segments[1]);
        if (!lab) throw { status: 404, message: 'Lab not found' };
        return { success: true, data: lab };
      }
      return { success: true, data: labs };
    }
    if (method === 'POST') {
      if (segments[1] && segments[2] === 'steps') {
        // POST /labs/:id/steps
        const idx = labs.findIndex(l => l._id === segments[1]);
        if (idx === -1) throw { status: 404, message: 'Lab not found' };
        const newStep = { _id: `step_${generateId()}`, ...data };
        labs[idx].steps = labs[idx].steps || [];
        labs[idx].steps.push(newStep);
        setTable('labs', labs);
        return { success: true, data: labs[idx] };
      }
      if (segments[1] && segments[2] === 'errors') {
        // POST /labs/:id/errors
        const idx = labs.findIndex(l => l._id === segments[1]);
        if (idx === -1) throw { status: 404, message: 'Lab not found' };
        const newError = { _id: `err_${generateId()}`, ...data, resolved: false };
        labs[idx].labErrors = labs[idx].labErrors || [];
        labs[idx].labErrors.push(newError);
        setTable('labs', labs);
        return { success: true, data: labs[idx] };
      }
      // POST /labs (create new lab)
      const newLab = {
        _id: `lab_${generateId()}`,
        steps: [],
        labErrors: [],
        status: 'in-progress',
        duration: 0,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      labs.unshift(newLab);
      setTable('labs', labs);
      return { success: true, data: newLab };
    }
    if (method === 'PUT' && segments[1]) {
      const idx = labs.findIndex(l => l._id === segments[1]);
      if (idx === -1) throw { status: 404, message: 'Lab not found' };
      labs[idx] = { ...labs[idx], ...data, updatedAt: new Date().toISOString() };
      setTable('labs', labs);
      return { success: true, data: labs[idx] };
    }
    if (method === 'DELETE' && segments[1]) {
      const filtered = labs.filter(l => l._id !== segments[1]);
      setTable('labs', filtered);
      return { success: true, message: 'Lab deleted' };
    }
  }

  // Projects endpoints
  if (segments[0] === 'projects') {
    const projects = getTable('projects');
    if (method === 'GET') {
      return { success: true, data: projects };
    }
    if (method === 'POST') {
      const newProj = {
        _id: `proj_${generateId()}`,
        timeSpent: 0,
        status: 'planning',
        tasks: [],
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      projects.unshift(newProj);
      setTable('projects', projects);
      return { success: true, data: newProj };
    }
    if (method === 'PATCH' && segments[1] && segments[2] === 'time') {
      // PATCH /projects/:id/time
      const idx = projects.findIndex(p => p._id === segments[1]);
      if (idx === -1) throw { status: 404, message: 'Project not found' };
      projects[idx].timeSpent = (projects[idx].timeSpent || 0) + (data.hours || 0);
      setTable('projects', projects);
      return { success: true, data: projects[idx] };
    }
    if (method === 'DELETE' && segments[1]) {
      const filtered = projects.filter(p => p._id !== segments[1]);
      setTable('projects', filtered);
      return { success: true, message: 'Project deleted' };
    }
  }

  // Memory endpoints
  if (segments[0] === 'memory') {
    const memory = getTable('memory');
    if (method === 'GET') {
      return { success: true, data: memory };
    }
    if (method === 'POST') {
      const newMem = {
        _id: `mem_${generateId()}`,
        strength: 1,
        lastReviewed: new Date().toISOString(),
        nextReview: new Date().toISOString(),
        ...data,
        createdAt: new Date().toISOString()
      };
      memory.unshift(newMem);
      setTable('memory', memory);
      return { success: true, data: newMem };
    }
    if (method === 'PATCH' && segments[1] && segments[2] === 'review') {
      const idx = memory.findIndex(m => m._id === segments[1]);
      if (idx === -1) throw { status: 404, message: 'Memory item not found' };
      memory[idx].strength = data.strength || 1;
      memory[idx].lastReviewed = new Date().toISOString();
      // Simple spaced repetition scheduling
      const intervalDays = memory[idx].strength * 2;
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + intervalDays);
      memory[idx].nextReview = nextDate.toISOString();
      setTable('memory', memory);
      return { success: true, data: memory[idx] };
    }
    if (method === 'DELETE' && segments[1]) {
      const filtered = memory.filter(m => m._id !== segments[1]);
      setTable('memory', filtered);
      return { success: true, message: 'Memory item deleted' };
    }
  }

  // Commands endpoints
  if (segments[0] === 'commands') {
    return { success: true, data: getTable('commands') };
  }

  // Interview endpoints
  if (segments[0] === 'interview') {
    const questions = getTable('questions');
    if (segments[1] === 'random') {
      const count = parseInt(config.params?.count) || 3;
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      return { success: true, data: shuffled.slice(0, count) };
    }
    if (segments[1] === 'questions') {
      return { success: true, data: questions };
    }
  }

  // Habits endpoints
  if (segments[0] === 'habits') {
    const habits = getTable('habits');
    if (method === 'GET') {
      return { success: true, data: habits.filter(h => h.isActive) };
    }
    if (method === 'POST') {
      const newHabit = {
        _id: `habit_${generateId()}`,
        completions: [],
        currentStreak: 0,
        longestStreak: 0,
        isActive: true,
        ...data,
        createdAt: new Date().toISOString()
      };
      habits.push(newHabit);
      setTable('habits', habits);
      return { success: true, data: newHabit };
    }
    if (method === 'PATCH' && segments[1] && segments[2] === 'complete') {
      const idx = habits.findIndex(h => h._id === segments[1]);
      if (idx === -1) throw { status: 404, message: 'Habit not found' };
      
      const todayStr = new Date().toISOString().split('T')[0];
      const currentWeek = getCurrentWeekLabel();
      
      const alreadyDone = habits[idx].completions.some(c => c.date === todayStr);
      if (alreadyDone) {
        habits[idx].completions = habits[idx].completions.filter(c => c.date !== todayStr);
      } else {
        habits[idx].completions.push({ date: todayStr, week: currentWeek });
      }

      const { current, longest } = calculateHabitStreak(habits[idx].completions);
      habits[idx].currentStreak = current;
      habits[idx].longestStreak = Math.max(longest, habits[idx].longestStreak);

      setTable('habits', habits);
      return { success: true, data: habits[idx] };
    }
    if (method === 'PUT' && segments[1]) {
      const idx = habits.findIndex(h => h._id === segments[1]);
      if (idx === -1) throw { status: 404, message: 'Habit not found' };
      habits[idx] = { ...habits[idx], ...data };
      setTable('habits', habits);
      return { success: true, data: habits[idx] };
    }
    if (method === 'DELETE' && segments[1]) {
      const filtered = habits.filter(h => h._id !== segments[1]);
      setTable('habits', filtered);
      return { success: true, data: {} };
    }
  }

  // Goals endpoints
  if (segments[0] === 'goals') {
    const goals = getTable('goals');
    if (method === 'GET') {
      const targetWeek = getCurrentWeekLabel();
      const currentWeekGoals = goals.filter(g => g.weekLabel === targetWeek);
      const entries = getTable('entries');

      const actualHoursMap = {};
      entries.forEach(e => {
        try {
          const entryDate = new Date(e.date);
          const entryWeekNum = getWeekNumber(entryDate);
          const entryWeekLabel = `${entryDate.getFullYear()}-W${String(entryWeekNum).padStart(2, '0')}`;
          if (entryWeekLabel === targetWeek) {
            actualHoursMap[e.topic] = (actualHoursMap[e.topic] || 0) + e.timeSpent;
          }
        } catch (err) {}
      });

      const goalsWithActual = currentWeekGoals.map(g => ({
        ...g,
        actualHours: Math.round((actualHoursMap[g.topic] || 0) * 10) / 10,
      }));

      const totalActual = Object.values(actualHoursMap).reduce((a, b) => a + b, 0);
      const totalTarget = currentWeekGoals.reduce((a, g) => a + g.targetHours, 0);

      return {
        success: true,
        data: {
          week: targetWeek,
          goals: goalsWithActual,
          summary: {
            totalActual: Math.round(totalActual * 10) / 10,
            totalTarget: Math.round(totalTarget * 10) / 10,
            topicActuals: actualHoursMap,
          }
        }
      };
    }
    if (method === 'POST') {
      const newGoal = {
        _id: `goal_${generateId()}`,
        weekLabel: getCurrentWeekLabel(),
        ...data,
        createdAt: new Date().toISOString()
      };
      goals.push(newGoal);
      setTable('goals', goals);
      return { success: true, data: newGoal };
    }
    if (method === 'PUT' && segments[1]) {
      const idx = goals.findIndex(g => g._id === segments[1]);
      if (idx === -1) throw { status: 404, message: 'Goal not found' };
      goals[idx] = { ...goals[idx], ...data };
      setTable('goals', goals);
      return { success: true, data: goals[idx] };
    }
    if (method === 'DELETE' && segments[1]) {
      const filtered = goals.filter(g => g._id !== segments[1]);
      setTable('goals', filtered);
      return { success: true, data: {} };
    }
  }

  // Timer endpoints
  if (segments[0] === 'timer') {
    const timer = getTable('timer');
    if (segments[1] === 'stats') {
      // GET /timer/stats
      const completed = timer.filter(s => s.completed);
      const totalXP = completed.reduce((a, s) => a + (s.xpEarned || 0), 0);
      const totalMinutes = completed.reduce((a, s) => a + s.durationMinutes, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekSessions = completed.filter(s => new Date(s.completedAt) >= weekAgo);
      const weekMinutes = weekSessions.reduce((a, s) => a + s.durationMinutes, 0);

      const topicMap = {};
      completed.forEach(s => {
        if (s.topic) {
          topicMap[s.topic] = (topicMap[s.topic] || 0) + s.durationMinutes;
        }
      });

      const plantLevel = getPlantLevel(totalXP);

      return {
        success: true,
        data: {
          totalXP,
          totalMinutes,
          totalSessions: completed.length,
          weekMinutes,
          weekSessions: weekSessions.length,
          topicBreakdown: topicMap,
          plantLevel
        }
      };
    }
    if (method === 'GET') {
      return { success: true, data: timer, total: timer.length };
    }
    if (method === 'POST') {
      const xpEarned = calculateTimerXP(data.durationMinutes, data.mode);
      const newSession = {
        _id: `timer_${generateId()}`,
        xpEarned,
        completedAt: new Date().toISOString(),
        completed: true,
        ...data,
        createdAt: new Date().toISOString()
      };
      timer.unshift(newSession);
      setTable('timer', timer);
      return { success: true, data: newSession, xpEarned };
    }
    if (method === 'DELETE' && segments[1]) {
      const filtered = timer.filter(s => s._id !== segments[1]);
      setTable('timer', filtered);
      return { success: true, data: {} };
    }
  }

  throw { status: 404, message: `Offline Route Not Found: ${method} ${pathNoQuery}` };
};
