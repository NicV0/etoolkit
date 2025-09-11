import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import Header from '../../../components/layout/Header';
import SearchBar from '../../../components/ui/SearchBar';
import Card from '../../../components/ui/Card';
import { colors } from '../../../lib/theme/tokens';
// Use your existing mock data so it works in Expo Go
import { clients } from '../../../lib/data/mockClients';
import { invoices } from '../../../lib/data/mockInvoices';
import { quotes } from '../../../lib/data/mockQuotes';

export default function KitAI() {
  const [q, setQ] = useState('');
  const qq = q.trim().toLowerCase();

  const { clientMatches, invoiceMatches, quoteMatches } = useMemo(() => {
    if (!qq) return { clientMatches: [], invoiceMatches: [], quoteMatches: [] };
    return {
      clientMatches: clients.filter(c =>
        (c.name?.toLowerCase() ?? '').includes(qq) ||
        (c.email?.toLowerCase() ?? '').includes(qq)
      ),
      invoiceMatches: invoices.filter(i =>
        (i.id?.toLowerCase() ?? '').includes(qq)
      ),
      quoteMatches: quotes.filter(x =>
        (x.id?.toLowerCase() ?? '').includes(qq)
      ),
    };
  }, [qq]);

  const nothing = qq && !clientMatches.length && !invoiceMatches.length && !quoteMatches.length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="KitAI" />
      <View style={{ padding: 16 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder="Search 'acme'" />

        <Card className="mb-3" style={{ paddingVertical: 14 }}>
          <Text style={{ color: colors.text.primary }}>
            {qq ? `Searching "${q}"…` : 'Type to search clients, invoices, quotes.'}
          </Text>
          {nothing && (
            <Text style={{ color: colors.text.secondary, marginTop: 8 }}>
              No local matches (mock.)
            </Text>
          )}
        </Card>

        {!!clientMatches.length && (
          <Card className="mb-3">
            <Text style={{ color: colors.text.secondary, marginBottom: 8 }}>Clients</Text>
            {clientMatches.map(c => (
              <Text key={c.id} style={{ color: colors.text.primary, marginBottom: 6 }}>
                {c.name} — {c.email}
              </Text>
            ))}
          </Card>
        )}

        {!!invoiceMatches.length && (
          <Card className="mb-3">
            <Text style={{ color: colors.text.secondary, marginBottom: 8 }}>Invoices</Text>
            {invoiceMatches.map(i => (
              <Text key={i.id} style={{ color: colors.text.primary, marginBottom: 6 }}>
                {i.id} — ${i.total}
              </Text>
            ))}
          </Card>
        )}

        {!!quoteMatches.length && (
          <Card>
            <Text style={{ color: colors.text.secondary, marginBottom: 8 }}>Quotes</Text>
            {quoteMatches.map(x => (
              <Text key={x.id} style={{ color: colors.text.primary, marginBottom: 6 }}>
                {x.id} — ${x.total}
              </Text>
            ))}
          </Card>
        )}

        {qq ? (
          <Text style={{ color: colors.text.secondary, marginTop: 8 }}>Local search only (mock.).</Text>
        ) : null}
      </View>
    </View>
  );
}
