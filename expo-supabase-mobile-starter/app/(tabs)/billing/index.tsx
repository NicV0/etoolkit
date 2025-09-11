import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

// Components
import {
  Screen,
  Button,
  Card,
  Badge,
} from '../../../components/ui';

// Hooks
import { useInvoices, useClients } from '../../../lib/state/simpleStore';

// Theme
import { theme } from '../../../lib/theme/tokens';

const FILTERS = ['all', 'unpaid', 'overdue', 'paid'] as const;
type Filter = typeof FILTERS[number];

/**
 * Billing screen displays invoices with filtering and a button to create
 * new invoices. Totals for each status are summarised at the top and
 * each invoice can be marked paid from this list.
 */
export default function Billing() {
  const { invoices, markInvoicePaid } = useInvoices();
  const { clients } = useClients();
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

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  return (
    <Screen testID="screen.billing">
      <View style={styles.header}>
        <Text style={styles.title}>
          Billing
        </Text>
        <Button
          title="New Invoice"
          onPress={() => router.push('/(tabs)/billing/new')}
          leftIcon={<Plus color={theme.colors.text.primary} size={16} />}
        />
      </View>
      
      <View style={styles.filters}>
        {FILTERS.map(f => (
          <Button
            key={f}
            title={f.charAt(0).toUpperCase() + f.slice(1)}
            onPress={() => setFilter(f)}
            variant={filter === f ? 'primary' : 'secondary'}
            style={styles.filterButton}
          />
        ))}
      </View>
      
      {/* Totals strip */}
      <View style={styles.totals}>
        <Text style={styles.totalText}>Unpaid: ${totals.unpaid.toFixed(2)}</Text>
        <Text style={styles.totalText}>Overdue: ${totals.overdue.toFixed(2)}</Text>
        <Text style={styles.totalText}>Paid: ${totals.paid.toFixed(2)}</Text>
      </View>
      
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.invoiceCard}>
            <View style={styles.invoiceHeader}>
              <Text style={styles.invoiceNumber}>
                INV-{item.id}
              </Text>
              <Badge
                label={item.status}
                variant={
                  item.status === 'paid'
                    ? 'success'
                    : item.status === 'overdue'
                    ? 'error'
                    : 'warning'
                }
              />
            </View>
            <Text style={styles.clientName}>
              {getClientName(item.clientId)}
            </Text>
            <Text style={styles.invoiceTotal}>
              Total ${item.total.toFixed(2)}
            </Text>
            <Button
              title={item.status !== 'paid' ? 'Mark Paid' : 'Paid'}
              onPress={() => markInvoicePaid(item.id)}
              disabled={item.status === 'paid'}
              variant="secondary"
              style={styles.markPaidButton}
            />
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No invoices
          </Text>
        }
      />
    </Screen>
  );
}

const styles = {
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    flex: 1,
  },
  filters: {
    flexDirection: 'row' as const,
    marginBottom: theme.spacing.md,
  },
  filterButton: {
    marginRight: theme.spacing.sm,
  },
  totals: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: theme.spacing.md,
  },
  totalText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.body,
  },
  invoiceCard: {
    marginBottom: theme.spacing.md,
  },
  invoiceHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  invoiceNumber: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.section,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  clientName: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.body,
    marginBottom: theme.spacing.sm,
  },
  invoiceTotal: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.body,
    marginBottom: theme.spacing.sm,
  },
  markPaidButton: {
    alignSelf: 'flex-start' as const,
  },
  emptyText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.body,
    marginTop: theme.spacing.lg,
    textAlign: 'center' as const,
  },
};
