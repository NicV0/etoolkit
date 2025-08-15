import { describe, it, expect } from 'vitest';

type Seen = Set<string>;
function shouldProcess(seen: Seen, eventId: string) {
  if (seen.has(eventId)) return false; seen.add(eventId); return true;
}

describe('webhook idempotency', ()=>{
  it('skips duplicates', ()=>{
    const seen = new Set<string>();
    expect(shouldProcess(seen,'evt_1')).toBe(true);
    expect(shouldProcess(seen,'evt_1')).toBe(false);
    expect(shouldProcess(seen,'evt_2')).toBe(true);
  });
});
