import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Header } from '../../../components/layout/Header';
import { Card } from '../../../components/ui/Card';
import { Section } from '../../../components/ui/Section';
import { colors } from '../../../lib/theme/tokens';
import { Link } from 'expo-router';

import { Screen } from '../../../components/layout/Screen';
export default function Dashboard() {
  return (
    <Screen>
      <Header title="Dashboard" showSettings />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Section title="Overview">
          <Card className="mb-4">
            <Text style={{ color: colors.text, fontFamily: 'Inter_700Bold', fontSize: 24 }}>
              $38,210.00
            </Text>
            <Text style={{ color: colors.textMuted, fontFamily: 'Inter_400Regular' }}>
              Accounts Receivable
            </Text>
          </Card>
          <Card>
            <Text style={{ color: colors.text, fontFamily: 'Inter_700Bold', fontSize: 18 }}>
              Open Quotes: 3
            </Text>
            <Text style={{ color: colors.textMuted, fontFamily: 'Inter_400Regular' }}>
              Awaiting client approval
            </Text>
          </Card>
        </Section>
        <Section title="Recent Activity">
          <Card>
            <Link href="/(tabs)/clients/1" asChild>
              <Text style={{ color: colors.text, fontFamily: 'Inter_600SemiBold' }}>John Smith</Text>
            </Link>
            <Text style={{ color: colors.textMuted, fontFamily: 'Inter_400Regular' }}>
              office@acmeplumb.com
            </Text>
          </Card>
        </Section>
      </ScrollView>
    </Screen>
  );
}