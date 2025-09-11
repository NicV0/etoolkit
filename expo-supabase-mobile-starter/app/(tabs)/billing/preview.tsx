import React, { useMemo } from 'react';
import { ScrollView, Text, View, Alert } from 'react-native';
import { Header } from '../../../components/layout/Header';
import { theme } from '../../../lib/theme/tokens';
import Button from '../../../components/ui/Button';
import { useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { renderInvoiceHTML } from '../../../lib/pdf/invoiceHtml';
import { useSettings } from '../../../lib/state/settings';

export default function InvoicePreview() {
  const { client, total, invoiceNo } = useLocalSearchParams<{client:string; total:string; invoiceNo:string}>();
  const { settings } = useSettings();

  const html = useMemo(() => renderInvoiceHTML({
    orgName: settings.orgName,
    logoUri: settings.logoUri,
    invoiceNo: String(invoiceNo ?? 'INV-XXXX'),
    clientName: String(client ?? 'Client Name'),
    total: String(total ?? '$0.00'),
  }), [client, total, invoiceNo, settings]);

  const onExport = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html });
      const can = await Sharing.isAvailableAsync();
      if (can) await Sharing.shareAsync(uri);
      else Alert.alert('Exported', uri);
    } catch (e: unknown) {
      Alert.alert('Error', (e as Error)?.message ?? 'Failed to export');
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Header title="Invoice Preview" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: theme.colors.text.muted, marginBottom: 12 }}>A basic preview will be exported as a PDF.</Text>
        <Button title="Export PDF" onPress={onExport} />
      </ScrollView>
    </View>
  );
}
