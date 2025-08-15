import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { payInvoice } from '../../features/payments/sheet';

export default function InvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [inv, setInv] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data, error } = await supabase.from('invoices').select('*').eq('id', id).maybeSingle();
      if (error) Alert.alert('Error', error.message); else setInv(data);
      setLoading(false);
    })();
  }, [id]);

  const total = useMemo(() => (inv ? (inv.total_cents || 0) / 100 : 0), [inv]);

  const onPay = async () => {
    try {
      setBusy(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error('No session');
      const res = await payInvoice(id as string, token);
      if (res.status === 'success') Alert.alert('Paid', 'Payment completed.');
      else Alert.alert('Payment failed', res.message || 'Try another method.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Payment failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><ActivityIndicator /></View>;
  if (!inv) return <View style={{ padding:16 }}><Text>Invoice not found</Text></View>;

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:24, fontWeight:'700' }}>Invoice</Text>
      <Text style={{ marginTop:8, opacity:.7 }}>ID: {inv.id}</Text>
      <Text style={{ marginTop:8, fontSize:18, fontWeight:'700' }}>${total.toFixed(2)}</Text>
      <Text style={{ marginTop:4 }}>Status: {inv.status}</Text>

      <Pressable disabled={busy || inv.status==='PAID'} onPress={onPay} style={{ marginTop:16, backgroundColor: inv.status==='PAID' ? '#666' : 'black', padding:14, borderRadius:12 }}>
        <Text style={{ color:'#fff', fontWeight:'600', textAlign:'center' }}>{inv.status==='PAID' ? 'Already Paid' : busy ? 'Processing…' : 'Pay Now'}</Text>
      </Pressable>
    </View>
  );
}
