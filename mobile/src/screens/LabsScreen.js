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
import { getLabs } from '../api';

const LabItem = ({ item }) => (
  <View style={styles.labCard}>
    <View style={styles.labHeader}>
      <Text style={styles.labCategory}>{item.category}</Text>
      <View style={[styles.statusTag, { backgroundColor: item.status === 'completed' ? COLORS.success : COLORS.warning }]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
    <h3 style={{color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 8}}>{item.title}</h3>
    <Text style={styles.labDesc} numberOfLines={2}>{item.objective}</Text>
    
    <View style={styles.labFooter}>
      <Text style={styles.labSteps}>{item.steps?.length || 0} Steps</Text>
      <Text style={styles.labXP}>+{item.xpGained || 0} XP</Text>
    </View>
  </View>
);

export default function LabsScreen() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
});
