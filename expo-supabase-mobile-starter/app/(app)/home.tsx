import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function Home() {
  const { user } = useAuth()

  async function onSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Text style={{ fontSize: 20 }}>Hello {user?.email ?? 'there'} 👋</Text>
      <Pressable onPress={onSignOut} style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}>
        <Text>Sign out</Text>
      </Pressable>
    </View>
  )
}
