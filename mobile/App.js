import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Text } from 'react-native';

import { COLORS } from './src/theme';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import EntriesScreen from './src/screens/EntriesScreen';
import LabsScreen from './src/screens/LabsScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import MemoryScreen from './src/screens/MemoryScreen';
import CommandsScreen from './src/screens/CommandsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import MoreScreen from './src/screens/MoreScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Sub-stacks for screens accessible from "More"
function ToolsStack() {
  return (
    <Stack.Navigator screenOptions={{ 
      headerStyle: { backgroundColor: COLORS.card },
      headerTintColor: COLORS.text,
      headerTitleStyle: { fontWeight: '800' }
    }}>
      <Stack.Screen name="Menu" component={MoreScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Projects" component={ProjectsScreen} />
      <Stack.Screen name="Memory" component={MemoryScreen} />
      <Stack.Screen name="Commands" component={CommandsScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
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
        component={ToolsStack}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>➕</Text>,
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check for saved user session here if needed
    setInitializing(false);
  }, []);

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
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={setUser} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
