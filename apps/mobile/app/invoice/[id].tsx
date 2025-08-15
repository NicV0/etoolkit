import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getInvoiceWithItems } from '../../features/invoices/api';
import { renderInvoiceHTML } from '../../lib/invoice-template';

export default function InvoicePreview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<any>({ inv:null, items:[] });

  useEffect(()=>{(async()=>{
    if (!id) return;
    const res = await getInvoiceWithItems(id as string);
    setState(res); setLoading(false);
  })();},[id]);

  const html = useMemo(()=>{
    const inv = state.inv; const items = state.items||[];
    if (!inv) return '';
    const subtotal = (inv.subtotal_cents||0)/100; const tax = (inv.tax_cents||0)/100; const total = (inv.total_cents||0)/100;
    return renderInvoiceHTML({
      company: { name: 'eToolkit Services', color: inv.brand_color||'#1e3a8a' },
      client: { name: 'Client' },
      invoice: { number: inv.number, status: inv.status },
      items: items.map((it:any)=> ({ name: it.name, qty: it.qty, rate: (it.rate_cents||0)/100 })),
      totals: { subtotal, tax, total },
      terms: inv.terms||''
    });
  },[state]);

  const exportPDF = async ()=>{
    try { const { uri } = await Print.printToFileAsync({ html }); await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' }); }
    catch(e:any){ Alert.alert('Export failed', e.message||'Unknown'); }
  };

  if (loading) return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><ActivityIndicator/></View>;
  return (
    <View style={{ padding:16 }}>
      <Pressable onPress={()=>router.back()}><Text>◀ Back</Text></Pressable>
      <Text style={{ fontSize:22, fontWeight:'700', marginTop:8 }}>Invoice {state?.inv?.number}</Text>
      <Pressable onPress={exportPDF} style={{ marginTop:16, backgroundColor:'black', padding:12, borderRadius:10, alignSelf:'flex-start' }}>
        <Text style={{ color:'#fff', fontWeight:'600' }}>Export / Share PDF</Text>
      </Pressable>
    </View>
  );
}
