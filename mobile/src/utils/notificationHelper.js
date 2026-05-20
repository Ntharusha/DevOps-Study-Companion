import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { storage } from './storage';

// Configure notification handler behavior when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const getTable = (tableName) => {
  const data = storage.getString(`offline_${tableName}`);
  return data ? JSON.parse(data) : [];
};

/**
 * Request permission for local notifications
 */
export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return false;
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  const isGranted = finalStatus === 'granted';
  storage.set('notifications_permitted', isGranted);
  return isGranted;
}

/**
 * Schedule a simple immediate or delayed notification
 */
export async function scheduleLocalNotification(title, body, triggerSeconds = 0) {
  // Check global toggle setting (defaults to true)
  const isEnabled = storage.getBoolean('notifications_enabled') !== false;
  if (!isEnabled) return null;

  const isPermitted = storage.getBoolean('notifications_permitted');
  if (!isPermitted) {
    const granted = await requestNotificationPermissions();
    if (!granted) return null;
  }

  const trigger = triggerSeconds > 0 ? { seconds: triggerSeconds } : null;

  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger,
  });
}

/**
 * Main logic to evaluate offline study data and send smart notifications
 */
export async function checkStudyStatusAndNotify() {
  const isEnabled = storage.getBoolean('notifications_enabled') !== false;
  if (!isEnabled) return;

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Check Daily Habits
  const habits = getTable('habits');
  const incompleteHabits = habits.filter(h => {
    if (!h.isActive) return false;
    const isCompletedToday = h.completions && h.completions.some(c => {
      const compDate = typeof c === 'string' ? c : (c.date || '');
      return compDate.startsWith(todayStr);
    });
    return !isCompletedToday;
  });

  if (incompleteHabits.length > 0) {
    // Select one random habit to remind
    const habit = incompleteHabits[Math.floor(Math.random() * incompleteHabits.length)];
    
    // Plant health gamification prompts
    const gamifiedMessages = [
      `🌱 Your Study Plant is thirsty! Work on your '${habit.name}' habit to water it.`,
      `🔥 Keep your learning streak alive! Complete your '${habit.name}' habit today.`,
      `🐧 Ping! Penguin needs its daily challenge. Complete '${habit.name}' now!`,
      `💡 DevOps Pro Tip: Small daily habits build massive skill. Don't forget your '${habit.name}' today.`
    ];
    
    const message = gamifiedMessages[Math.floor(Math.random() * gamifiedMessages.length)];
    await scheduleLocalNotification('Study Reminder ⏰', message);
    return; // Limit to one notification per background run to avoid spamming the user
  }

  // 2. Check Spaced Repetition (Memory Bank) Review Cards
  const memoryItems = getTable('memory');
  const now = new Date();
  const dueReviews = memoryItems.filter(item => {
    if (!item.nextReview) return false;
    return new Date(item.nextReview) <= now;
  });

  if (dueReviews.length > 0) {
    await scheduleLocalNotification(
      '🧠 Spaced Repetition Due',
      `You have ${dueReviews.length} flashcard${dueReviews.length > 1 ? 's' : ''} waiting to be reviewed in the Memory Bank. Keep your knowledge fresh!`
    );
    return;
  }

  // 3. Weekly Goals check
  const goals = getTable('goals');
  const entries = getTable('entries');

  // Week number helper
  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  const currentWeekLabel = (() => {
    const d = new Date();
    const weekNum = getWeekNumber(d);
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  })();

  const activeGoals = goals.filter(g => g.weekLabel === currentWeekLabel);
  
  if (activeGoals.length > 0) {
    // Find a goal that has not been reached yet
    for (const goal of activeGoals) {
      // Find sum of timeSpent for this topic in the current week
      const topicEntries = entries.filter(e => {
        const entryWeek = getWeekNumber(new Date(e.date));
        const entryWeekLabel = `${new Date(e.date).getFullYear()}-W${String(entryWeek).padStart(2, '0')}`;
        return e.topic === goal.topic && entryWeekLabel === currentWeekLabel;
      });
      const hoursStudied = topicEntries.reduce((sum, e) => sum + e.timeSpent, 0);

      if (hoursStudied < goal.targetHours) {
        const remaining = goal.targetHours - hoursStudied;
        await scheduleLocalNotification(
          '🎯 Goal Progress Check-in',
          `You've completed ${hoursStudied}h / ${goal.targetHours}h of your weekly '${goal.topic}' goal. Just ${remaining.toFixed(1)}h remaining!`
        );
        return;
      }
    }
  }
}
