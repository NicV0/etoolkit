import React from 'react';
import { View, Text, FlatList } from 'react-native';
import Screen from '../../../components/layout/Screen';
import Card from '../../../components/ui/Card';
import { useStore } from '../../../lib/state/store';
import { tokens } from '../../../lib/theme/tokens';

/**
 * The dashboard provides a high level overview of your business. It
 * summarises outstanding receivables, open quotes and shows a small
 * feed of recent activity pulled from clients, invoices and quotes.
 */
export default function Dashboard() {
  const { clients, invoices, quotes } = useStore();

  // Calculate outstanding receivables from unpaid and overdue invoices
  const receivable = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  // Count open quotes awaiting approval
  const openQuotes = quotes.filter(q => q.status === 'open').length;

  // Create a unified activity feed sorted by creation date
  const recentActivity = [
    ...clients.map(c => ({ type: 'Client', id: c.id, name: c.name, date: c.createdAt })),
    ...invoices.map(i => ({ type: 'Invoice', id: i.id, name: `INV-${i.id}`, date: i.createdAt })),
    ...quotes.map(q => ({ type: 'Quote', id: q.id, name: `QUOTE-${q.id}`, date: q.createdAt })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  return (
    <Screen>
      <Text
        style={{
          color: tokens.colors.text,
          fontSize: 32,
          fontWeight: '700',
          marginBottom: tokens.spacing.md,
        }}
      >
        Dashboard
      </Text>
      <Text
        style={{
          color: '#A1A1AA',
          fontSize: 14,
          marginBottom: tokens.spacing.lg,
        }}
      >
        Welcome back! Here's what's happening today.
      </Text>
      {/* KPI cards */}
      <View style={{ flexDirection: 'row', marginBottom: tokens.spacing.lg }}>
        <Card style={{ flex: 1, marginRight: tokens.spacing.md }}>
          <Text style={{ color: '#A1A1AA', fontSize: 14, marginBottom: tokens.spacing.sm }}>
            Accounts Receivable
          </Text>
          <Text style={{ color: tokens.colors.text, fontSize: 24, fontWeight: '700' }}>
            ${receivable.toFixed(2)}
          </Text>
          <Text style={{ color: '#71717A', fontSize: 12 }}>Unpaid balances on invoices</Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={{ color: '#A1A1AA', fontSize: 14, marginBottom: tokens.spacing.sm }}>
            Open Quotes
          </Text>
          <Text style={{ color: tokens.colors.text, fontSize: 24, fontWeight: '700' }}>{openQuotes}</Text>
          <Text style={{ color: '#71717A', fontSize: 12 }}>Awaiting client approval</Text>
        </Card>
      </View>
      <Text
        style={{
          color: tokens.colors.text,
          fontSize: 20,
          fontWeight: '600',
          marginBottom: tokens.spacing.md,
        }}
      >
        Recent Activity
      </Text>
      <FlatList
        data={recentActivity}
        keyExtractor={item => item.type + item.id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: tokens.spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: tokens.colors.border,
            }}
          >
            <Text style={{ color: tokens.colors.text, fontSize: 16 }}>{item.name}</Text>
            <Text style={{ color: '#71717A', fontSize: 12 }}>{item.type}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: '#71717A', fontSize: 14, marginTop: tokens.spacing.lg }}>
            No recent activity
          </Text>
        }
      />
    </Screen>
  );
}