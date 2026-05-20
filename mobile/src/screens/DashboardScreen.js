import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { COLORS, SPACING, RADIUS, GRADIENTS, SHADOWS } from '../theme';
import { getStats } from '../api';
import { evaluateQuests } from '../utils/questHelper';

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
      SHADOWS.md,
      { backgroundColor: colors ? colors[0] : COLORS.card },
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <View style={styles.cardContent}>
        <Text style={styles.statLabel}>{label}</Text>
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

  const fetchStats = async () => {
    try {
      const { data } = await getStats();
      setStats(data.data);
      // Run quests evaluation to check completions
      const updatedQuests = evaluateQuests();
      setQuests(updatedQuests);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Listen to focus event so stats/quests refresh when switching tabs
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Your learning progress at a glance</Text>
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
});
