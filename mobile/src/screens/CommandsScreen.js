import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { getCommands } from '../api';

const CommandItem = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.category}>{item.category}</Text>
      <TouchableOpacity onPress={() => alert('Copied to clipboard (Mock)')}>
        <Text style={styles.copy}>📋</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.cmdContainer}>
      <Text style={styles.command}>$ {item.command}</Text>
    </View>
    <Text style={styles.desc}>{item.description}</Text>
    <View style={styles.tags}>
      {item.tags.map(tag => (
        <Text key={tag} style={styles.tag}>#{tag}</Text>
      ))}
    </View>
  </View>
);

export default function CommandsScreen() {
  const [commands, setCommands] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCommands = async () => {
    try {
      const { data } = await getCommands();
      setCommands(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommands();
  }, []);

  const filtered = commands.filter(c => 
    c.command.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search commands (e.g. docker, git)..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        renderItem={({ item }) => <CommandItem item={item} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No commands matching your search</Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 12,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  category: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  copy: {
    fontSize: 16,
  },
  cmdContainer: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  command: {
    color: COLORS.success,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
  },
  desc: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 10,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  empty: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
  },
});
