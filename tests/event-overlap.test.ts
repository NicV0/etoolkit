import { describe, it, expect } from 'vitest';
import { overlaps } from '../apps/mobile/lib/overlap';

describe('overlaps', ()=>{
  const d = (h:number,m=0)=> new Date(2025,0,1,h,m,0,0);
  it('detects overlap', ()=>{
    expect(overlaps(d(9),d(10),d(9,30),d(10,30))).toBeTruthy();
  });
});
