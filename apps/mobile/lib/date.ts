export function dayBoundsISO(d: Date) {
  const start = new Date(d); start.setHours(0,0,0,0);
  const end = new Date(d); end.setHours(24,0,0,0);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}
