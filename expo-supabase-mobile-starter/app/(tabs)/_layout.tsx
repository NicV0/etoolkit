import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from 'react-native';

export default function TabLayout() {
  const { isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderTopColor: isDark ? '#374151' : '#e5e7eb',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: isDark ? '#fb923c' : '#f97316',
        tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>👥</Text>,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="kitai"
        options={{
          title: 'KitAI',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>✨</Text>,
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: 'Billing',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>🧾</Text>,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>📄</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>⚙️</Text>,
        }}
      />
      {/* Hide nested screens to avoid conflicts */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
