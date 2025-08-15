import { describe, it, expect } from 'vitest';

type Item = { id: string };

function drain(arr: Item[], handler: (it: Item)=>boolean) {
  const remaining: Item[] = [];
  for (const it of arr) { if (!handler(it)) remaining.push(it); }
  return remaining;
}

describe('outbox', () => {
  it('removes processed items, keeps failures', () => {
    const items = [{id:'a'},{id:'b'},{id:'c'}];
    const out = drain(items, (it)=> it.id!=='b');
    expect(out.map(i=>i.id)).toEqual(['b']);
  });
});
