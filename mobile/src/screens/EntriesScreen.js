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
import { getEntries } from '../api';

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
});
