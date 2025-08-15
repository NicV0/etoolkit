import { Alert, Pressable, Text } from 'react-native';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { useState } from 'react';
import { renderInvoiceHTML } from '../../lib/invoice-template';
import { refundPayment } from '../../features/payments/refund';

const supabase: any = { from: () => ({ update: () => ({ eq: async () => ({}) }) }) };

export default function InvoiceScreen({ route }: any) {
  const { id } = route.params || {};
  const [inv] = useState<any>({});

  const exportPDF = async () => {
    const items = (inv?.items||[]) as { name:string; qty:number; rate:number }[];
    const html = renderInvoiceHTML({
      company: { name: 'eToolkit Services', color: inv.brand_color },
      client: { name: inv.client_name, email: inv.client_email },
      items,
      totals: { subtotal: (inv.subtotal_cents||0)/100, tax: (inv.tax_cents||0)/100 },
      number: inv.number,
      status: inv.status,
      terms: inv.terms,
      plan: inv.plan || 'free',
    });
    const { uri } = await Print.printToFileAsync({ html });
    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  };

  const onRefund = async () => { try { await refundPayment(id as string); Alert.alert('Refund requested'); } catch(e:any){ Alert.alert('Refund failed', e.message); } };
  const onVoid = async () => { try { await supabase.from('invoices').update({ status:'VOID' }).eq('id', id); Alert.alert('Invoice voided'); } catch(e:any){ Alert.alert('Void failed', e.message); } };

  return (
    <>
      <Pressable onPress={exportPDF} style={{ marginTop:8, backgroundColor:'#111', padding:12, borderRadius:10 }}><Text style={{ color:'#fff', textAlign:'center' }}>Export / Share PDF</Text></Pressable>
      {inv.status==='PAID' && (
        <Pressable onPress={onRefund} style={{ marginTop:8, backgroundColor:'#ef4444', padding:12, borderRadius:10 }}><Text style={{ color:'#fff', textAlign:'center' }}>Refund</Text></Pressable>
      )}
      {inv.status!=='PAID' && (
        <Pressable onPress={onVoid} style={{ marginTop:8, backgroundColor:'#6b7280', padding:12, borderRadius:10 }}><Text style={{ color:'#fff', textAlign:'center' }}>Void</Text></Pressable>
      )}
    </>
  );
}
