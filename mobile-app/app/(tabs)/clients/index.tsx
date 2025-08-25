import React, { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Header } from '../../../components/layout/Header';
import { colors } from '../../../lib/theme/tokens';
import { SearchBar } from '../../../components/ui/SearchBar';
import { useClientSearch } from '../../../lib/hooks/useClientSearch';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Link } from 'expo-router';
import { Button } from '../../../components/ui/Button';

import { Screen } from '../../../components/layout/Screen';
export default function Clients() {
  const [q, setQ] = useState('');
  const filtered = useClientSearch(q);

  return (
    <Screen>
      <Header title="Clients" />
      <View style={{ padding: 16 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder="Search clients" />
        <Link href="/(tabs)/clients/new" asChild>
          <Button title="New Client" onPress={() => {}} className="mb-4" />
        </Link>
        {filtered.map((c) => (
          <Link key={c.id} href={`/(tabs)/clients/${c.id}`} asChild>
            <Card className="mb-3">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text
                    style={{ color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 16 }}
                  >
                    {c.name}
                  </Text>
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontFamily: 'Inter_400Regular',
                      marginTop: 4,
                    }}
                  >
                    {c.email}
                  </Text>
                </Screen>
                <Badge text={c.status} color={c.status === 'active' ? 'green' : 'yellow'} />
              </Screen>
            </Card>
          </Link>
        ))}
      </View>
    </Screen>
  );
}