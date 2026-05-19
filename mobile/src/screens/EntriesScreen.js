import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { getEntries, createEntry, deleteEntry } from '../api';

const ENTRY_TOPICS = [
  'Docker', 'Kubernetes', 'Linux', 'CI/CD', 'AWS', 'Terraform',
  'Ansible', 'Git', 'Networking', 'Monitoring', 'Security',
  'Scripting', 'Nginx', 'Jenkins', 'Other'
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Expert'];

const EntryItem = ({ item, onDelete }) => (
  <View style={styles.entryCard}>
    <View style={styles.entryHeader}>
      <Text style={styles.entryDate}>{new Date(item.date).toLocaleDateString()}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={[styles.tag, { 
          backgroundColor: item.difficulty === 'Expert' ? '#ef4444' : 
                           item.difficulty === 'Hard' ? '#f97316' : 
                           item.difficulty === 'Medium' ? COLORS.primary : COLORS.success 
        }]}>
          <Text style={styles.tagText}>{item.difficulty}</Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(item._id)} style={styles.deleteBadge}>
          <Text style={styles.deleteBadgeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
    <Text style={styles.entryTopic}># {item.topic}</Text>
    <Text style={styles.entryDesc}>{item.description}</Text>
    {item.notes ? <Text style={styles.entryNotes} numberOfLines={2}>Notes: {item.notes}</Text> : null}
    <View style={styles.entryFooter}>
      <Text style={styles.entryDuration}>⏱️ {item.timeSpent} hours</Text>
    </View>
  </View>
);

export default function EntriesScreen() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    topic: 'Docker',
    description: '',
    timeSpent: '1',
    difficulty: 'Medium',
    notes: '',
  });

  const fetchEntries = async () => {
    try {
      const { data } = await getEntries();
      setEntries(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreate = async () => {
    if (!form.topic || !form.description || !form.timeSpent || !form.difficulty) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      const payload = {
        ...form,
        timeSpent: parseFloat(form.timeSpent) || 0
      };
      const { data } = await createEntry(payload);
      if (data.success) {
        setEntries([data.data, ...entries]);
        setShowModal(false);
        setForm({
          date: new Date().toISOString().split('T')[0],
          topic: 'Docker',
          description: '',
          timeSpent: '1',
          difficulty: 'Medium',
          notes: '',
        });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create entry');
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      const { data } = await deleteEntry(id);
      if (data.success) {
        setEntries(prev => prev.filter(e => e._id !== id));
      }
    } catch (error) {
      alert('Failed to delete entry');
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Study Log</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ New Entry</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        renderItem={({ item }) => <EntryItem item={item} onDelete={handleDeleteEntry} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchEntries();}} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No entries logged yet</Text>
          </View>
        }
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Daily Work</Text>
            <ScrollView>
              <Text style={styles.label}>Topic</Text>
              <View style={styles.topicGrid}>
                {ENTRY_TOPICS.map(t => (
                  <TouchableOpacity 
                    key={t} 
                    style={[styles.topicChip, form.topic === t && styles.topicChipActive]}
                    onPress={() => setForm({...form, topic: t})}
                  >
                    <Text style={[styles.topicChipText, form.topic === t && styles.topicChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Time Spent (hours)</Text>
              <TextInput 
                style={styles.input} 
                value={form.timeSpent} 
                onChangeText={t => setForm({...form, timeSpent: t})} 
                placeholder="e.g. 2.5" 
                keyboardType="numeric" 
                placeholderTextColor={COLORS.textMuted} 
              />

              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.difficultyRow}>
                {DIFFICULTIES.map(d => (
                  <TouchableOpacity 
                    key={d} 
                    style={[styles.diffBtn, form.difficulty === d && styles.diffBtnActive]}
                    onPress={() => setForm({...form, difficulty: d})}
                  >
                    <Text style={[styles.diffBtnText, form.difficulty === d && styles.diffBtnTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>What did you learn/do?</Text>
              <TextInput 
                style={[styles.input, {height: 80}]} 
                value={form.description} 
                onChangeText={t => setForm({...form, description: t})} 
                multiline 
                placeholder="Describe your activities..." 
                placeholderTextColor={COLORS.textMuted} 
              />

              <Text style={styles.label}>Additional Notes (optional)</Text>
              <TextInput 
                style={[styles.input, {height: 60}]} 
                value={form.notes} 
                onChangeText={t => setForm({...form, notes: t})} 
                multiline 
                placeholder="Any links, issues, observations..." 
                placeholderTextColor={COLORS.textMuted} 
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                  <Text style={styles.saveBtnText}>Save Entry</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  list: {
    padding: SPACING.md,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  entryDate: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  entryTopic: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  entryDesc: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  entryNotes: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: RADIUS.sm,
    marginBottom: 10,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: 4,
  },
  entryDuration: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: SPACING.lg,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    padding: 12,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  topicChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topicChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  topicChipText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  topicChipTextActive: {
    color: COLORS.text,
    fontWeight: '800',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  diffBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  diffBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  diffBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  diffBtnTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  modalActions: {
    marginTop: 24,
    gap: 10,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelBtn: {
    padding: 16,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.textMuted,
  },
  deleteBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteBadgeText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '900',
  },
});
