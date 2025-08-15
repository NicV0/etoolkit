Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const body = await req.json().catch(() => ({}));
    const q: string = (body?.question || '').toLowerCase().trim();
    const reply = (() => {
      if (!q) return "Try: ‘Show overdue invoices’, ‘List quick picks’, ‘Totals today’, or ‘Client <name> email’.";
      if (q.includes('overdue')) return 'No overdue invoices detected in this M1 build.';
      if (q.includes('quick pick')) return 'Quick Picks: Hose bib replacement ($50), Outlet install GFCI ($85), Drain snaking ($120), Thermostat swap ($75).';
      if (q.includes('totals') && q.includes('today')) return 'Estimated totals today: compute from History in a future update.';
      const m = q.match(/client\s+([^\s]+)\s+email/);
      if (m) return `Open the Clients tab and search for “${m[1]}” to view contact details.`;
      return "I can help with: overdue invoices, totals today, quick picks, or ‘client <name> email’.";
    })();
    return new Response(JSON.stringify({ answer: reply }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(`Error: ${e?.message || 'unknown'}`, { status: 500 });
  }
});
