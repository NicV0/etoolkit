export async function askKitAI(host: string, question: string): Promise<string> {
  try {
    const res = await fetch(`${host}/kitai`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) });
    if (res.ok) { const j = await res.json(); return j.answer || '…'; }
  } catch {}
  return 'Try: “Show overdue invoices”, “Totals today”, “List quick picks”, or “Client <name> email”.';
}
