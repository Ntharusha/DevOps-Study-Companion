import React, { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme';
import { storage } from '../utils/storage';

// ─── Auto-suggested DevOps study tasks (rotated daily) ─────────────────────
const SUGGESTED_TASKS_POOL = [
  // Docker
  { title: '🐳 Practice Docker multi-stage builds', category: 'Docker' },
  { title: '🐳 Read about Docker networking (bridge, host, overlay)', category: 'Docker' },
  { title: '🐳 Write a Dockerfile for a Node.js app', category: 'Docker' },
  { title: '🐳 Learn Docker Compose volumes & secrets', category: 'Docker' },
  // Kubernetes
  { title: '☸️ Deploy a pod using kubectl', category: 'Kubernetes' },
  { title: '☸️ Study Kubernetes Services (ClusterIP, NodePort, LoadBalancer)', category: 'Kubernetes' },
  { title: '☸️ Practice creating ConfigMaps and Secrets', category: 'Kubernetes' },
  { title: '☸️ Learn about Kubernetes RBAC', category: 'Kubernetes' },
  // Linux
  { title: '🐧 Practice Linux file permissions (chmod, chown)', category: 'Linux' },
  { title: '🐧 Learn systemd service management', category: 'Linux' },
  { title: '🐧 Study Linux networking commands (ip, ss, netstat)', category: 'Linux' },
  { title: '🐧 Practice shell scripting loops and conditionals', category: 'Linux' },
  // CI/CD
  { title: '🔄 Set up a GitHub Actions workflow', category: 'CI/CD' },
  { title: '🔄 Study Jenkins pipeline syntax', category: 'CI/CD' },
  { title: '🔄 Learn about GitOps with ArgoCD', category: 'CI/CD' },
  // AWS / Cloud
  { title: '☁️ Study AWS IAM policies and roles', category: 'AWS' },
  { title: '☁️ Learn about S3 bucket policies', category: 'AWS' },
  { title: '☁️ Practice launching an EC2 instance', category: 'AWS' },
  // Terraform / IaC
  { title: '🏗️ Write a Terraform module for a VPC', category: 'Terraform' },
  { title: '🏗️ Study Terraform state management', category: 'Terraform' },
  { title: '🏗️ Learn Ansible playbook basics', category: 'Ansible' },
  // Git
  { title: '🔀 Practice Git rebasing and cherry-pick', category: 'Git' },
  { title: '🔀 Learn Git hooks (pre-commit, pre-push)', category: 'Git' },
  // Monitoring
  { title: '📊 Set up Prometheus alerting rules', category: 'Monitoring' },
  { title: '📊 Build a Grafana dashboard from scratch', category: 'Monitoring' },
  { title: '📊 Study ELK stack (Elasticsearch, Logstash, Kibana)', category: 'Monitoring' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function getTodayString() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

function getDailySuggestions() {
  const today = getTodayString();
  const savedDate = storage.getString('daily_tasks_suggest_date');
  const savedSuggestions = storage.getString('daily_tasks_suggestions');

  if (savedDate === today && savedSuggestions) {
    return JSON.parse(savedSuggestions);
  }

  // Pick 3 random suggestions for today
  const shuffled = [...SUGGESTED_TASKS_POOL].sort(() => 0.5 - Math.random());
  const picked = shuffled.slice(0, 3).map((s) => ({
    _id: `suggest_${generateId()}`,
    title: s.title,
    category: s.category,
    completed: false,
    isSuggested: true,
    createdAt: new Date().toISOString(),
  }));

  storage.set('daily_tasks_suggest_date', today);
  storage.set('daily_tasks_suggestions', JSON.stringify(picked));
  return picked;
}

function getUserTasks() {
  const today = getTodayString();
  const savedDate = storage.getString('daily_tasks_user_date');
  const savedTasks = storage.getString('daily_tasks_user');

  if (savedDate === today && savedTasks) {
    return JSON.parse(savedTasks);
  }

  // New day → reset user tasks
  storage.set('daily_tasks_user_date', today);
  storage.set('daily_tasks_user', JSON.stringify([]));
  return [];
}

function saveUserTasks(tasks) {
  storage.set('daily_tasks_user_date', getTodayString());
  storage.set('daily_tasks_user', JSON.stringify(tasks));
}

function saveSuggestions(suggestions) {
  storage.set('daily_tasks_suggest_date', getTodayString());
  storage.set('daily_tasks_suggestions', JSON.stringify(suggestions));
}

// ─── Task Row Component ───────────────────────────────────────────────────
const TaskRow = ({ task, onToggle, onDelete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.taskRow, { opacity: fadeAnim }]}>
      <TouchableOpacity
        style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
        onPress={() => onToggle(task._id)}
        activeOpacity={0.7}
      >
        {task.completed && <Ionicons name="checkmark" size={18} color="#fff" />}
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <Text
          style={[
            styles.taskTitle,
            task.completed && styles.taskTitleCompleted,
          ]}
        >
          {task.title}
        </Text>
        {task.category && (
          <Text style={styles.taskCategory}>{task.category}</Text>
        )}
      </View>

      {task.isSuggested && (
        <View style={styles.suggestedBadge}>
          <Text style={styles.suggestedBadgeText}>AI</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(task._id)}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────
export default function DailyTasksScreen() {
  const [userTasks, setUserTasks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    setUserTasks(getUserTasks());
    setSuggestions(getDailySuggestions());
    setRefreshing(false);
  };

  const allTasks = [...suggestions, ...userTasks];
  const completedCount = allTasks.filter((t) => t.completed).length;
  const totalCount = allTasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddTask = () => {
    const text = newTaskText.trim();
    if (!text) return;

    const newTask = {
      _id: `task_${generateId()}`,
      title: text,
      category: null,
      completed: false,
      isSuggested: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [...userTasks, newTask];
    setUserTasks(updated);
    saveUserTasks(updated);
    setNewTaskText('');
  };

  const handleToggle = (id) => {
    // Check suggestions first
    const sugIdx = suggestions.findIndex((s) => s._id === id);
    if (sugIdx !== -1) {
      const updated = [...suggestions];
      updated[sugIdx] = { ...updated[sugIdx], completed: !updated[sugIdx].completed };
      setSuggestions(updated);
      saveSuggestions(updated);
      return;
    }

    // Then user tasks
    const taskIdx = userTasks.findIndex((t) => t._id === id);
    if (taskIdx !== -1) {
      const updated = [...userTasks];
      updated[taskIdx] = { ...updated[taskIdx], completed: !updated[taskIdx].completed };
      setUserTasks(updated);
      saveUserTasks(updated);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Task', 'Remove this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          // Check suggestions
          const sugIdx = suggestions.findIndex((s) => s._id === id);
          if (sugIdx !== -1) {
            const updated = suggestions.filter((s) => s._id !== id);
            setSuggestions(updated);
            saveSuggestions(updated);
            return;
          }
          // User tasks
          const updated = userTasks.filter((t) => t._id !== id);
          setUserTasks(updated);
          saveUserTasks(updated);
        },
      },
    ]);
  };

  // Check if all tasks completed → show celebration
  const allDone = totalCount > 0 && completedCount === totalCount;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadTasks();
            }}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressDate}>{getTodayString()}</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleText}>{progressPct}%</Text>
            </View>
          </View>

          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: `${progressPct}%` },
                allDone && { backgroundColor: COLORS.success },
              ]}
            />
          </View>

          <Text style={styles.progressSummary}>
            {completedCount} of {totalCount} tasks completed
            {allDone ? ' 🎉 All done!' : ''}
          </Text>
        </View>

        {/* Celebration banner */}
        {allDone && (
          <View style={styles.celebrationBanner}>
            <Ionicons name="trophy" size={36} color={COLORS.success} style={{ marginRight: SPACING.md }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.celebrationTitle}>Fantastic work!</Text>
              <Text style={styles.celebrationSub}>
                You've crushed every task today. Your Study Plant is thriving! 🌱
              </Text>
            </View>
          </View>
        )}

        {/* Suggested Tasks Section */}
        {suggestions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}><Ionicons name="hardware-chip" size={16} color={COLORS.text} /> Suggested Study Tasks</Text>
              <Text style={styles.sectionBadge}>Auto-generated</Text>
            </View>
            {suggestions.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}

        {/* My Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}><Ionicons name="list" size={16} color={COLORS.text} /> My Tasks</Text>
            <Text style={styles.sectionCount}>{userTasks.length} items</Text>
          </View>

          {userTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={36} color={COLORS.textMuted} style={{ marginBottom: SPACING.sm }} />
              <Text style={styles.emptyText}>
                No personal tasks yet. Add your first task below!
              </Text>
            </View>
          ) : (
            userTasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Add Task Bar */}
      <View style={styles.addTaskBar}>
        <TextInput
          style={styles.addTaskInput}
          placeholder="Add a new task..."
          placeholderTextColor={COLORS.textMuted}
          value={newTaskText}
          onChangeText={setNewTaskText}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addTaskBtn, !newTaskText.trim() && styles.addTaskBtnDisabled]}
          onPress={handleAddTask}
          disabled={!newTaskText.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.addTaskBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  progressCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  progressDate: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  progressCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  progressCircleText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressSummary: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  celebrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  celebrationEmoji: {
    fontSize: 36,
    marginRight: SPACING.md,
  },
  celebrationTitle: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: '800',
  },
  celebrationSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionBadge: {
    color: COLORS.neonCyan,
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    overflow: 'hidden',
  },
  sectionCount: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  checkboxCompleted: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  taskTitleCompleted: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  taskCategory: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  suggestedBadge: {
    backgroundColor: 'rgba(217, 70, 239, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.neonPink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  suggestedBadgeText: {
    color: COLORS.neonPink,
    fontSize: 9,
    fontWeight: '800',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  addTaskBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.md,
  },
  addTaskInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 14,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  addTaskBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addTaskBtnDisabled: {
    opacity: 0.4,
  },
  addTaskBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
});
