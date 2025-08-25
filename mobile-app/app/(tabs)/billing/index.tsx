import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Header } from '../../../components/layout/Header';
import { colors } from '../../../lib/theme/tokens';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useRouter } from 'expo-router';

import { Screen } from '../../../components/layout/Screen';
export default function Billing() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all'|'unpaid'|'overdue'|'paid'>('all');
  const invoices = [
    { id: 'INV-1024', client: 'Acme Plumbing', total: 1500, status: 'unpaid' },
    { id: 'INV-1025', client: 'Green Leaf HVAC', total: 820, status: 'paid' },
    { id: 'INV-1026', client: 'Acme Plumbing', total: 2100, status: 'overdue' },
  ];
  const shown = useMemo(() => invoices.filter(i => filter==='all' ? true : i.status===filter), [filter]);
  const totals = useMemo(() => ({
    unpaid: invoices.filter(i=>i.status==='unpaid').reduce((a,b)=>a+b.total,0),
    overdue: invoices.filter(i=>i.status==='overdue').reduce((a,b)=>a+b.total,0),
    paid: invoices.filter(i=>i.status==='paid').reduce((a,b)=>a+b.total,0),
  }), []);
  return (
    <Screen>
      <Header title="Billing" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card className="mb-3">
          <Button
            title="New Invoice"
            onPress={() => router.push('/(tabs)/billing/new')}
          />
        </Card>
        <Card>
          <Text style={{ color: colors.text, fontFamily: 'Inter_600SemiBold' }}>INV-1024</Text>
          <Text style={{ color: colors.textMuted }}>Acme Plumbing — $1,500.00</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}