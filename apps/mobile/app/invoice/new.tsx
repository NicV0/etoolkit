import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useOrg } from '../../lib/org';
import { createInvoice, computeTotals, InvoiceItem } from '../../features/invoices/api';

export default function NewInvoice() {
  const { orgId } = useOrg();
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ name:'Labor', qty:2, rate:90 }]);
  const [tax, setTax] = useState(8);
  const [terms, setTerms] = useState('');
  const t = computeTotals(items, tax);

  const onSave = async () => {
    try {
      if (!orgId) return Alert.alert('No org');
      if (!clientId) return Alert.alert('Client required');
      const res = await createInvoice(orgId, { client_id: clientId, items, tax_percent: tax, terms });
      Alert.alert('Invoice created', res.invoice_id);
    } catch (e:any) {
      Alert.alert('Error', e.message||'Unknown');
    }
  };

  return (
    <View style={{ padding:16 }}>
      <Text style={{ fontSize:24, fontWeight:'700' }}>New Invoice</Text>
      <TextInput placeholder="Client ID" value={clientId} onChangeText={setClientId} style={{ borderWidth:1, borderRadius:12, padding:10, marginVertical:8 }} />
      <View style={{ marginTop:12 }}>
        <Text>Subtotal: ${t.subtotal.toFixed(2)}</Text>
        <Text>Tax: ${t.tax.toFixed(2)}</Text>
        <Text style={{ fontWeight:'700' }}>Total: ${t.total.toFixed(2)}</Text>
      </View>
      <Pressable onPress={onSave} style={{ backgroundColor:'black', padding:14, borderRadius:12, marginTop:12 }}>
        <Text style={{ color:'#fff', textAlign:'center', fontWeight:'600' }}>Save Invoice</Text>
      </Pressable>
    </View>
  );
}
