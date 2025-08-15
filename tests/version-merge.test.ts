import { describe, it, expect } from 'vitest';
import { hasConflict } from '../apps/mobile/lib/offline';

describe('hasConflict', ()=>{
  it('flags when server newer', ()=>{
    expect(hasConflict(2,3)).toBe(true);
  });
  it('no conflict when same', ()=>{
    expect(hasConflict(3,3)).toBe(false);
  });
});
