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
import { getLabs, createLab } from '../api';

const LAB_TOPICS = [
  'Docker', 'Kubernetes', 'Linux', 'CI/CD', 'AWS', 'Terraform',
  'Ansible', 'Git', 'Networking', 'Monitoring', 'Security',
  'Scripting', 'Nginx', 'Jenkins', 'Other'
];

const LabItem = ({ item }) => (
  <View style={styles.labCard}>
    <View style={styles.labHeader}>
      <Text style={styles.labCategory}>{item.topic}</Text>
      <View style={[styles.statusTag, { backgroundColor: item.status === 'completed' ? COLORS.success : COLORS.warning }]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
    <Text style={{color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 8}}>{item.title}</Text>
    <Text style={styles.labDesc} numberOfLines={2}>{item.description}</Text>
    
    <View style={styles.labFooter}>
      <Text style={styles.labSteps}>{item.steps?.length || 0} Steps</Text>
      <Text style={styles.labXP}>{item.duration || 0} mins</Text>
    </View>
  </View>
);

export default function LabsScreen() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    topic: 'Docker',
    description: '',
    status: 'in-progress',
    duration: '30',
  });

  const fetchLabs = async () => {
    try {
      const { data } = await getLabs();
      setLabs(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.topic) return;
    try {
      const payload = {
        ...form,
        duration: parseInt(form.duration) || 0
      };
      const { data } = await createLab(payload);
      if (data.success) {
        setLabs([data.data, ...labs]);
        setShowModal(false);
        setForm({ title: '', topic: 'Docker', description: '', status: 'in-progress', duration: '30' });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create lab');
    }
  };

  useEffect(() => {
    fetchLabs();
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
        <Text style={styles.pageTitle}>Labs Tracker</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ New Lab</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={labs}
        renderItem={({ item }) => <LabItem item={item} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchLabs();}} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No labs tracked yet</Text>
          </View>
        }
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Lab</Text>
            <ScrollView>
              <Text style={styles.label}>Lab Title</Text>
              <TextInput style={styles.input} value={form.title} onChangeText={t => setForm({...form, title: t})} placeholder="What's the lab name?" placeholderTextColor={COLORS.textMuted} />
              
              <Text style={styles.label}>Topic</Text>
              <View style={styles.topicGrid}>
                {LAB_TOPICS.map(t => (
                  <TouchableOpacity 
                    key={t} 
                    style={[styles.topicChip, form.topic === t && styles.topicChipActive]}
                    onPress={() => setForm({...form, topic: t})}
                  >
                    <Text style={[styles.topicChipText, form.topic === t && styles.topicChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.label}>Duration (minutes)</Text>
              <TextInput style={styles.input} value={form.duration} onChangeText={t => setForm({...form, duration: t})} keyboardType="numeric" placeholder="e.g. 45" placeholderTextColor={COLORS.textMuted} />

              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, {height: 80}]} value={form.description} onChangeText={t => setForm({...form, description: t})} multiline placeholder="Goal of this lab..." placeholderTextColor={COLORS.textMuted} />
              
              <View style={styles.statusRow}>
                {['in-progress', 'completed'].map(status => (
                  <TouchableOpacity 
                    key={status} 
                    style={[styles.statusBtn, form.status === status && styles.statusBtnActive]}
                    onPress={() => setForm({...form, status})}
                  >
                    <Text style={[styles.statusBtnText, form.status === status && styles.statusBtnTextActive]}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                <Text style={styles.saveBtnText}>Save Lab</Text>
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
    backgroundColor: COLORS.secondary,
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
  labCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  labHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labCategory: {
    color: COLORS.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  labDesc: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  labFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  labSteps: {
    color: COLORS.text,
    fontSize: 12,
  },
  labXP: {
    color: COLORS.success,
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
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
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
  statusRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statusBtn: {
    flex: 1,
    padding: 12,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  statusBtnActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  statusBtnText: {
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  statusBtnTextActive: {
    color: '#fff',
  },
  modalActions: {
    marginTop: 24,
    gap: 10,
  },
  saveBtn: {
    backgroundColor: COLORS.secondary,
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
