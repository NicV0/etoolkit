export async function createPaymentLink(functionsHost: string, invoice_id: string) {
  const res = await fetch(`${functionsHost}/stripe-sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create_payment_link', invoice_id }),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { url: string };
}
