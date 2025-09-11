import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import Screen from '../../../components/layout/Screen';
import SearchBar from '../../../components/ui/SearchBar';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { useStore } from '../../../lib/state/store';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { tokens } from '../../../lib/theme/tokens';

/**
 * The clients screen lists all clients and allows users to search, filter
 * and create new clients. Each row displays the name, optional email
 * address and a status badge.
 */
export default function Clients() {
  const { clients } = useStore();
  const [query, setQuery] = useState('');
  const router = useRouter();
  // Filter clients by the search query
  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: tokens.spacing.lg,
        }}
      >
        <Text
          style={{
            color: tokens.colors.text,
            fontSize: 32,
            fontWeight: '700',
            flex: 1,
          }}
        >
          Clients
        </Text>
        <Button
          title="New Client"
          onPress={() => router.push('/(stacks)/clients/new')}
          icon={<Plus color={tokens.colors.text} size={16} />}
        />
      </View>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search clients"
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        style={{ marginTop: tokens.spacing.lg }}
        renderItem={({ item }) => (
          <Card
            style={{
              marginBottom: tokens.spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text
                style={{
                  color: tokens.colors.text,
                  fontSize: 18,
                  fontWeight: '600',
                }}
              >
                {item.name}
              </Text>
              {item.email && (
                <Text style={{ color: '#71717A', fontSize: 14 }}>{item.email}</Text>
              )}
            </View>
            <Badge status={item.status} />
          </Card>
        )}
        ListEmptyComponent={
          <Text
            style={{
              color: '#71717A',
              fontSize: 14,
              marginTop: tokens.spacing.lg,
              textAlign: 'center',
            }}
          >
            No clients found
          </Text>
        }
      />
    </Screen>
  );
}