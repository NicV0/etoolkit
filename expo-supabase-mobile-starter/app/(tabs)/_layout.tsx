import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, FileText, Receipt } from 'lucide-react-native';
import { theme } from '../../lib/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {


          backgroundColor: theme.semantic.colors.background.base as any,
          borderTopColor: theme.semantic.colors.border.subtle as any,
          borderTopWidth: 1,
          height: 88, // Increased height for better touch targets


          paddingBottom: theme.semantic.spacing.xs,
          paddingTop: theme.semantic.spacing.xs,
        },


        tabBarActiveTintColor: theme.semantic.colors.accent.primary as any,
        tabBarInactiveTintColor: theme.semantic.colors.text.secondary as any,
        tabBarLabelStyle: {



          fontSize: theme.semantic.type.meta,
          fontWeight: theme.semantic.type.weight.semibold as any,
          marginTop: theme.semantic.spacing.xs / 2,
        },
        tabBarIconStyle: {

          marginBottom: theme.semantic.spacing.xs / 4,
        },
      }}
    >
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: 'Dashboard', 

          tabBarIcon: ({ color }) => <Home color={color as string} size={theme.iconSizes.xl} /> 
        }} 
      />
      <Tabs.Screen 
        name="clients" 
        options={{ 
          title: 'Clients', 

          tabBarIcon: ({ color }) => <Users color={color as string} size={theme.iconSizes.xl} /> 
        }} 
      />
      <Tabs.Screen 
        name="documents" 
        options={{ 
          title: 'Documents', 
          tabBarLabel: 'Documents',

          tabBarIcon: ({ color }) => <FileText color={color as string} size={theme.iconSizes.xl} /> 
        }} 
      />
      <Tabs.Screen 
        name="billing" 
        options={{ 
          title: 'Billing', 

          tabBarIcon: ({ color }) => <Receipt color={color as string} size={theme.iconSizes.xl} /> 
        }} 
      />
    </Tabs>
  );
}
