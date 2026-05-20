import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { getStats } from '../api';

const ProgressSection = ({ title, current, total, color }) => {
  const percent = total > 0 ? (current / total) * 100 : 0;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionValue}>{current} / {total}</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const ACHIEVEMENTS = [
  {
    id: 'docker_captain',
    title: '🐳 Docker Captain',
    desc: 'Log 3 Docker study entries',
    condition: (stats) => {
      const topic = (stats.topicDistribution || []).find(t => t.topic.toLowerCase() === 'docker');
      return (topic ? topic.count : 0) >= 3;
    }
  },
  {
    id: 'k8s_commander',
    title: '☸️ K8s Commander',
    desc: 'Log 3 Kubernetes/K8s study entries',
    condition: (stats) => {
      const topic = (stats.topicDistribution || []).find(t => t.topic.toLowerCase() === 'kubernetes' || t.topic.toLowerCase() === 'k8s');
      return (topic ? topic.count : 0) >= 3;
    }
  },
  {
    id: 'linux_guru',
    title: '🐧 Linux Guru',
    desc: 'Log 3 Linux study entries',
    condition: (stats) => {
      const topic = (stats.topicDistribution || []).find(t => t.topic.toLowerCase() === 'linux');
      return (topic ? topic.count : 0) >= 3;
    }
  },
  {
    id: 'time_bender',
    title: '⏱️ Time Bender',
    desc: 'Complete 3 Pomodoro Focus Timer sessions',
    condition: (stats) => (stats.focusSessionsCount || 0) >= 3,
  },
  {
    id: 'recall_expert',
    title: '🧠 Recall Expert',
    desc: 'Master 3 concepts (strength >= 4) in the Memory Bank',
    condition: (stats) => (stats.memoriesMastered || 0) >= 3,
  },
  {
    id: 'green_thumb',
    title: '🌱 Green Thumb',
    desc: 'Grow your Study Plant to Level 3 (Sapling) or higher',
    condition: (stats) => (stats.level || 1) >= 3,
  },
  {
    id: 'unstoppable',
    title: '🔥 Unstoppable',
    desc: 'Reach a study streak of 3 days',
    condition: (stats) => (stats.currentStreak || 0) >= 3,
  }
];

export default function ReportsScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const { data } = await getStats();
      setStats(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen to focus event to update badges instantly when navigating here
    const unsubscribe = navigation?.addListener('focus', () => {
      fetchData();
    });

    return unsubscribe;
  }, [navigation]);

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
        <Text style={{color: COLORS.text}}>Failed to load statistics.</Text>
        <TouchableOpacity onPress={fetchData} style={{marginTop: 20}}>
          <Text style={{color: COLORS.primary}}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchData();}} tintColor={COLORS.primary} />}
    >
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LVL</Text>
          <Text style={styles.levelNumber}>{stats.level || 1}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>DevOps Master</Text>
          <Text style={styles.xp}>{stats.totalXP || 0} Total XP</Text>
        </View>
      </View>

      <View style={styles.card}>
        <ProgressSection 
          title="Daily Goal Progress" 
          current={stats.totalHoursToday || 0} 
          total={stats.dailyGoalHours || 4} 
          color={COLORS.success} 
        />
        <ProgressSection 
          title="Weekly Target" 
          current={stats.totalHoursThisWeek || 0} 
          total={20} 
          color={COLORS.primary} 
        />
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.smallCard}>
          <Text style={styles.smallLabel}>Labs Done</Text>
          <Text style={styles.smallValue}>{stats.labsCompleted || 0}</Text>
        </View>
        <View style={styles.smallCard}>
          <Text style={styles.smallLabel}>Concepts Mastered</Text>
          <Text style={styles.smallValue}>{stats.memoriesMastered || 0}</Text>
        </View>
      </View>

      <View style={styles.achievementsCard}>
        <Text style={styles.chartTitle}>🏆 Achievements Gallery</Text>
        <View style={styles.badgeGrid}>
          {ACHIEVEMENTS.map((badge) => {
            const unlocked = badge.condition(stats);
            return (
              <TouchableOpacity 
                key={badge.id} 
                style={[styles.badgeCell, unlocked ? styles.badgeCellUnlocked : styles.badgeCellLocked]}
                onPress={() => alert(`${badge.title}\n\n${badge.desc}\n\nStatus: ${unlocked ? '🎉 Unlocked!' : '🔒 Locked'}`)}
                activeOpacity={0.8}
              >
                <Text style={[styles.badgeIcon, !unlocked && { opacity: 0.25 }]}>
                  {badge.title.split(' ')[0]}
                </Text>
                <Text style={styles.badgeLabel} numberOfLines={1}>
                  {badge.title.split(' ').slice(1).join(' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, { marginTop: SPACING.md }]}>
        <Text style={styles.chartTitle}>Recent Activity</Text>
        <Text style={styles.chartPlaceholder}>Activity chart will be here (Mockup)</Text>
        <View style={styles.mockChart}>
          {[40, 70, 50, 90, 60, 80, 100].map((h, i) => (
            <View key={i} style={[styles.chartBar, { height: h }]} />
          ))}
        </View>
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
    flexDirection: 'row',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  levelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  levelNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  headerInfo: {
    marginLeft: SPACING.md,
  },
  name: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  xp: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionValue: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.background,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: 12,
  },
  smallCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  smallLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
  },
  smallValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  chartTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  chartPlaceholder: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  mockChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  chartBar: {
    width: 20,
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
    opacity: 0.6,
  },
  achievementsCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.md,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  badgeCell: {
    width: '30%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  badgeCellUnlocked: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  badgeCellLocked: {
    borderColor: COLORS.border,
    opacity: 0.6,
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  badgeLabel: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});
