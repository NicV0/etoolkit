import React from 'react'
import { Stack } from 'expo-router'
import { AuthProvider } from '../hooks/useAuth'
import { ThemeProvider } from '../theme/ThemeProvider'

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </ThemeProvider>
  )
}
