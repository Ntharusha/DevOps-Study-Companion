import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { getStats } from '../api';

const StatCard = ({ label, value, sub, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statSub}>{sub}</Text>
  </View>
);

export default function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
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
    fetchStats();
  }, []);

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
          label="Study Days"
          value={stats.totalStudyDays}
          sub="Total active days"
          color={COLORS.primary}
        />
        <StatCard
          label="Streak"
          value={`${stats.currentStreak} 🔥`}
          sub={`Longest: ${stats.longestStreak} days`}
          color={COLORS.warning}
        />
        <StatCard
          label="Total Hours"
          value={`${stats.totalHours}h`}
          sub={`Avg ${stats.avgHoursPerDay}h/day`}
          color={COLORS.secondary}
        />
        <StatCard
          label="Total Entries"
          value={stats.totalEntries}
          sub="Sessions logged"
          color={COLORS.accent}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Topics Mastery</Text>
        {stats.topicDistribution.map((topic, index) => (
          <View key={index} style={styles.topicRow}>
            <View style={styles.topicInfo}>
              <Text style={styles.topicName}>{topic.topic}</Text>
              <Text style={styles.topicHours}>{topic.hours}h</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(topic.hours / stats.totalHours) * 100}%` }
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
    backgroundColor: COLORS.card,
    width: '48%',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginVertical: 4,
  },
  statSub: {
    fontSize: 10,
    color: COLORS.textMuted,
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
});
