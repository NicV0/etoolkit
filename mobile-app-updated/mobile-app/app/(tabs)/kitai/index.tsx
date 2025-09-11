import React, { useState, useMemo } from 'react';
import { View, Text } from 'react-native';
import Screen from '../../../components/layout/Screen';
import SearchBar from '../../../components/ui/SearchBar';
import Card from '../../../components/ui/Card';
import { useStore } from '../../../lib/state/store';
import { tokens } from '../../../lib/theme/tokens';

/**
 * The KitAI screen performs a simple local search across clients,
 * invoices and quotes. It demonstrates an extensible pattern for
 * connecting to an AI service once available. Currently the search
 * results are generated on the client device for privacy and speed.
 */
export default function KitAI() {
  const { clients, invoices, quotes } = useStore();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    const clientHits = clients
      .filter(c => c.name.toLowerCase().includes(lower))
      .map(c => ({ type: 'Client', id: c.id, text: c.name }));
    const invoiceHits = invoices
      .filter(i => `inv-${i.id}`.toLowerCase().includes(lower))
      .map(i => ({ type: 'Invoice', id: i.id, text: `INV-${i.id}` }));
    const quoteHits = quotes
      .filter(q => `quote-${q.id}`.toLowerCase().includes(lower))
      .map(q => ({ type: 'Quote', id: q.id, text: `QUOTE-${q.id}` }));
    return [...clientHits, ...invoiceHits, ...quoteHits];
  }, [query, clients, invoices, quotes]);

  return (
    <Screen>
      <Text
        style={{
          color: tokens.colors.text,
          fontSize: 32,
          fontWeight: '700',
          marginBottom: tokens.spacing.lg,
        }}
      >
        KitAI
      </Text>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search clients, invoices, quotes"
      />
      {query.trim().length > 0 && (
        <Card style={{ marginTop: tokens.spacing.lg }}>
          <Text style={{ color: '#71717A', fontSize: 14, marginBottom: tokens.spacing.sm }}>
            Searching "{query}"…
          </Text>
          {results.length === 0 ? (
            <Text style={{ color: '#71717A', fontSize: 14 }}>No local matches.</Text>
          ) : (
            results.map(item => (
              <View
                key={`${item.type}-${item.id}`}
                style={{
                  paddingVertical: tokens.spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: tokens.colors.border,
                }}
              >
                <Text style={{ color: tokens.colors.text, fontSize: 16 }}>{item.text}</Text>
                <Text style={{ color: '#71717A', fontSize: 12 }}>{item.type}</Text>
              </View>
            ))
          )}
        </Card>
      )}
      <Text style={{ color: '#71717A', fontSize: 14, marginTop: tokens.spacing.md }}>
        Local search only. AI integration coming soon.
      </Text>
    </Screen>
  );
}