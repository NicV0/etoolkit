export async function createPaymentIntent(invoice_id: string, token: string) {
  const res = await fetch('https://cwdvbaksbjbcagofxhdz.functions.supabase.co/create-payment-intent', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ invoice_id })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json() as { clientSecret?: string; customerId: string };
}

export async function createEphemeralKey(customerId: string) {
  const res = await fetch('https://cwdvbaksbjbcagofxhdz.functions.supabase.co/ephemeral-key', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerId })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
