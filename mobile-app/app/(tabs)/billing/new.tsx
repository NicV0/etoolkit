import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Header } from '../../../components/layout/Header';
import { colors } from '../../../lib/theme/tokens';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useRouter } from 'expo-router';

export default function NewInvoice() {
  const [client, setClient] = useState('Acme Plumbing');
  const [total, setTotal] = useState('$1,500.00');
  const invoiceNo = 'INV-1024';
  const router = useRouter();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <Header title="New Invoice" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Input label="Client" value={client} onChangeText={setClient} />
        <Input label="Total" value={total} onChangeText={setTotal} />
        <Button
          title="Preview PDF"
          onPress={() =>
            router.push({
              pathname: '/(tabs)/billing/preview',
              params: { client, total, invoiceNo },
            })
          }
          className="mt-4"
        />
      </ScrollView>
    </View>
  );
}