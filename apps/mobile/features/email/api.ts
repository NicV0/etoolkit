export async function sendEmail(params: { to: string; subject: string; html: string; text?: string }) {
  const base = process.env.EXPO_PUBLIC_FUNCTIONS_URL || 'https://example.functions.supabase.co';
  const res = await fetch(`${base}/email-dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('email failed');
  return res.json();
}
