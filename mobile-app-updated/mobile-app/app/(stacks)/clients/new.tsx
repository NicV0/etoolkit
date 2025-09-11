import React, { useState } from 'react';
import { Text } from 'react-native';
import Screen from '../../../components/layout/Screen';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useStore } from '../../../lib/state/store';
import { useRouter } from 'expo-router';
import { tokens } from '../../../lib/theme/tokens';

/**
 * Screen for creating a new client. Collects basic contact information
 * and pushes it into the global store. Status defaults to active.
 */
export default function NewClient() {
  const { addClient } = useStore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  function handleSave() {
    addClient({ name, email, phone, address, status: 'active' });
    router.back();
  }

  return (
    <Screen>
      <Text
        style={{
          color: tokens.colors.text,
          fontSize: 28,
          fontWeight: '700',
          marginBottom: tokens.spacing.lg,
        }}
      >
        New Client
      </Text>
      <Input label="Name" value={name} onChangeText={setName} placeholder="Client name" />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Email address"
        keyboardType="email-address"
      />
      <Input
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone number"
        keyboardType="numeric"
      />
      <Input
        label="Address"
        value={address}
        onChangeText={setAddress}
        placeholder="Address"
      />
      <Button
        title="Save Client"
        onPress={handleSave}
        disabled={!name.trim()}
        style={{ marginTop: tokens.spacing.lg }}
      />
    </Screen>
  );
}