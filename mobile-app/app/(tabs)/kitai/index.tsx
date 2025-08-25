import React, { useState } from 'react';
import { ScrollView, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Header } from '../../../components/layout/Header';
import { colors } from '../../../lib/theme/tokens';
import { SearchBar } from '../../../components/ui/SearchBar';
import { useClientSearch } from '../../../lib/hooks/useClientSearch';
import { Card } from '../../../components/ui/Card';

import { Screen } from '../../../components/layout/Screen';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
export default function KitAI() {
  const [q, setQ] = useState('');
  const results = useClientSearch(q);
  return (
    <Screen>
      <Header title="KitAI" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder="Ask about clients, quotes..." />
        {q ? (
          <Card>
            <Text style={{ color: colors.text, fontFamily: 'Inter_600SemiBold' }}>
              Searching "{q}"...
            </Text>
            {results.length === 0 ? (
              <Text style={{ color: colors.textMuted, marginTop: 8 }}>No local matches (mock).</Text>
            ) : (
              <View className="mt-2">
                {results.map((r) => (
                  <Text key={r.id} style={{ color: colors.textMuted, marginTop: 4 }}>
                    {r.name} — {r.email}
                  </Text>
                ))}
              </Screen>
            )}
          </Card>
        ) : (
          <Text style={{ color: colors.textMuted }}>
            Try: "Show Acme Plumbing invoices", "Create quick quote for Green Leaf".
          </Text>
        )}
      </ScrollView>
<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
  <View style={{ padding: 16, gap: 8, flexDirection: 'row' }}>
    <View style={{ flex: 1 }}>
      <Input placeholder="Ask KitAI…" value={q} onChangeText={setQ} />
    </View>
    <Button title="Send" onPress={() => {}} variant="primary" />
  </View>
</KeyboardAvoidingView>

    </Screen>
  );
}