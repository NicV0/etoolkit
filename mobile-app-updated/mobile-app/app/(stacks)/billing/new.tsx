import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Screen from '../../../components/layout/Screen';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useStore } from '../../../lib/state/store';
import { useRouter } from 'expo-router';
import { tokens } from '../../../lib/theme/tokens';

/**
 * Screen for creating a new invoice. Users can select a client, enter
 * a total amount and save the invoice. In a more advanced version this
 * could include line items and due dates.
 */
export default function NewInvoice() {
  const { clients, createInvoice } = useStore();
  const router = useRouter();
  const [clientId, setClientId] = useState('');
  const [total, setTotal] = useState('');

  function handleSave() {
    const amount = parseFloat(total) || 0;
    createInvoice({ clientId, total: amount, status: 'unpaid', dueDate: new Date(), items: [] });
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
        New Invoice
      </Text>
      <Text style={{ color: tokens.colors.text, fontSize: 16, marginBottom: tokens.spacing.sm }}>
        Select Client
      </Text>
      {clients.length === 0 && (
        <Text style={{ color: '#71717A', marginBottom: tokens.spacing.md }}>
          No clients available
        </Text>
      )}
      {clients.map(c => (
        <TouchableOpacity
          key={c.id}
          onPress={() => setClientId(c.id)}
          style={{ paddingVertical: tokens.spacing.sm }}
        >
          <Text style={{ color: tokens.colors.text, fontSize: 16 }}>
            {c.name}
            {clientId === c.id ? ' \u2713' : ''}
          </Text>
        </TouchableOpacity>
      ))}
      <Input
        label="Total Amount"
        value={total}
        onChangeText={setTotal}
        placeholder="0.00"
        keyboardType="numeric"
      />
      <Button
        title="Save Invoice"
        onPress={handleSave}
        disabled={!clientId || !total}
        style={{ marginTop: tokens.spacing.lg }}
      />
    </Screen>
  );
}