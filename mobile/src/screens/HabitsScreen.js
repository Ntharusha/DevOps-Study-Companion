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
import { getHabits, createHabit, toggleHabitComplete, deleteHabit } from '../api';

const EMOJIS = ['⚡', '🍅', '💻', '📖', '🧪', '🌱', '🚀', '🔑', '🎯', '🔥', '🧠', '🛠️'];
const ACCENT_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];
const CATEGORIES = ['Practice', 'Reading', 'Lab', 'Review', 'Project', 'Other'];

export default function HabitsScreen() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Practice');
  const [targetDays, setTargetDays] = useState('5');
  const [selectedIcon, setSelectedIcon] = useState('⚡');
  const [selectedColor, setSelectedColor] = useState('#6366f1');

  useEffect(() => {
    fetchHabitsData();
  }, []);

  const fetchHabitsData = async () => {
    try {
      const { data } = await getHabits();
      if (data.success) {
        setHabits(data.data);
      }
    } catch (err) {
      console.log('Error fetching habits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async () => {
    if (!name.trim()) return alert('Please enter a habit name');
    try {
      setLoading(true);
      const { data } = await createHabit({
        name,
        description,
        category,
        targetDaysPerWeek: parseInt(targetDays),
        color: selectedColor,
        icon: selectedIcon,
      });
      if (data.success) {
        setModalVisible(false);
        resetForm();
        fetchHabitsData();
      }
    } catch (err) {
      console.log('Error creating habit:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('Practice');
    setTargetDays('5');
    setSelectedIcon('⚡');
    setSelectedColor('#6366f1');
  };

  const handleToggleComplete = async (habitId) => {
    try {
      // Optimistic update
      setHabits(prev =>
        prev.map(h => {
          if (h._id === habitId) {
            const todayStr = new Date().toISOString().split('T')[0];
            const isCompletedToday = h.completions.some(c => c.date === todayStr);
            const updatedCompletions = isCompletedToday
              ? h.completions.filter(c => c.date !== todayStr)
              : [...h.completions, { date: todayStr, week: '2026-W21' }]; // dummy week
            return { ...h, completions: updatedCompletions };
          }
          return h;
        })
      );
      await toggleHabitComplete(habitId);
      fetchHabitsData(); // Sync with actual server stats
    } catch (err) {
      console.log('Error toggling habit completion:', err);
    }
  };

  const handleDelete = async (habitId) => {
    try {
      setLoading(true);
      await deleteHabit(habitId);
      fetchHabitsData();
    } catch (err) {
      console.log('Error deleting habit:', err);
    } finally {
      setLoading(false);
    }
  };

  const isDoneToday = (habit) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return habit.completions.some(c => c.date === todayStr);
  };

  if (loading && habits.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Habits</Text>
          <TouchableOpacity style={styles.btnAdd} onPress={() => setModalVisible(true)}>
            <Text style={styles.btnAddText}>+ ADD HABIT</Text>
          </TouchableOpacity>
        </View>

        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>🌱 No habits tracked yet. Start small!</Text>
          </View>
        ) : (
          habits.map((habit) => {
            const completedToday = isDoneToday(habit);
            return (
              <View key={habit._id} style={[styles.habitCard, { borderLeftColor: habit.color }]}>
                <View style={styles.habitMain}>
                  <View style={[styles.iconBox, { backgroundColor: habit.color + '20' }]}>
                    <Text style={styles.icon}>{habit.icon}</Text>
                  </View>
                  <View style={styles.habitDetails}>
                    <Text style={styles.habitName}>{habit.name}</Text>
                    <Text style={styles.habitStreak}>🔥 Streak: {habit.currentStreak || 0} days</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.checkBtn, completedToday && { backgroundColor: habit.color }]}
                    onPress={() => handleToggleComplete(habit._id)}
                  >
                    <Text style={[styles.checkText, completedToday && { color: '#fff' }]}>
                      {completedToday ? '✓ DONE' : 'MARK'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.habitFooter}>
                  <Text style={styles.categoryTag}>{habit.category}</Text>
                  <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(habit._id)}>
                    <Text style={styles.btnDeleteText}>DELETE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal for Add Habit */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Habit</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.modalInput}
                placeholder="Habit name (e.g. Code Kubernetes daily)"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Short Description"
                placeholderTextColor={COLORS.textMuted}
                value={description}
                onChangeText={setDescription}
              />

              <Text style={styles.modalLabel}>Category</Text>
              <View style={styles.catGrid}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.catChip, category === c && styles.activeCatChip]}
                    onPress={() => setCategory(c)}
                  >
                    <Text style={styles.catChipText}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Icon</Text>
              <View style={styles.emojiGrid}>
                {EMOJIS.map(e => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.emojiChip, selectedIcon === e && styles.activeEmojiChip]}
                    onPress={() => setSelectedIcon(e)}
                  >
                    <Text style={{ fontSize: 20 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Color</Text>
              <View style={styles.colorGrid}>
                {ACCENT_COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorChip, { backgroundColor: c }, selectedColor === c && styles.activeColorChip]}
                    onPress={() => setSelectedColor(c)}
                  />
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSubmit} onPress={handleCreateHabit}>
                  <Text style={styles.submitText}>CREATE</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: 16 },
  habitCard: { backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.md, borderLeftWidth: 4, borderWidth: 1, borderColor: COLORS.border },
  habitMain: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 20 },
  habitDetails: { flex: 1, marginLeft: SPACING.md },
  habitName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  habitStreak: { color: COLORS.primary, fontSize: 12, fontWeight: '600', marginTop: 2 },
  checkBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.02)' },
  checkText: { color: COLORS.textMuted, fontWeight: '800', fontSize: 12 },
  habitFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  categoryTag: { backgroundColor: 'rgba(255,255,255,0.05)', color: COLORS.textSecondary, fontSize: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, overflow: 'hidden' },
  btnDelete: { padding: 4 },
  btnDeleteText: { color: '#ef4444', fontSize: 11, fontWeight: '700' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: SPACING.lg },
  modalContent: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, maxHeight: '85%' },
  modalTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: SPACING.md },
  modalInput: { backgroundColor: COLORS.background, color: COLORS.text, padding: 12, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  modalLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  catChip: { backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border },
  activeCatChip: { borderColor: COLORS.primary, backgroundColor: 'rgba(99, 102, 241, 0.15)' },
  catChipText: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  emojiChip: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background },
  activeEmojiChip: { borderColor: COLORS.primary, backgroundColor: 'rgba(99, 102, 241, 0.15)' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.lg },
  colorChip: { width: 28, height: 28, borderRadius: 14 },
  activeColorChip: { borderWidth: 3, borderColor: '#fff' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: SPACING.sm },
  modalCancel: { padding: 12 },
  cancelText: { color: COLORS.textMuted, fontWeight: '700' },
  modalSubmit: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: RADIUS.sm },
  submitText: { color: '#fff', fontWeight: '800' },
});
