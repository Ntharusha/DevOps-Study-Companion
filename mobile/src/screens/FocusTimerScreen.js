import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { saveTimerSession, getTimerStats } from '../api';

const TOPICS = ['Docker', 'Kubernetes', 'AWS', 'Linux', 'Git', 'CI/CD', 'Ansible', 'Terraform', 'Other'];

export default function FocusTimerScreen() {
  const [mode, setMode] = useState('pomodoro'); // pomodoro, stopwatch, countdown
  const [phase, setPhase] = useState('work'); // work, break
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [customWorkMin, setCustomWorkMin] = useState('25');
  const [customBreakMin, setCustomBreakMin] = useState('5');
  const [selectedTopic, setSelectedTopic] = useState('Kubernetes');
  const [stats, setStats] = useState({ totalSessions: 0, totalHours: 0 });
  const [loading, setLoading] = useState(false);
  const [targetSessions, setTargetSessions] = useState('4');
  const [sessionCount, setSessionCount] = useState(0);
  const [autoStartBreak, setAutoStartBreak] = useState(true);
  const [autoResumeWork, setAutoResumeWork] = useState(true);

  const timerRef = useRef(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getTimerStats();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.log('Error fetching timer stats:', err);
    }
  };

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (mode === 'stopwatch') {
            return prev + 1;
          }
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      timerRef.current = interval;
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, mode]);

  // Watch for countdown/pomodoro timer completion
  useEffect(() => {
    if (isActive && mode !== 'stopwatch' && timeLeft === 0) {
      handleSessionComplete();
    }
  }, [timeLeft, isActive, mode]);

  const handleSessionComplete = async () => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const workMin = parseInt(customWorkMin) || 25;
    const breakMin = parseInt(customBreakMin) || 5;

    let durationMinutes = 0;
    if (mode === 'pomodoro') {
      durationMinutes = phase === 'work' ? workMin : breakMin;
    } else if (mode === 'countdown') {
      durationMinutes = workMin;
    } else if (mode === 'stopwatch') {
      durationMinutes = Math.round(timeLeft / 60);
      if (durationMinutes === 0 && timeLeft > 0) {
        durationMinutes = 1; // Round up to 1 minute minimum
      }
    }

    let currentCount = sessionCount;
    if (mode === 'pomodoro' && phase === 'work') {
      currentCount += 1;
      setSessionCount(currentCount);
      alert('Focus session complete! Take a break. 🍅');
    } else if (mode === 'countdown') {
      alert('Countdown complete! ⏰');
    } else if (mode === 'stopwatch') {
      alert(`Stopwatch session complete! Logged ${durationMinutes} mins. ⏱️`);
    } else if (mode === 'pomodoro' && phase === 'break') {
      alert('☕ Break over! Time to focus.');
    }

    try {
      setLoading(true);
      await saveTimerSession({
        mode,
        durationMinutes,
        topic: selectedTopic,
        phase,
      });
      fetchStats();
    } catch (err) {
      console.log('Error saving session:', err);
    } finally {
      setLoading(false);
    }

    // Toggle Phase for Pomodoro
    if (mode === 'pomodoro') {
      const targetCount = parseInt(targetSessions) || 4;
      if (phase === 'work') {
        if (autoStartBreak && currentCount < targetCount) {
          setPhase('break');
          setTimeLeft(breakMin * 60);
          setIsActive(true);
        } else {
          setPhase('work');
          setTimeLeft(workMin * 60);
          if (currentCount >= targetCount) {
            alert(`🎉 All ${targetCount} sessions completed! Great job!`);
          }
        }
      } else {
        setPhase('work');
        setTimeLeft(workMin * 60);
        if (autoResumeWork && currentCount < targetCount) {
          setIsActive(true);
        }
      }
    } else {
      resetTimer();
    }
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    if (mode === 'pomodoro') {
      setTimeLeft((phase === 'work' ? parseInt(customWorkMin) : parseInt(customBreakMin)) * 60);
    } else if (mode === 'countdown') {
      setTimeLeft(parseInt(customWorkMin) * 60);
    } else {
      setTimeLeft(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    clearInterval(timerRef.current);
    if (newMode === 'pomodoro') {
      setPhase('work');
      setTimeLeft(parseInt(customWorkMin) * 60);
    } else if (newMode === 'countdown') {
      setTimeLeft(parseInt(customWorkMin) * 60);
    } else {
      setTimeLeft(0);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.modeTabs}>
        {['pomodoro', 'stopwatch', 'countdown'].map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeTab, mode === m && styles.activeTab]}
            onPress={() => handleModeChange(m)}
          >
            <Text style={[styles.tabText, mode === m && styles.activeTabText]}>
              {m.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.timerCard}>
        {mode === 'pomodoro' && (
          <View style={[styles.badge, phase === 'work' ? styles.workBadge : styles.breakBadge]}>
            <Text style={styles.badgeText}>{phase.toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          {mode === 'pomodoro' && (
            <Text style={{color: COLORS.textMuted, fontSize: 11, fontWeight: '700', marginTop: 2}}>
              Session {sessionCount} / {targetSessions}
            </Text>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.btnPlay} onPress={handleStartPause}>
            <Text style={styles.btnPlayText}>{isActive ? '⏸ PAUSE' : '▶ START'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnReset} onPress={resetTimer}>
            <Text style={styles.btnResetText}>🔄 RESET</Text>
          </TouchableOpacity>
          {mode === 'stopwatch' && timeLeft > 0 && (
            <TouchableOpacity style={styles.btnDone} onPress={handleSessionComplete}>
              <Text style={styles.btnDoneText}>✓ DONE</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Session Settings</Text>

        <Text style={styles.label}>DevOps Topic</Text>
        <View style={styles.topicsGrid}>
          {TOPICS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.topicChip, selectedTopic === t && styles.activeTopicChip]}
              onPress={() => setSelectedTopic(t)}
            >
              <Text style={[styles.topicChipText, selectedTopic === t && styles.activeTopicText]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode !== 'stopwatch' && (
          <View>
            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Work (Min)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={customWorkMin}
                  onChangeText={(text) => {
                    setCustomWorkMin(text);
                    if (!isActive) setTimeLeft(parseInt(text || '0') * 60);
                  }}
                />
              </View>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Break (Min)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={customBreakMin}
                  onChangeText={setCustomBreakMin}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Sessions</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={targetSessions}
                  onChangeText={setTargetSessions}
                />
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
              <Text style={{ color: COLORS.text, fontWeight: '600' }}>Auto-start breaks</Text>
              <Switch value={autoStartBreak} onValueChange={setAutoStartBreak} trackColor={{ true: COLORS.primary }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
              <Text style={{ color: COLORS.text, fontWeight: '600' }}>Auto-resume work</Text>
              <Switch value={autoResumeWork} onValueChange={setAutoResumeWork} trackColor={{ true: COLORS.primary }} />
            </View>
          </View>
        )}
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statCol}>
          <Text style={styles.statVal}>{stats.totalSessions || 0}</Text>
          <Text style={styles.statLbl}>Sessions</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statVal}>{(stats.totalHours || 0).toFixed(1)}h</Text>
          <Text style={styles.statLbl}>Hours</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
  modeTabs: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: 4, marginBottom: SPACING.lg },
  modeTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: RADIUS.sm },
  activeTab: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 12 },
  activeTabText: { color: '#fff' },
  timerCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: RADIUS.lg, 
    padding: 32, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(99, 102, 241, 0.25)', 
    marginBottom: SPACING.lg 
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    borderTopColor: COLORS.primary,
    borderRightColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  timerText: { 
    fontSize: 44, 
    fontWeight: '900', 
    color: COLORS.text, 
    fontFamily: 'System',
  },
  badge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  workBadge: { backgroundColor: 'rgba(99, 102, 241, 0.15)', borderWidth: 1, borderColor: COLORS.primary },
  breakBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: COLORS.success },
  badgeText: { color: COLORS.text, fontWeight: '800', fontSize: 12 },
  controls: { flexDirection: 'row', gap: 16, marginTop: SPACING.md },
  btnPlay: { 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 28, 
    paddingVertical: 14, 
    borderRadius: RADIUS.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPlayText: { color: '#fff', fontWeight: '800' },
  btnReset: { backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 20, paddingVertical: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  btnResetText: { color: COLORS.text, fontWeight: '700' },
  btnDone: { backgroundColor: COLORS.success, paddingHorizontal: 20, paddingVertical: 14, borderRadius: RADIUS.md },
  btnDoneText: { color: '#fff', fontWeight: '800' },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  cardTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: SPACING.md },
  label: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  topicChip: { backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border },
  activeTopicChip: { backgroundColor: 'rgba(99, 102, 241, 0.15)', borderColor: COLORS.primary },
  topicChipText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  activeTopicText: { color: COLORS.text, fontWeight: '800' },
  rowInputs: { flexDirection: 'row', marginTop: SPACING.sm },
  input: { backgroundColor: COLORS.background, color: COLORS.text, padding: 12, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  statsCard: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: 40 },
  statCol: { flex: 1, alignItems: 'center' },
  statVal: { color: COLORS.text, fontSize: 28, fontWeight: '800' },
  statLbl: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
});
