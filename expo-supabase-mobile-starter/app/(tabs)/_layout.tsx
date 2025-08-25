import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, Sparkles, Receipt } from 'lucide-react-native';
import { theme } from '../../lib/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 88, // Increased height for better touch targets
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.caption,
          fontWeight: theme.typography.fontWeight.semibold,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: 'Dashboard', 
          tabBarIcon: ({ color }) => <Home color={color} size={24} /> 
        }} 
      />
      <Tabs.Screen 
        name="clients" 
        options={{ 
          title: 'Clients', 
          tabBarIcon: ({ color }) => <Users color={color} size={24} /> 
        }} 
      />
      <Tabs.Screen 
        name="kitai" 
        options={{ 
          title: 'KitAI', 
          tabBarIcon: ({ color }) => <Sparkles color={color} size={24} /> 
        }} 
      />
      <Tabs.Screen 
        name="billing" 
        options={{ 
          title: 'Billing', 
          tabBarIcon: ({ color }) => <Receipt color={color} size={24} /> 
        }} 
      />
    </Tabs>
  );
}
