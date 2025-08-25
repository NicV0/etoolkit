import React from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../../lib/theme/tokens';
import { Settings } from 'lucide-react-native';
import { Link } from 'expo-router';

export function Header({ title, showSettings=false }: { title: string; showSettings?: boolean }) {
  const Content = (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text style={{ color: theme.colors.text.primary, fontFamily: 'Inter_700Bold', fontSize: 28 }}>{title}</Text>
      {showSettings ? (
        <Link href="/(tabs)/dashboard/settings" asChild>
          <TouchableOpacity accessibilityRole="button">
            <Settings color={theme.colors.text.primary} size={22} />
          </TouchableOpacity>
        </Link>
      ) : <View />}
    </View>
  );
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={24} tint="dark" className="w-full">
        <View style={{ borderBottomColor: theme.colors.border, borderBottomWidth: 1 }}>{Content}</View>
      </BlurView>
    );
  }
  return (
    <View style={{ backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border, borderBottomWidth: 1 }}>
      {Content}
    </View>
  );
}
