import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { storage } from '../utils/storage';
import { scheduleLocalNotification } from '../utils/notificationHelper';

const MenuItem = ({ title, icon, subtitle, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Text style={styles.menuIcon}>{icon}</Text>
    </View>
    <View style={styles.menuText}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.arrow}>›</Text>
  </TouchableOpacity>
);

export default function MoreScreen({ navigation, onLogout }) {
  const [notifsEnabled, setNotifsEnabled] = useState(storage.getBoolean('notifications_enabled') !== false);

  const toggleNotifications = () => {
    const nextVal = !notifsEnabled;
    storage.set('notifications_enabled', nextVal);
    setNotifsEnabled(nextVal);
  };

  const handleTestNotification = async () => {
    try {
      await scheduleLocalNotification(
        'DevOps Companion Test 🧪',
        '🌱 Study Plant status is healthy! Smart reminders are configured and active.'
      );
    } catch (err) {
      alert('Failed to trigger notification. Please check permissions.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Tools</Text>
        <Text style={styles.subtitle}>Access all DevOps companion features</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Main Modules</Text>
        <MenuItem 
          title="Projects Tracker" 
          subtitle="Manage your side projects and time" 
          icon="📁" 
          onPress={() => navigation.navigate('Projects')} 
        />
        <MenuItem 
          title="Memory Bank" 
          subtitle="Spaced repetition learning" 
          icon="🧠" 
          onPress={() => navigation.navigate('Memory')} 
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resources</Text>
        <MenuItem 
          title="Commands Bank" 
          subtitle="Quick terminal command reference" 
          icon="⌨️" 
          onPress={() => navigation.navigate('Commands')} 
        />
        <MenuItem 
          title="Progress Reports" 
          subtitle="XP, Levels, and statistics" 
          icon="📈" 
          onPress={() => navigation.navigate('Reports')} 
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Study Tools</Text>
        <MenuItem 
          title="Focus Timer" 
          subtitle="Pomodoro focus sessions" 
          icon="⏱️" 
          onPress={() => navigation.navigate('FocusTimer')} 
        />
        <MenuItem 
          title="Habits Tracker" 
          subtitle="Build consistency daily" 
          icon="📅" 
          onPress={() => navigation.navigate('Habits')} 
        />
        <MenuItem 
          title="Study Goals" 
          subtitle="Hours target vs actual progress" 
          icon="🎯" 
          onPress={() => navigation.navigate('Goals')} 
        />
        <MenuItem 
          title="Study Plant" 
          subtitle="Gamified study partner growth" 
          icon="🌱" 
          onPress={() => navigation.navigate('StudyPlant')} 
        />
        <MenuItem 
          title="Daily Tasks" 
          subtitle="Your daily to-do checklist with AI suggestions" 
          icon="✅" 
          onPress={() => navigation.navigate('DailyTasks')} 
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coming Soon</Text>
        <MenuItem 
          title="Mock Interviews" 
          subtitle="Practice DevOps questions" 
          icon="🎤" 
          onPress={() => alert('Coming soon!')} 
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <MenuItem 
          title="Study Notifications" 
          subtitle={notifsEnabled ? 'Enabled (Tap to Disable)' : 'Disabled (Tap to Enable)'} 
          icon="🔔" 
          onPress={toggleNotifications} 
        />
        <MenuItem 
          title="Test Notification" 
          subtitle="Trigger a local notification immediately" 
          icon="🧪" 
          onPress={handleTestNotification} 
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <MenuItem 
          title="Sign Out" 
          subtitle="Log out of your account" 
          icon="🚪" 
          onPress={onLogout} 
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>DevOps Study Companion v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.xl,
    paddingTop: 40,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
    opacity: 0.8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
  },
  menuText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  menuTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  menuSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  arrow: {
    color: COLORS.textMuted,
    fontSize: 20,
    fontWeight: '300',
  },
  footer: {
    padding: SPACING.xl,
    alignItems: 'center',
    opacity: 0.5,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
