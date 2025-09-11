import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import Screen from '../../../components/layout/Screen';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { useStore } from '../../../lib/state/store';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { tokens } from '../../../lib/theme/tokens';

const FILTERS = ['all', 'unpaid', 'overdue', 'paid'] as const;
type Filter = typeof FILTERS[number];

/**
 * Billing screen displays invoices with filtering and a button to create
 * new invoices. Totals for each status are summarised at the top and
 * each invoice can be marked paid from this list.
 */
export default function Billing() {
  const { invoices, markInvoicePaid } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const router = useRouter();

  const filtered = invoices.filter(inv => (filter === 'all' ? true : inv.status === filter));

  const totals = invoices.reduce(
    (acc, inv) => {
      acc[inv.status] += inv.total;
      return acc;
    },
    { paid: 0, unpaid: 0, overdue: 0 } as Record<'paid' | 'unpaid' | 'overdue', number>
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
          Billing
        </Text>
        <Button
          title="New Invoice"
          onPress={() => router.push('/(stacks)/billing/new')}
          icon={<Plus color={tokens.colors.text} size={16} />}
        />
      </View>
      <View style={{ flexDirection: 'row', marginBottom: tokens.spacing.md }}>
        {FILTERS.map(f => (
          <Button
            key={f}
            title={f.charAt(0).toUpperCase() + f.slice(1)}
            onPress={() => setFilter(f)}
            variant={filter === f ? 'primary' : 'secondary'}
            style={{ marginRight: tokens.spacing.sm }}
          />
        ))}
      </View>
      {/* Totals strip */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing.md,
        }}
      >
        <Text style={{ color: tokens.colors.text, fontSize: 14 }}>Unpaid: ${totals.unpaid.toFixed(2)}</Text>
        <Text style={{ color: tokens.colors.text, fontSize: 14 }}>Overdue: ${totals.overdue.toFixed(2)}</Text>
        <Text style={{ color: tokens.colors.text, fontSize: 14 }}>Paid: ${totals.paid.toFixed(2)}</Text>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: tokens.spacing.md }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing.sm,
              }}
            >
              <Text
                style={{ color: tokens.colors.text, fontSize: 18, fontWeight: '600' }}
              >
                INV-{item.id}
              </Text>
              <Badge
                status={
                  item.status === 'paid'
                    ? 'paid'
                    : item.status === 'overdue'
                    ? 'overdue'
                    : 'inactive'
                }
                label={item.status}
              />
            </View>
            <Text style={{ color: '#71717A', fontSize: 14, marginBottom: tokens.spacing.sm }}>
              Total ${item.total.toFixed(2)}
            </Text>
            <Button
              title={item.status !== 'paid' ? 'Mark Paid' : 'Paid'}
              onPress={() => markInvoicePaid(item.id)}
              disabled={item.status === 'paid'}
              variant="secondary"
            />
          </Card>
        )}
        ListEmptyComponent={
          <Text
            style={{ color: '#71717A', fontSize: 14, marginTop: tokens.spacing.lg }}
          >
            No invoices
          </Text>
        }
      />
    </Screen>
  );
}