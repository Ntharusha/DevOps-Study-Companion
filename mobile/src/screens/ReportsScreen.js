import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
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

export default function ReportsScreen() {
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
  }, []);

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
});
