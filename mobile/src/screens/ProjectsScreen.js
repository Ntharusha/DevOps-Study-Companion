import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { getProjects, addProjectTime } from '../api';

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
      <FlatList
        data={projects}
        renderItem={({ item }) => <ProjectItem item={item} onAddTime={handleAddTime} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchProjects();}} tintColor={COLORS.primary} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
});
