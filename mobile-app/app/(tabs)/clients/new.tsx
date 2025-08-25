import React, { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Header } from '../../../components/layout/Header';
import { colors } from '../../../lib/theme/tokens';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export default function NewClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <Header title="New Client" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Input label="Name" value={name} onChangeText={setName} />
        <Input label="Email" value={email} onChangeText={setEmail} />
        <Button title="Save" onPress={() => Alert.alert('Saved (mock)')} />
      </ScrollView>
    </View>
  );
}