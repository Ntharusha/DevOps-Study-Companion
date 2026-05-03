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
import { getProjects, addProjectTime, createProject } from '../api';

const ProjectItem = ({ item, onAddTime }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.status}>{item.status}</Text>
      <Text style={styles.time}>{item.timeSpent}h spent</Text>
    </View>
    <Text style={styles.name}>{item.name}</Text>
    <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
    
    <View style={styles.techContainer}>
      {item.technologies.map(tech => (
        <View key={tech} style={styles.techTag}>
          <Text style={styles.techText}>{tech}</Text>
        </View>
      ))}
    </View>

    <TouchableOpacity 
      style={styles.timeButton}
      onPress={() => onAddTime(item._id)}
    >
      <Text style={styles.timeButtonText}>+ 1 Hour Work</Text>
    </TouchableOpacity>
  </View>
);

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    technologies: '',
    status: 'planning',
  });

  const fetchProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name) return;
    try {
      const payload = {
        ...form,
        technologies: form.technologies.split(',').map(s => s.trim()).filter(s => s),
      };
      const { data } = await createProject(payload);
      setProjects([data.data, ...projects]);
      setShowModal(false);
      setForm({ name: '', description: '', technologies: '', status: 'planning' });
    } catch (error) {
      alert('Failed to create project');
    }
  };

  const handleAddTime = async (id) => {
    try {
      const { data } = await addProjectTime(id, 1);
      setProjects(projects.map(p => p._id === id ? data.data : p));
    } catch (error) {
      alert('Failed to update time');
    }
  };

  useEffect(() => {
    fetchProjects();
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
        <Text style={styles.pageTitle}>Projects</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ New Project</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={projects}
        renderItem={({ item }) => <ProjectItem item={item} onAddTime={handleAddTime} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchProjects();}} tintColor={COLORS.primary} />
        }
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Project</Text>
            <ScrollView>
              <Text style={styles.label}>Project Name</Text>
              <TextInput style={styles.input} value={form.name} onChangeText={t => setForm({...form, name: t})} placeholder="What are you building?" placeholderTextColor={COLORS.textMuted} />
              
              <Text style={styles.label}>Tech Stack (comma separated)</Text>
              <TextInput style={styles.input} value={form.technologies} onChangeText={t => setForm({...form, technologies: t})} placeholder="e.g. React, Docker, Node" placeholderTextColor={COLORS.textMuted} />
              
              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, {height: 80}]} value={form.description} onChangeText={t => setForm({...form, description: t})} multiline placeholder="Project details..." placeholderTextColor={COLORS.textMuted} />
              
              <View style={styles.statusRow}>
                {['planning', 'active', 'completed'].map(status => (
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
                <Text style={styles.saveBtnText}>Create Project</Text>
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
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  status: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  time: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  name: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  desc: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: SPACING.md,
  },
  techContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.md,
  },
  techTag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  techText: {
    color: COLORS.text,
    fontSize: 10,
  },
  timeButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  timeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
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
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
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
