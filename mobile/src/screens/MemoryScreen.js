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
import { getMemoryItems, reviewMemoryItem, createMemoryItem } from '../api';

const MemoryItem = ({ item, onReview }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.strength}>Strength: {item.strength}/5</Text>
      </View>
      <Text style={styles.concept}>{item.concept}</Text>
      
      {revealed ? (
        <View style={styles.revealArea}>
          <Text style={styles.explanation}>{item.explanation}</Text>
          <View style={styles.reviewButtons}>
            {[1, 3, 5].map(lvl => (
              <TouchableOpacity 
                key={lvl} 
                style={styles.reviewBtn} 
                onPress={() => { onReview(item._id, lvl); setRevealed(false); }}
              >
                <Text style={styles.reviewBtnText}>{lvl === 1 ? 'Hard' : lvl === 5 ? 'Easy' : 'Okay'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.revealBtn} onPress={() => setRevealed(true)}>
          <Text style={styles.revealBtnText}>Show Answer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function MemoryScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    concept: '',
    explanation: '',
    category: '',
  });

  const fetchItems = async () => {
    try {
      const { data } = await getMemoryItems();
      setItems(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreate = async () => {
    if (!form.concept) {
      alert('Concept/Question is required');
      return;
    }
    if (!form.explanation) {
      alert('Explanation/Answer is required');
      return;
    }
    try {
      const { data } = await createMemoryItem(form);
      setItems([data.data, ...items]);
      setShowModal(false);
      setForm({ concept: '', explanation: '', category: '' });
    } catch (error) {
      alert('Failed to create item');
    }
  };

  const handleReview = async (id, strength) => {
    try {
      const { data } = await reviewMemoryItem(id, strength);
      setItems(items.map(i => i._id === id ? data.data : i));
    } catch (error) {
      alert('Review failed');
    }
  };

  useEffect(() => {
    fetchItems();
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
        <Text style={styles.pageTitle}>Memory Bank</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ New Item</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={({ item }) => <MemoryItem item={item} onReview={handleReview} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchItems();}} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Memory bank is empty</Text>
          </View>
        }
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Concept</Text>
            <ScrollView>
              <Text style={styles.label}>Concept / Question</Text>
              <TextInput style={styles.input} value={form.concept} onChangeText={t => setForm({...form, concept: t})} placeholder="What do you want to remember?" placeholderTextColor={COLORS.textMuted} />
              
              <Text style={styles.label}>Category</Text>
              <TextInput style={styles.input} value={form.category} onChangeText={t => setForm({...form, category: t})} placeholder="e.g. Git, Docker, Architecture" placeholderTextColor={COLORS.textMuted} />
              
              <Text style={styles.label}>Explanation / Answer</Text>
              <TextInput style={[styles.input, {height: 120}]} value={form.explanation} onChangeText={t => setForm({...form, explanation: t})} multiline placeholder="Full explanation..." placeholderTextColor={COLORS.textMuted} />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                  <Text style={styles.saveBtnText}>Save to Bank</Text>
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
    backgroundColor: COLORS.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#000',
    fontWeight: '800',
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
    marginBottom: 12,
  },
  category: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  strength: {
    color: COLORS.warning,
    fontSize: 10,
    fontWeight: '700',
  },
  concept: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  revealBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  revealBtnText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  revealArea: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  explanation: {
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  reviewButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  reviewBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewBtnText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
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
  modalActions: {
    marginTop: 24,
    gap: 10,
  },
  saveBtn: {
    backgroundColor: COLORS.warning,
    padding: 16,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#000',
    fontWeight: '800',
  },
  cancelBtn: {
    padding: 16,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.textMuted,
  },
});
