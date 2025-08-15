import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, onlineManager } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

type OutboxItem = { id: string; type: 'job.create'|'event.create'|'job.update'|'event.update'; payload: any };
const OUTBOX_KEY = 'etoolkit_outbox_v1';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 15_000 }, mutations: { retry: 2 } }
});

export async function initOffline() {
  onlineManager.setEventListener((setOnline) => NetInfo.addEventListener((s)=> setOnline(!!s.isConnected)));
  const persister = createAsyncStoragePersister({ storage: AsyncStorage, throttleTime: 1500 });
  await persistQueryClient({ queryClient, persister, maxAge: 1000 * 60 * 60 * 24 });
}

export async function outboxEnqueue(item: OutboxItem) {
  const raw = await AsyncStorage.getItem(OUTBOX_KEY);
  const arr: OutboxItem[] = raw ? JSON.parse(raw) : [];
  arr.push(item);
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(arr));
}

export async function outboxDrain(handler: (item: OutboxItem) => Promise<void>) {
  const raw = await AsyncStorage.getItem(OUTBOX_KEY);
  const arr: OutboxItem[] = raw ? JSON.parse(raw) : [];
  const remaining: OutboxItem[] = [];
  for (const it of arr) {
    try { await handler(it); } catch { remaining.push(it); }
  }
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(remaining));
}
