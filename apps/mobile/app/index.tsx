import { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Index() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'etoolkit://auth-callback' },
    });
    if (!error) setSent(true);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      {sent ? (
        <Text>Check your email for a magic link.</Text>
      ) : (
        <>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
          />
          <Button title="Sign In" onPress={signIn} />
        </>
      )}
    </View>
  );
}
