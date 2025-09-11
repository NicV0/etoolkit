import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Screen from '../../../components/layout/Screen';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useStore } from '../../../lib/state/store';
import { useRouter } from 'expo-router';
import { tokens } from '../../../lib/theme/tokens';

/**
 * Screen for building a new quote. Users select a client, add line items
 * with quantity and price and save the quote. The total is computed
 * automatically from the line items.
 */
export default function NewQuote() {
  const { clients, createQuote } = useStore();
  const router = useRouter();
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<Array<{ desc: string; qty: string; price: string }>>([
    { desc: '', qty: '', price: '' },
  ]);

  function addItem() {
    setItems([...items, { desc: '', qty: '', price: '' }]);
  }

  function updateItem(index: number, field: 'desc' | 'qty' | 'price', value: string) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function handleSave() {
    const parsedItems = items.map(item => ({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      description: item.desc,
      qty: parseInt(item.qty) || 0,
      price: parseFloat(item.price) || 0,
    }));
    const total = parsedItems.reduce((sum, item) => sum + item.qty * item.price, 0);
    createQuote({ clientId, total, status: 'open', items: parsedItems });
    router.back();
  }

  const canSave = clientId && items.every(item => item.desc && item.qty && item.price);

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
        New Quote
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
      {items.map((item, index) => (
        <View key={index} style={{ marginBottom: tokens.spacing.md }}>
          <Input
            label={`Item ${index + 1} Description`}
            value={item.desc}
            onChangeText={val => updateItem(index, 'desc', val)}
            placeholder="Description"
          />
          <Input
            label="Qty"
            value={item.qty}
            onChangeText={val => updateItem(index, 'qty', val)}
            placeholder="1"
            keyboardType="numeric"
          />
          <Input
            label="Price"
            value={item.price}
            onChangeText={val => updateItem(index, 'price', val)}
            placeholder="0.00"
            keyboardType="numeric"
          />
        </View>
      ))}
      <Button
        title="Add Line Item"
        onPress={addItem}
        variant="secondary"
        style={{ marginBottom: tokens.spacing.md }}
      />
      <Button
        title="Save Quote"
        onPress={handleSave}
        disabled={!canSave}
      />
    </Screen>
  );
}