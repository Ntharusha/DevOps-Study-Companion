import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { getGoals, createGoal, deleteGoal } from '../api';

const TOPICS = ['Docker', 'Kubernetes', 'AWS', 'Linux', 'Git', 'CI/CD', 'Ansible', 'Terraform', 'Other'];
const TOPIC_COLORS = {
  Docker: '#2496ed',
  Kubernetes: '#326ce5',
  AWS: '#ff9900',
  Linux: '#fcc624',
  Git: '#f05032',
  'CI/CD': '#10b981',
  Ansible: '#ee0000',
  Terraform: '#844fba',
  Other: '#6b7280',
};

export default function GoalsScreen() {
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({ totalActual: 0, totalTarget: 0 });
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [selectedTopic, setSelectedTopic] = useState('Kubernetes');
  const [targetHours, setTargetHours] = useState('5');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchGoalsData();
  }, []);

  const fetchGoalsData = async () => {
    try {
      const { data } = await getGoals();
      if (data.success) {
        setGoals(data.data.goals);
        setSummary(data.data.summary);
      }
    } catch (err) {
      console.log('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!targetHours || isNaN(targetHours) || parseFloat(targetHours) <= 0) {
      return alert('Please enter a valid target hour');
    }
    try {
      setLoading(true);
      const { data } = await createGoal({
        topic: selectedTopic,
        targetHours: parseFloat(targetHours),
        notes,
        color: TOPIC_COLORS[selectedTopic] || '#6366f1',
      });
      if (data.success) {
        setModalVisible(false);
        resetForm();
        fetchGoalsData();
      }
    } catch (err) {
      console.log('Error creating goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      setLoading(true);
      await deleteGoal(id);
      fetchGoalsData();
    } catch (err) {
      console.log('Error deleting goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTopic('Kubernetes');
    setTargetHours('5');
    setNotes('');
  };

  const calculatePct = (actual, target) => {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((actual / target) * 100), 100);
  };

  if (loading && goals.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const masterPct = calculatePct(summary.totalActual, summary.totalTarget);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
        <View style={styles.header}>
          <Text style={styles.title}>Weekly Goals</Text>
          <TouchableOpacity style={styles.btnAdd} onPress={() => setModalVisible(true)}>
            <Text style={styles.btnAddText}>+ SET GOAL</Text>
          </TouchableOpacity>
        </View>

        {/* Master Progress Card */}
        <View style={styles.masterCard}>
          <View style={styles.masterHeader}>
            <View>
              <Text style={styles.masterSubtitle}>WEEKLY HOURS TARGET</Text>
              <Text style={styles.masterHours}>
                {summary.totalActual.toFixed(1)} / {summary.totalTarget.toFixed(1)}h
              </Text>
            </View>
            <View style={[styles.masterBadge, masterPct >= 100 && styles.masterBadgeDone]}>
              <Text style={styles.masterBadgeText}>{masterPct}%</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${masterPct}%`, backgroundColor: COLORS.primary }]} />
          </View>
          {masterPct >= 100 && (
            <Text style={styles.congratsText}>🏆 Weekly Target Achieved! Keep it up!</Text>
          )}
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>🎯 No goals set for this week.</Text>
          </View>
        ) : (
          goals.map((goal) => {
            const pct = calculatePct(goal.actualHours, goal.targetHours);
            return (
              <View key={goal._id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={[styles.topicBadge, { backgroundColor: goal.color + '20', borderColor: goal.color, borderWidth: 1 }]}>
                    <Text style={[styles.topicBadgeText, { color: goal.color }]}>{goal.topic}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteGoal(goal._id)}>
                    <Text style={styles.btnDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.goalHoursRow}>
                  <Text style={styles.goalHoursVal}>{goal.actualHours.toFixed(1)}</Text>
                  <Text style={styles.goalHoursSep}>/</Text>
                  <Text style={styles.goalHoursMax}>{goal.targetHours.toFixed(1)}h</Text>
                  <Text style={[styles.goalPctText, { color: goal.color }]}>{pct}%</Text>
                </View>

                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: goal.color }]} />
                </View>

                {goal.notes ? <Text style={styles.goalNotes}>{goal.notes}</Text> : null}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Set Goal Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Study Goal</Text>

            <Text style={styles.modalLabel}>Select DevOps Topic</Text>
            <View style={styles.catGrid}>
              {TOPICS.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.catChip, selectedTopic === t && styles.activeCatChip]}
                  onPress={() => setSelectedTopic(t)}
                >
                  <Text style={styles.catChipText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Weekly Hours Target</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={targetHours}
              onChangeText={setTargetHours}
              placeholder="e.g. 10"
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.modalLabel}>Goals Notes / Resources</Text>
            <TextInput
              style={styles.modalInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Focus on CKAD labs or read docs"
              placeholderTextColor={COLORS.textMuted}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmit} onPress={handleCreateGoal}>
                <Text style={styles.submitText}>SET GOAL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  btnAdd: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.sm },
  btnAddText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  masterCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  masterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  masterSubtitle: { color: COLORS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  masterHours: { color: COLORS.text, fontSize: 28, fontWeight: '800', marginTop: 4 },
  masterBadge: { backgroundColor: 'rgba(99, 102, 241, 0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.sm },
  masterBadgeDone: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  masterBadgeText: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  progressBar: { height: 8, backgroundColor: COLORS.background, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  congratsText: { color: COLORS.success, fontWeight: '800', fontSize: 12, marginTop: 12, textAlign: 'center' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: 16 },
  goalCard: { backgroundColor: COLORS.card, padding: SPACING.lg, borderRadius: RADIUS.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  topicBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  topicBadgeText: { fontSize: 10, fontWeight: '800' },
  btnDeleteText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },
  goalHoursRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8, gap: 4 },
  goalHoursVal: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  goalHoursSep: { color: COLORS.textMuted, fontSize: 14 },
  goalHoursMax: { color: COLORS.textMuted, fontSize: 14 },
  goalPctText: { fontSize: 16, fontWeight: '800', marginLeft: 'auto' },
  goalNotes: { color: COLORS.textMuted, fontSize: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: SPACING.lg },
  modalContent: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  modalTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: SPACING.md },
  modalLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  catChip: { backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border },
  activeCatChip: { borderColor: COLORS.primary, backgroundColor: 'rgba(99, 102, 241, 0.15)' },
  catChipText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  modalInput: { backgroundColor: COLORS.background, color: COLORS.text, padding: 12, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: SPACING.sm },
  modalCancel: { padding: 12 },
  cancelText: { color: COLORS.textMuted, fontWeight: '700' },
  modalSubmit: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: RADIUS.sm },
  submitText: { color: '#fff', fontWeight: '800' },
});
