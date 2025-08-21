import React from 'react'
import { Redirect } from 'expo-router'
import { useAuth } from '../hooks/useAuth'

export default function Index() {
  const { session, isLoading } = useAuth()

  if (isLoading) return null
  
  // TEMPORARY: Bypass authentication for testing
  // TODO: Remove this bypass once authentication is working
  return <Redirect href="/(tabs)" />
  
  // Original code (uncomment when auth is working):
  // return <Redirect href={session ? '/(app)/home' : '/(auth)/sign-in'} />
}
