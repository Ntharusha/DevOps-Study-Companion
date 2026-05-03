import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { signup } from '../api';

export default function SignupScreen({ navigation, onSignup }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!form.username || !form.email || !form.password) {
      alert('Please fill all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await signup({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      if (data.success) {
        alert('Account created! Please sign in.');
        navigation.navigate('Login');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Signup failed. Please try again.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.logo}>✨</Text>
          <Text style={styles.title}>Join DevOps Companion</Text>
          <Text style={styles.subtitle}>Start tracking your learning journey</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose a username"
                placeholderTextColor={COLORS.textMuted}
                value={form.username}
                onChangeText={t => setForm({...form, username: t})}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textMuted}
                value={form.email}
                onChangeText={t => setForm({...form, email: t})}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={COLORS.textMuted}
                value={form.password}
                onChangeText={t => setForm({...form, password: t})}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Repeat password"
                placeholderTextColor={COLORS.textMuted}
                value={form.confirmPassword}
                onChangeText={t => setForm({...form, confirmPassword: t})}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton} 
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.linkText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
