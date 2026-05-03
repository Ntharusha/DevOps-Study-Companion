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
import { getEntries, createEntry } from '../api';

const EntryItem = ({ item }) => (
  <View style={styles.entryCard}>
    <View style={styles.entryHeader}>
      <Text style={styles.entryDate}>{new Date(item.date).toLocaleDateString()}</Text>
      <View style={[styles.tag, { backgroundColor: item.type === 'learning' ? COLORS.primary : COLORS.secondary }]}>
        <Text style={styles.tagText}>{item.type}</Text>
      </View>
    </View>
    <Text style={styles.entryTitle}>{item.title}</Text>
    <Text style={styles.entryDesc} numberOfLines={2}>{item.description}</Text>
    <View style={styles.entryFooter}>
      <Text style={styles.entryTopic}># {item.topic}</Text>
      <Text style={styles.entryDuration}>{item.duration} hours</Text>
    </View>
  </View>
);

export default function EntriesScreen() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    topic: '',
    duration: '',
    type: 'learning',
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
    if (!form.title || !form.duration) return;
    try {
      const { data } = await createEntry(form);
      setEntries([data.data, ...entries]);
      setShowModal(false);
      setForm({ title: '', description: '', topic: '', duration: '', type: 'learning' });
    } catch (error) {
      alert('Failed to create entry');
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
        renderItem={({ item }) => <EntryItem item={item} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchEntries();}} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No entries found</Text>
          </View>
        }
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Entry</Text>
            <ScrollView>
              <Text style={styles.label}>Title</Text>
              <TextInput style={styles.input} value={form.title} onChangeText={t => setForm({...form, title: t})} placeholder="What did you do?" placeholderTextColor={COLORS.textMuted} />
              
              <Text style={styles.label}>Topic</Text>
              <TextInput style={styles.input} value={form.topic} onChangeText={t => setForm({...form, topic: t})} placeholder="e.g. Docker, AWS, K8s" placeholderTextColor={COLORS.textMuted} />
              
              <Text style={styles.label}>Duration (hours)</Text>
              <TextInput style={styles.input} value={form.duration} onChangeText={t => setForm({...form, duration: t})} placeholder="e.g. 2.5" keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
              
              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, {height: 80}]} value={form.description} onChangeText={t => setForm({...form, description: t})} multiline placeholder="Details..." placeholderTextColor={COLORS.textMuted} />
              
              <View style={styles.typeRow}>
                {['learning', 'working'].map(type => (
                  <TouchableOpacity 
                    key={type} 
                    style={[styles.typeBtn, form.type === type && styles.typeBtnActive]}
                    onPress={() => setForm({...form, type})}
                  >
                    <Text style={[styles.typeBtnText, form.type === type && styles.typeBtnTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                <Text style={styles.saveBtnText}>Save Entry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: SPACING.sm,
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
  entryTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  entryDesc: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: SPACING.md,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  entryTopic: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
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
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeBtnText: {
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: '#fff',
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
});
