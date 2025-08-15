export async function sendInvoiceEmail(invoice_id: string, to: string) {
  const res = await fetch('https://cwdvbaksbjbcagofxhdz.functions.supabase.co/send-invoice', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invoice_id, to })
  });
  if (!res.ok) throw new Error(await res.text());
}
