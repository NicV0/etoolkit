import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';

// Components
import {
  Screen,
  Input,
  Button,
} from '../../../components/ui';

// Hooks
import { useClients } from '../../../lib/state/simpleStore';

// Theme
import { theme } from '../../../lib/theme/tokens';

/**
 * Screen for creating a new client. Collects basic contact information
 * and saves it to the store.
 */
export default function NewClient() {
  const { addClient } = useClients();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  function handleSave() {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a client name');
      return;
    }

    addClient({ 
      name: name.trim(), 
      email: email.trim() || undefined, 
      phone: phone.trim() || undefined, 
      address: address.trim() || undefined, 
      status: 'active' 
    });
    
    Alert.alert('Success', 'Client created successfully', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  }

  return (
    <Screen>
      <Text style={styles.title}>
        New Client
      </Text>
      
      <Input
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="Client name"
      />
      
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
        keyboardType="phone-pad"
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
        style={styles.saveButton}
      />
    </Screen>
  );
}

const styles = {
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.lg,
  },
  saveButton: {
    marginTop: theme.spacing.lg,
  },
};
