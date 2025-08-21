import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { supabase } from '../../lib/supabase'

export default function MagicLink() {
  const [email, setEmail] = useState('')

  async function onSend() {
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: 'etoolkit://auth'
      }
    })
    if (error) return Alert.alert('Failed', error.message)
    Alert.alert('Magic link sent. Check your email.')
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Magic link</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
      />
      <Pressable onPress={onSend} style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}>
        <Text>Send link</Text>
      </Pressable>
    </View>
  )
}
