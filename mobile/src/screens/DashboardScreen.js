import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, RADIUS, GRADIENTS, SHADOWS } from '../theme';
import { getStats } from '../api';
import { evaluateQuests } from '../utils/questHelper';
import { getPlantLevel } from '../utils/offlineStorage';
import { storage } from '../utils/storage';

const DEVOPS_QUOTES = [
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "If it hurts, do it more often.", author: "Jez Humble" },
  { text: "Continuous improvement is better than delayed perfection.", author: "Mark Twain" },
  { text: "Automate everything that is boring.", author: "DevOps Mantra" },
  { text: "Fail fast, learn faster.", author: "Agile Maxim" },
  { text: "Programs must be written for people to read, and only secondarily for machines to execute.", author: "Abelson & Sussman" }
];

const StatCard = ({ label, value, sub, colors, index }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      styles.statCard, 
      SHADOWS.sm,
      { 
        opacity: fadeAnim, 
        transform: [{ translateY: slideAnim }],
        borderColor: colors ? colors[0] : COLORS.border,
        borderWidth: 1.5,
      }
    ]}>
      <View style={styles.cardContent}>
        <Text style={[styles.statLabel, { color: colors ? colors[0] : COLORS.textMuted }]}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statSub}>{sub}</Text>
      </View>
    </Animated.View>
  );
};

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasksCount, setTasksCount] = useState({ completed: 0, total: 0 });
  const [quote, setQuote] = useState({ text: '', author: '' });

  const loadDailyTasksSummary = () => {
    try {
      const userTasksData = storage.getString('daily_tasks_user');
      const userTasks = userTasksData ? JSON.parse(userTasksData) : [];
      const suggestionsData = storage.getString('daily_tasks_suggestions');
      const suggestions = suggestionsData ? JSON.parse(suggestionsData) : [];
      const allTasks = [...userTasks, ...suggestions];
      const completed = allTasks.filter(t => t.completed).length;
      setTasksCount({ completed, total: allTasks.length });
    } catch (e) {
      console.log(e);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await getStats();
      setStats(data.data);
      // Run quests evaluation to check completions
      const updatedQuests = evaluateQuests();
      setQuests(updatedQuests);
      loadDailyTasksSummary();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Pick daily quote
    const todayIndex = new Date().getDate() % DEVOPS_QUOTES.length;
    setQuote(DEVOPS_QUOTES[todayIndex]);

    // Listen to focus event so stats/quests/tasks refresh when switching tabs
    const unsubscribe = navigation?.addListener('focus', () => {
      fetchStats();
    });

    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>No data available</Text>
      </View>
    );
  }

  const plantInfo = getPlantLevel(stats.totalXP || 0);
  const xpCurrent = stats.totalXP || 0;
  const xpNext = plantInfo.next || 1500;
  const xpPrev = plantInfo.level === 1 ? 0 : (plantInfo.level === 2 ? 50 : (plantInfo.level === 3 ? 150 : (plantInfo.level === 4 ? 300 : (plantInfo.level === 5 ? 500 : (plantInfo.level === 6 ? 800 : 1200)))));
  const progressRatio = xpNext ? Math.min(1, Math.max(0, (xpCurrent - xpPrev) / (xpNext - xpPrev))) : 1;
  const progressPercent = Math.round(progressRatio * 100);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcomeText}>Hello, ghost69! 🚀</Text>
            <Text style={styles.title}>Ready to Level Up?</Text>
          </View>
          <View style={styles.notificationBell}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </View>
        </View>
      </View>

      {/* Daily Tasks Summary Widget */}
      <TouchableOpacity 
        style={styles.tasksWidgetCard} 
        onPress={() => navigation.navigate('More', { screen: 'DailyTasks' })}
        activeOpacity={0.8}
      >
        <View style={styles.tasksWidgetHeader}>
          <Text style={styles.tasksWidgetTitle}>✅ Daily Checklist Progress</Text>
          <Text style={styles.tasksWidgetGoBtn}>Manage ›</Text>
        </View>
        <View style={styles.tasksWidgetProgressRow}>
          <Text style={styles.tasksWidgetCountText}>
            {tasksCount.completed} of {tasksCount.total} tasks completed
          </Text>
          {tasksCount.total > 0 && tasksCount.completed === tasksCount.total && (
            <Text style={styles.tasksWidgetSuccessBadge}>All Done! 🎉</Text>
          )}
        </View>
        <View style={styles.tasksWidgetProgressBarTrack}>
          <View 
            style={[
              styles.tasksWidgetProgressBarFill, 
              { width: `${tasksCount.total > 0 ? (tasksCount.completed / tasksCount.total) * 100 : 0}%` }
            ]} 
          />
        </View>
      </TouchableOpacity>

      {/* Daily Motivational Quote */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>“{quote.text}”</Text>
        <Text style={styles.quoteAuthor}>— {quote.author}</Text>
      </View>

      <View style={styles.plantCard}>
        <View style={styles.plantHeader}>
          <Text style={styles.plantTitle}>🌱 Study Plant Level Progress</Text>
          <Text style={styles.plantLevelBadge}>Lv. {plantInfo.level}</Text>
        </View>
        
        <View style={styles.plantContent}>
          <View style={styles.plantEmojiContainer}>
            <Text style={styles.plantEmoji}>{plantInfo.emoji}</Text>
          </View>
          
          <View style={styles.plantDetails}>
            <Text style={styles.plantName}>{plantInfo.name}</Text>
            <Text style={styles.plantXPText}>
              XP to Next Level: {xpCurrent} / {xpNext || 'Max'} XP
            </Text>
            
            <View style={styles.segmentedProgressBar}>
              {Array.from({ length: 10 }).map((_, i) => {
                const filled = progressRatio * 10 >= i + 1;
                return (
                  <View 
                    key={i} 
                    style={[
                      styles.progressSegment, 
                      filled && styles.progressSegmentFilled,
                      i === 0 && { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
                      i === 9 && { borderTopRightRadius: 4, borderBottomRightRadius: 4 }
                    ]}
                  />
                );
              })}
              <Text style={styles.segmentPercentText}>{progressPercent}%</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          index={0}
          label="Study Days"
          value={stats.totalStudyDays}
          sub="Total active days"
          colors={GRADIENTS.primary}
        />
        <StatCard
          index={1}
          label="Streak"
          value={`${stats.currentStreak} 🔥`}
          sub={`Longest: ${stats.longestStreak} days`}
          colors={GRADIENTS.secondary}
        />
        <StatCard
          index={2}
          label="Total Hours"
          value={`${stats.totalHours}h`}
          sub={`Avg ${stats.avgHoursPerDay}h/day`}
          colors={['#f472b6', '#db2777']}
        />
        <StatCard
          index={3}
          label="Total Entries"
          value={stats.totalEntries}
          sub="Sessions logged"
          colors={['#fbbf24', '#f59e0b']}
        />
      </View>

      <View style={styles.questsCard}>
        <View style={styles.questsHeader}>
          <Text style={styles.questsTitle}>🎯 Daily Quests</Text>
          <Text style={styles.questsSub}>+50 XP each</Text>
        </View>
        {quests.length === 0 ? (
          <Text style={styles.text}>No active quests for today.</Text>
        ) : (
          quests.map((quest) => (
            <View key={quest.id} style={styles.questRow}>
              <View style={[styles.questCheckbox, quest.completed && styles.questCheckboxCompleted]}>
                {quest.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.questInfo}>
                <Text style={[styles.questText, quest.completed && styles.questTextCompleted]}>
                  {quest.title}
                </Text>
                <Text style={styles.questDesc}>{quest.desc}</Text>
              </View>
              {quest.completed && (
                <View style={styles.xpBadge}>
                  <Text style={styles.xpBadgeText}>+50 XP</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Topics Mastery</Text>
        {(stats.topicDistribution || []).map((topic, index) => (
          <View key={index} style={styles.topicRow}>
            <View style={styles.topicInfo}>
              <Text style={styles.topicName}>{topic.topic}</Text>
              <Text style={styles.topicHours}>{topic.hours}h</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${stats.totalHours > 0 ? ((topic.hours / stats.totalHours) * 100) : 0}%` }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  statsGrid: {
    padding: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  cardContent: {
    padding: SPACING.lg,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  statSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  topicRow: {
    marginBottom: SPACING.md,
  },
  topicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  topicName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  topicHours: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  text: {
    color: COLORS.text,
  },
  questsCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  questsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  questsTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  questsSub: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  questCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  questCheckboxCompleted: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  questInfo: {
    flex: 1,
  },
  questText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  questTextCompleted: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  questDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  xpBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpBadgeText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '800',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  notificationBell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)', // Cyan glow border
    marginBottom: SPACING.md,
  },
  plantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  plantTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  plantLevelBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    color: COLORS.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '800',
  },
  plantContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plantEmojiContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  plantEmoji: {
    fontSize: 28,
  },
  plantDetails: {
    flex: 1,
  },
  plantName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  plantXPText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 6,
  },
  segmentedProgressBar: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'visible',
    alignItems: 'center',
    marginTop: 2,
  },
  progressSegment: {
    flex: 1,
    height: '100%',
    marginHorizontal: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  progressSegmentFilled: {
    backgroundColor: COLORS.secondary,
  },
  segmentPercentText: {
    position: 'absolute',
    right: 0,
    top: -18,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  tasksWidgetCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)', // primary glow border
    marginBottom: SPACING.md,
  },
  tasksWidgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tasksWidgetTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  tasksWidgetGoBtn: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  tasksWidgetProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tasksWidgetCountText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  tasksWidgetSuccessBadge: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '800',
  },
  tasksWidgetProgressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tasksWidgetProgressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  quoteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  quoteText: {
    color: COLORS.text,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  quoteAuthor: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
});
