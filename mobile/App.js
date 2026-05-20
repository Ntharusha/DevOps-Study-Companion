import { registerRootComponent } from 'expo';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Text } from 'react-native';

import { COLORS } from './src/theme';
import { getObject, setItem, removeItem, StorageKeys } from './src/utils/storage';
import { initDB } from './src/utils/offlineStorage';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import EntriesScreen from './src/screens/EntriesScreen';
import LabsScreen from './src/screens/LabsScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import MemoryScreen from './src/screens/MemoryScreen';
import CommandsScreen from './src/screens/CommandsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import MoreScreen from './src/screens/MoreScreen';
import FocusTimerScreen from './src/screens/FocusTimerScreen';
import HabitsScreen from './src/screens/HabitsScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import StudyPlantScreen from './src/screens/StudyPlantScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Sub-stacks for screens accessible from "More"
function ToolsStack({ onLogout }) {
  return (
    <Stack.Navigator screenOptions={{ 
      headerStyle: { backgroundColor: COLORS.card },
      headerTintColor: COLORS.text,
      headerTitleStyle: { fontWeight: '800' }
    }}>
      <Stack.Screen name="Menu" options={{ headerShown: false }}>
        {(props) => <MoreScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="Projects" component={ProjectsScreen} />
      <Stack.Screen name="Memory" component={MemoryScreen} />
      <Stack.Screen name="Commands" component={CommandsScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="FocusTimer" component={FocusTimerScreen} options={{ title: 'Focus Timer' }} />
      <Stack.Screen name="Habits" component={HabitsScreen} options={{ title: 'Habits Tracker' }} />
      <Stack.Screen name="Goals" component={GoalsScreen} options={{ title: 'Weekly Goals' }} />
      <Stack.Screen name="StudyPlant" component={StudyPlantScreen} options={{ title: 'Study Plant' }} />
    </Stack.Navigator>
  );
}

function TabNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.card },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '800' },
        tabBarStyle: { 
          backgroundColor: COLORS.card, 
          borderTopColor: COLORS.border,
          height: 70,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📊</Text>
        }}
      />
      <Tab.Screen
        name="Entries"
        component={EntriesScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📝</Text>
        }}
      />
      <Tab.Screen
        name="Labs"
        component={LabsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>🧪</Text>
        }}
      />
      <Tab.Screen
        name="More"
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>➕</Text>,
          headerShown: false
        }}
      >
        {(props) => <ToolsStack {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check for saved user session on app start
    let savedUser = getObject(StorageKeys.USER_SESSION);
    if (!savedUser) {
      // Auto-initialize offline session for a completely standalone offline experience
      savedUser = {
        username: 'ghost69',
        token: 'simple-auth-token-offline-mode',
        offline: true,
      };
      setItem(StorageKeys.USER_SESSION, savedUser);
    }

    if (savedUser.offline) {
      initDB(); // Seed local DB
    }

    setUser(savedUser);
    setInitializing(false);
  }, []);

  const handleLogin = (userData) => {
    if (userData.offline) {
      initDB(); // Seed local DB
    }
    setUser(userData);
    setItem(StorageKeys.USER_SESSION, userData);
  };

  const handleLogout = () => {
    setUser(null);
    removeItem(StorageKeys.USER_SESSION);
  };

  if (initializing) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>

          </>
        ) : (
          <Stack.Screen name="Main">
            {(props) => <TabNavigator {...props} onLogout={handleLogout} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

registerRootComponent(App);
