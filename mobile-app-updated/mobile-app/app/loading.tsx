import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { theme } from '@theme/tokens'; // ← single source of truth (semantic + base)

// Optional: put your neon tools PNG/SVG in assets/ and uncomment <Image> below
// import SplashMark from '@/assets/splash-mark.png';

export default function Loading() {
  return (
    <View
      testID="screen.loading"
      accessibilityRole="status"
      accessibilityLabel="Loading"
      style={styles.container}
    >
      {/* Logo area (either spinner or your splash mark) */}
      {/* <Image source={SplashMark} style={styles.logo} resizeMode="contain" /> */}
      <ActivityIndicator
        testID="spinner"
        color={theme.semantic.colors.accent.primary}
        size="large"
        style={styles.spinner}
      />

      <Text testID="text.title" style={styles.title}>
        Preparing your tools…
      </Text>

      <Text testID="text.subtitle" style={styles.subtitle}>
        Loading resources
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.semantic.colors.background.base,
    padding: theme.semantic.spacing.lg,
  },
  // If using an image logo, size it around 30–40% of screen width in practice.
  logo: {
    width: 128,
    height: 128,
    marginBottom: theme.semantic.spacing.md,
  },
  spinner: {
    marginBottom: theme.semantic.spacing.md,
  },
  title: {
    color: theme.semantic.colors.accent.primary,
    // Use your typography aliases; keep it consistent with the app:
    fontSize: theme.semantic.typography.titleXL.size, // e.g., 28–32
    fontFamily: theme.semantic.typography.family.primary,
    fontWeight: theme.semantic.typography.weight.semibold,
    marginBottom: theme.semantic.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.semantic.colors.text.secondary,
    fontSize: theme.semantic.typography.body.size, // e.g., 16
    fontFamily: theme.semantic.typography.family.primary,
    textAlign: 'center',
  },
});
