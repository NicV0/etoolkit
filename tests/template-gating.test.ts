import { describe, it, expect } from 'vitest';
import { canUseTemplate } from '../apps/mobile/features/billing/templates';

describe('template gating', ()=>{
  it('free can use free, not pro', ()=>{
    expect(canUseTemplate('free','clean' as any)).toBe(true);
    expect(canUseTemplate('free','lined' as any)).toBe(false);
  });
  it('pro can use all', ()=>{
    expect(canUseTemplate('pro','lined' as any)).toBe(true);
    expect(canUseTemplate('pro','clean' as any)).toBe(true);
  });
});
