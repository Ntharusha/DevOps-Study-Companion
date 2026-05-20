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
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import api, { login, updateApiBaseUrl } from '../api';

export default function LoginScreen({ navigation, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverUrl, setServerUrl] = useState(api.defaults.baseURL);
  const [showServerConfig, setShowServerConfig] = useState(false);

  const handleSaveServerUrl = () => {
    if (!serverUrl.trim()) return;
    updateApiBaseUrl(serverUrl.trim());
    alert('Server URL updated successfully!');
    setShowServerConfig(false);
  };

  const handleOfflineLogin = () => {
    onLogin({
      username: 'ghost69',
      token: 'simple-auth-token-offline-mode',
      offline: true,
    });
  };

  const handleLogin = async () => {
    if (!username || !password) return;
    setLoading(true);
    try {
      const { data } = await login({ username, password });
      if (data.success) {
        onLogin(data.user);
      }
    } catch (error) {
      console.log('Login error details:', error);
      const isNetworkError = !error.response || error.message?.includes('Network Error') || error.code === 'ERR_NETWORK';
      if (isNetworkError) {
        alert('Could not connect to the backend server.\n\nPlease verify your server IP/URL settings under server config, ensure the backend is running, or tap "Use Offline Mode" to start immediately without a server.');
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>🚀</Text>
        <Text style={styles.title}>DevOps Companion</Text>
        <Text style={styles.subtitle}>Sign in to your learning dashboard</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              placeholderTextColor={COLORS.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.offlineButton}
            onPress={handleOfflineLogin}
            disabled={loading}
          >
            <Text style={styles.offlineButtonText}>🚀 Launch Offline Workspace</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.onlineButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.onlineButtonText}>Connect & Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingsToggle}
            onPress={() => setShowServerConfig(!showServerConfig)}
          >
            <Text style={styles.settingsToggleText}>
              {showServerConfig ? '▲ Hide Server Settings' : '⚙️ Configure Server IP'}
            </Text>
          </TouchableOpacity>

          {showServerConfig && (
            <View style={styles.serverConfigBox}>
              <Text style={styles.serverLabel}>Server API URL</Text>
              <View style={styles.serverInputRow}>
                <TextInput
                  style={[styles.input, styles.serverInput]}
                  placeholder="http://192.168.1.211:5000/api"
                  placeholderTextColor={COLORS.textMuted}
                  value={serverUrl}
                  onChangeText={setServerUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveServerUrl}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>🔒 Private Companion App</Text>
            <Text style={styles.infoText}>This app is configured for private use. New user registration is disabled. Use the default credentials below:</Text>
            <View style={styles.credRow}>
              <Text style={styles.credLabel}>Username:</Text>
              <Text style={styles.credValue}>ghost69</Text>
            </View>
            <View style={styles.credRow}>
              <Text style={styles.credLabel}>Password:</Text>
              <Text style={styles.credValue}>2001</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>Personal Use Only • Ghost69</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  onlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  onlineButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  offlineButton: {
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  offlineButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: SPACING.xl,
    color: COLORS.textMuted,
    fontSize: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.lg,
    width: '100%',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
  },
  infoTitle: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  credRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  credLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  credValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  settingsToggle: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  settingsToggleText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  serverConfigBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    marginBottom: SPACING.md,
  },
  serverLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  serverInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serverInput: {
    flex: 1,
    height: 40,
    paddingVertical: 0,
    marginRight: SPACING.sm,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    height: 40,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
