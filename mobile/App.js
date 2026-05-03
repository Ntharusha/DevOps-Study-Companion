import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Text } from 'react-native';

import { COLORS } from './src/theme';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder screens for other features (to be implemented)
const EntriesScreen = () => <View style={{flex:1, backgroundColor: COLORS.background}} />;
const LabsScreen = () => <View style={{flex:1, backgroundColor: COLORS.background}} />;
const ProjectsScreen = () => <View style={{flex:1, backgroundColor: COLORS.background}} />;
const MemoryScreen = () => <View style={{flex:1, backgroundColor: COLORS.background}} />;

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.card },
        headerTintColor: COLORS.text,
        tabBarStyle: { backgroundColor: COLORS.card, borderTopColor: COLORS.border },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color }) => <View style={{width: 20, height: 20, backgroundColor: color}} />
        }}
      />
      <Tab.Screen 
        name="Entries" 
        component={EntriesScreen} 
        options={{
          tabBarIcon: ({ color }) => <View style={{width: 20, height: 20, backgroundColor: color}} />
        }}
      />
      <Tab.Screen 
        name="Labs" 
        component={LabsScreen} 
        options={{
          tabBarIcon: ({ color }) => <View style={{width: 20, height: 20, backgroundColor: color}} />
        }}
      />
      <Tab.Screen 
        name="Projects" 
        component={ProjectsScreen} 
        options={{
          tabBarIcon: ({ color }) => <View style={{width: 20, height: 20, backgroundColor: color}} />
        }}
      />
      <Tab.Screen 
        name="Memory" 
        component={MemoryScreen} 
        options={{
          tabBarIcon: ({ color }) => <View style={{width: 20, height: 20, backgroundColor: color}} />
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
