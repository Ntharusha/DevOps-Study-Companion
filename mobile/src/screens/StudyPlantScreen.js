import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { getTimerStats, getTimerSessions } from '../api';

const ROADMAP = [
  { level: 1, emoji: '🌱', name: 'Seed' },
  { level: 2, emoji: '🌿', name: 'Sprout' },
  { level: 3, emoji: '🌾', name: 'Sapling' },
  { level: 4, emoji: '🌳', name: 'Bush' },
  { level: 5, emoji: '🌲', name: 'Young Tree' },
  { level: 6, emoji: '🌴', name: 'Tree' },
  { level: 7, emoji: '🎋', name: 'Ancient Tree' },
];

export default function StudyPlantScreen() {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const bounceValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await getTimerStats();
      const sessionsRes = await getTimerSessions({ limit: 10 });
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (sessionsRes.data.success) {
        setSessions(sessionsRes.data.data);
      }
    } catch (err) {
      console.log('Error fetching plant data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePlantTap = () => {
    Animated.sequence([
      Animated.timing(bounceValue, {
        toValue: 1.25,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(bounceValue, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (loading && !stats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const { totalXP, plantLevel } = stats;
  const nextXP = plantLevel.next;
  const currentLevelXP = ROADMAP.find(r => r.level === plantLevel.level - 1)?.level * 100 || 0; // dummy start
  const progressPct = nextXP ? Math.min(Math.round(((totalXP - currentLevelXP) / (nextXP - currentLevelXP)) * 100), 100) : 100;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchData();
          }}
          tintColor={COLORS.primary}
        />
      }
    >
      <View style={styles.plantDisplayCard}>
        <TouchableOpacity activeOpacity={0.8} onPress={handlePlantTap}>
          <Animated.Text style={[styles.plantEmoji, { transform: [{ scale: bounceValue }] }]}>
            {plantLevel.emoji}
          </Animated.Text>
        </TouchableOpacity>

        <View style={[styles.badge, { borderColor: COLORS.success, backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
          <Text style={styles.badgeText}>LEVEL {plantLevel.level}</Text>
        </View>

        <Text style={styles.plantName}>{plantLevel.name}</Text>
        <Text style={styles.plantDesc}>Grow your plant by completing Focus Timer sessions. Every minute studied gives you XP!</Text>

        <View style={styles.xpSection}>
          <View style={styles.xpInfo}>
            <Text style={styles.xpText}>{totalXP} Total XP</Text>
            <Text style={styles.xpNextText}>{nextXP ? `${nextXP - totalXP} XP to next level` : 'MAX LEVEL'}</Text>
          </View>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${progressPct}%`, backgroundColor: COLORS.success }]} />
          </View>
        </View>
      </View>

      {/* Roadmap */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Plant Evolution Roadmap</Text>
        <View style={styles.roadmapContainer}>
          {ROADMAP.map((r, i) => {
            const reached = totalXP >= (ROADMAP[i-1]?.level * 100 || 0); // basic logic for display
            const isCurrent = plantLevel.level === r.level;
            return (
              <View key={r.level} style={[styles.roadmapStep, reached && styles.reachedStep, isCurrent && styles.currentStep]}>
                <Text style={styles.roadmapEmoji}>{r.emoji}</Text>
                <Text style={styles.roadmapName}>{r.name}</Text>
                {i < ROADMAP.length - 1 && <View style={styles.roadmapLine} />}
              </View>
            );
          })}
        </View>
      </View>

      {/* Recent focus sessions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Focus Sessions</Text>
        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>No focus sessions logged yet.</Text>
        ) : (
          sessions.map((s) => (
            <View key={s._id} style={styles.sessionRow}>
              <View style={styles.sessionLeft}>
                <Text style={styles.sessionIcon}>{s.mode === 'pomodoro' ? '🍅' : '⏱️'}</Text>
                <View>
                  <Text style={styles.sessionTopic}>{s.topic}</Text>
                  <Text style={styles.sessionMeta}>
                    {s.durationMinutes} mins • {new Date(s.completedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={styles.sessionXp}>+{s.xpEarned || 0} XP</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  plantDisplayCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  plantEmoji: { fontSize: 96, marginVertical: SPACING.md },
  badge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  badgeText: { color: COLORS.success, fontWeight: '800', fontSize: 12 },
  plantName: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginTop: 12 },
  plantDesc: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  xpSection: { width: '100%', marginTop: 24 },
  xpInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpText: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  xpNextText: { color: COLORS.textMuted, fontSize: 12 },
  xpTrack: { height: 8, backgroundColor: COLORS.background, borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 4 },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800', marginBottom: SPACING.lg },
  roadmapContainer: { flexDirection: 'column', gap: 12, paddingLeft: 8 },
  roadmapStep: { flexDirection: 'row', alignItems: 'center', opacity: 0.35, position: 'relative' },
  reachedStep: { opacity: 0.7 },
  currentStep: { opacity: 1, transform: [{ scale: 1.05 }] },
  roadmapEmoji: { fontSize: 24, marginRight: 16 },
  roadmapName: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  roadmapLine: { position: 'absolute', left: 12, top: 28, width: 2, height: 16, backgroundColor: COLORS.border },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', padding: 20 },
  sessionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.background, padding: 12, borderRadius: RADIUS.sm, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionIcon: { fontSize: 20 },
  sessionTopic: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  sessionMeta: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  sessionXp: { color: '#f59e0b', fontWeight: '800', fontSize: 13, fontFamily: 'monospace' },
});
