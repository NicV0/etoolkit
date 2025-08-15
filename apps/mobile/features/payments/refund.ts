export async function refundPayment(invoice_id: string) {
  const res = await fetch('https://cwdvbaksbjbcagofxhdz.functions.supabase.co/refund-payment', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invoice_id })
  });
  if (!res.ok) throw new Error(await res.text());
}
