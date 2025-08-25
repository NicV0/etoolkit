import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Header } from '../../../components/layout/Header';
import { theme } from '../../../lib/theme/tokens';
import { useLocalSearchParams } from 'expo-router';
import { clients } from '../../../lib/data/mockClients';
import { Card } from '../../../components/ui/Card';

export default function ClientDetail() {
  const { id } = useLocalSearchParams<{id: string}>();
  const client = clients.find(c => c.id === id);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Header title={client?.name ?? 'Client'} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={{ marginBottom: 12 }}>
          <Text style={{ color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }}>Email</Text>
          <Text style={{ color: theme.colors.text.muted }}>{client?.email}</Text>
        </Card>
        <Card>
          <Text style={{ color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold' }}>Status</Text>
          <Text style={{ color: theme.colors.text.muted }}>{client?.status}</Text>
        </Card>
      </ScrollView>
    </View>
  );
}
