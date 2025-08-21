import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { Link } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/Button'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { setSession } = useAuth()

  async function onSignIn() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return Alert.alert('Sign in failed', error.message)
    setSession(data.session ?? null)
  }

  async function onSignUp() {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return Alert.alert('Sign up failed', error.message)
    Alert.alert('Check your email to confirm.')
    setSession(data.session ?? null)
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: '600' }}>Welcome</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
      />
      <Button label="Sign in" onPress={onSignIn} />
      <Button label="Create account" variant="secondary" onPress={onSignUp} />
      <Link href="/(auth)/magic-link">Use magic link</Link>
    </View>
  )
}
