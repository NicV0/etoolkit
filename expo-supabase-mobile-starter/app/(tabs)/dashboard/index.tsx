import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Header from '../../../components/layout/Header';
import Card from '../../../components/ui/Card';
import { colors } from '../../../lib/theme/tokens';
// If you have a store, import real data; otherwise keep your mocks.
import { invoices } from '../../../lib/data/mockInvoices';
import { quotes } from '../../../lib/data/mockQuotes';

export default function Dashboard() {
  // Derived stats to drive the cards
  const accountsReceivable = invoices
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + (i.total ?? 0), 0);

  const openQuotes = quotes.filter(q => q.status === 'open').length;

  // Example activity (swap for your real list)
  const recent = [
    { title: 'John Smith', subtitle: 'office@acme.plumb.com' },
    { title: 'Green Leaf HVAC', subtitle: 'hello@greenleafhvac.com' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="screen.dashboard">
      <Header title="Dashboard" subtitle="Welcome back! Here's what's happening today." />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Accounts Receivable */}
        <Card className="mb-3" style={{ paddingVertical: 16 }}>
          <Text style={{ color: colors.text.secondary, fontFamily: 'Inter_600SemiBold' }}>
            Accounts Receivable
          </Text>
          <Text
            style={{
              color: colors.text.primary,
              fontFamily: 'Inter_800ExtraBold',
              fontSize: 28,
              marginTop: 6,
            }}
          >
            ${accountsReceivable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          <Text style={{ color: colors.text.secondary, marginTop: 2 }}>
            Unpaid balances on invoices
          </Text>
        </Card>

        {/* Open Quotes */}
        <Card className="mb-3" style={{ paddingVertical: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: colors.text.secondary, fontFamily: 'Inter_600SemiBold' }}>
                Open Quotes
              </Text>
              <Text
                style={{
                  color: colors.text.primary,
                  fontFamily: 'Inter_800ExtraBold',
                  fontSize: 22,
                  marginTop: 6,
                }}
              >
                {openQuotes}
              </Text>
              <Text style={{ color: colors.text.secondary, marginTop: 2 }}>
                Awaiting client approval
              </Text>
            </View>
          </View>
        </Card>

        {/* Recent Activity */}
        <Text
          style={{
            color: colors.text.primary,
            fontFamily: 'Inter_700Bold',
            fontSize: 16,
            marginTop: 4,
            marginBottom: 8,
          }}
        >
          Recent Activity
        </Text>

        {recent.map((r, i) => (
          <Card key={i} className="mb-3">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: colors.text.primary, fontFamily: 'Inter_600SemiBold' }}>{r.title}</Text>
                <Text style={{ color: colors.text.secondary, marginTop: 4 }}>{r.subtitle}</Text>
              </View>
              <Text style={{ color: colors.text.secondary }}>{'›'}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
