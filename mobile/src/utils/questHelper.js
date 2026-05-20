import { storage } from './storage';

const getTable = (tableName) => {
  const data = storage.getString(`offline_${tableName}`);
  return data ? JSON.parse(data) : [];
};

const QUEST_TEMPLATES = [
  { id: 'quest_entry', title: '📝 DevOps Journal', desc: 'Log a new study progress entry today', xp: 50 },
  { id: 'quest_timer', title: '⏱️ Deep Focus', desc: 'Complete a Pomodoro Focus session today', xp: 50 },
  { id: 'quest_memory', title: '🧠 Concept Check', desc: 'Review at least 1 card in the Memory Bank', xp: 50 },
  { id: 'quest_command', title: '⌨️ CLI Explorer', desc: 'Use or favorite a command in the Commands Bank', xp: 50 },
  { id: 'quest_habit', title: '🌿 Water Plant', desc: 'Complete at least 1 daily study habit today', xp: 50 },
];

/**
 * Helper to get today's date string in local timezone format (YYYY-MM-DD)
 */
function getTodayString() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}

/**
 * Retrieve or seed today's quests
 */
export function getDailyQuests() {
  const todayStr = getTodayString();
  const savedDate = storage.getString('quest_date');
  const savedQuests = storage.getString('quest_list');

  if (savedDate === todayStr && savedQuests) {
    return JSON.parse(savedQuests);
  }

  // Generate 3 random unique quests
  const shuffled = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
  const daily = shuffled.slice(0, 3).map(q => ({ ...q, completed: false }));

  storage.set('quest_date', todayStr);
  storage.set('quest_list', JSON.stringify(daily));

  // If new day, also back up yesterday's commands count to detect increases
  const commands = getTable('commands');
  const totalCommandUses = commands.reduce((sum, c) => sum + (c.useCount || 0), 0);
  storage.set('yesterday_command_uses', totalCommandUses);

  return daily;
}

/**
 * Evaluate database states to see if daily quests are accomplished
 */
export function evaluateQuests() {
  const quests = getDailyQuests();
  const todayStr = getTodayString();
  let changed = false;

  const entries = getTable('entries');
  const timer = getTable('timer');
  const memory = getTable('memory');
  const commands = getTable('commands');
  const habits = getTable('habits');

  const updatedQuests = quests.map(quest => {
    if (quest.completed) return quest;

    let isDone = false;

    switch (quest.id) {
      case 'quest_entry':
        // Check if there is an entry created today
        isDone = entries.some(e => e.date && e.date.startsWith(todayStr));
        break;

      case 'quest_timer':
        // Check if there is a completed timer session today
        isDone = timer.some(s => s.completedAt && s.completedAt.startsWith(todayStr));
        break;

      case 'quest_memory':
        // Check if there is a memory review logged today
        isDone = memory.some(m => m.lastReviewed && m.lastReviewed.startsWith(todayStr));
        break;

      case 'quest_command': {
        // Check if total command uses increased today vs start of day
        const currentUses = commands.reduce((sum, c) => sum + (c.useCount || 0), 0);
        const baseUses = storage.getNumber('yesterday_command_uses') || 0;
        isDone = currentUses > baseUses;
        break;
      }

      case 'quest_habit':
        // Check if any habit completion was added today
        isDone = habits.some(h => {
          return h.completions && h.completions.some(c => {
            const compDate = typeof c === 'string' ? c : (c.date || '');
            return compDate.startsWith(todayStr);
          });
        });
        break;
    }

    if (isDone) {
      changed = true;
      // Award XP
      const currentQuestXP = storage.getNumber('offline_quest_xp') || 0;
      storage.set('offline_quest_xp', currentQuestXP + quest.xp);
      return { ...quest, completed: true };
    }

    return quest;
  });

  if (changed) {
    storage.set('quest_list', JSON.stringify(updatedQuests));
  }

  return updatedQuests;
}
