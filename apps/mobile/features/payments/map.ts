export type SheetResult = { status: 'success' } | { status: 'error', message?: string };
export function uiStateFromSheet(r: SheetResult) {
  if (r.status === 'success') return { label: 'Paid', color: 'green' } as const;
  const msg = (r as any).message || '';
  if (/canceled/i.test(msg)) return { label: 'Canceled', color: 'gray' } as const;
  if (/declined|insufficient/i.test(msg)) return { label: 'Declined', color: 'red' } as const;
  return { label: 'Failed', color: 'red' } as const;
}
