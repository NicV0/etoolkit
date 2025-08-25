import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, Sparkles, Receipt } from 'lucide-react-native';
import { colors } from '../../lib/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarIcon: (props) => <Home {...props} /> }}
      />
      <Tabs.Screen
        name="clients"
        options={{ title: 'Clients', tabBarIcon: (props) => <Users {...props} /> }}
      />
      <Tabs.Screen
        name="kitai"
        options={{ title: 'KitAI', tabBarIcon: (props) => <Sparkles {...props} /> }}
      />
      <Tabs.Screen
        name="billing"
        options={{ title: 'Billing', tabBarIcon: (props) => <Receipt {...props} /> }}
      />
    </Tabs>
  );
}