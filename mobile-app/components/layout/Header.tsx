import React from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../../lib/theme/tokens';
import { Settings } from 'lucide-react-native';
import { Link } from 'expo-router';

export function Header({ title, showSettings = false }: { title: string; showSettings?: boolean }) {
  const content = (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text
        style={{ color: colors.text, fontFamily: 'Inter_700Bold', fontSize: 28 }}
      >
        {title}
      </Text>
      {showSettings ? (
        <Link href="/(tabs)/dashboard/settings" asChild>
          <TouchableOpacity accessibilityRole="button">
            <Settings color={colors.text} size={22} />
          </TouchableOpacity>
        </Link>
      ) : (
        <View />
      )}
    </View>
  );
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={24} tint="dark" className="w-full">
        <View style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}>{content}</View>
      </BlurView>
    );
  }
  return (
    <View
      style={{ backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 }}
    >
      {content}
    </View>
  );
}