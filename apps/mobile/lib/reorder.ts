export function normalizeOrder(ids: string[]) {
  return ids.map((id, i)=> ({ id, order_index: i*10 }));
}
