import { useMemo } from 'react';
import { clients } from '../data/mockClients';

export function useClientSearch(query: string) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [query]);
}