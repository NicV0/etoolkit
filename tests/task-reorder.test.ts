import { describe, it, expect } from 'vitest';
import { normalizeOrder } from '../apps/mobile/lib/reorder';

describe('normalizeOrder', ()=>{
  it('spaces by ten', ()=>{
    const out = normalizeOrder(['a','b','c']);
    expect(out.map(o=>o.order_index)).toEqual([0,10,20]);
  });
});
