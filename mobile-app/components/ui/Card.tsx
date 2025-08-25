import React from 'react';
import { Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radii } from '../../lib/theme/tokens';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={20}
        tint="dark"
        className={`rounded-2xl overflow-hidden ${className ?? ''}`}
      >
        <View
          className="px-4 py-4"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radii.lg,
          }}
        >
          {children}
        </View>
      </BlurView>
    );
  }
  return (
    <View
      className={`rounded-2xl border px-4 py-4 ${className ?? ''}`}
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      {children}
    </View>
  );
}