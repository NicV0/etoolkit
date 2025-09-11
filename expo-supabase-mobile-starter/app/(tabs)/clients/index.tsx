import React, { useMemo, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import Header from '../../../components/layout/Header';
import SearchBar from '../../../components/ui/SearchBar';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Link } from 'expo-router';
import { colors } from '../../../lib/theme/tokens';
import { clients as allClients } from '../../../lib/data/mockClients';

export default function Clients() {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return allClients;
    return allClients.filter(c =>
      (c.name?.toLowerCase() ?? '').includes(qq) ||
      (c.email?.toLowerCase() ?? '').includes(qq)
    );
  }, [q]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="screen.clients.list">
      <Header title="Clients" />
      <View style={{ padding: 16 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder="Search clients" />

        {/* Recent two as pill rows (like your top two list items) */}
        {filtered.slice(0, 2).map((c) => (
          <Link key={'top-' + c.id} href={`/(tabs)/clients/${c.id}`} asChild>
            <Card className="mb-3">
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text.primary, fontFamily: 'Inter_600SemiBold' }}>{c.name}</Text>
                <Text style={{ color: colors.text.secondary }}>{'›'}</Text>
              </View>
            </Card>
          </Link>
        ))}

        <Text
          style={{
            color: colors.text.primary,
            fontFamily: 'Inter_700Bold',
            fontSize: 16,
            marginTop: 4,
            marginBottom: 8,
          }}
        >
          All Clients
        </Text>

        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          renderItem={({ item: c }) => (
            <Link href={`/(tabs)/clients/${c.id}`} asChild>
              <Card className="mb-3">
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ color: colors.text.primary, fontFamily: 'Inter_600SemiBold' }}>{c.name}</Text>
                    <Text style={{ color: colors.text.secondary, marginTop: 4 }}>{c.email}</Text>
                  </View>
                  <Badge status="active" />
                </View>
              </Card>
            </Link>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
          initialNumToRender={10}
          windowSize={7}
          removeClippedSubviews
        />
      </View>
    </View>
  );
}
