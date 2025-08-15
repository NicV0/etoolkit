import { describe, it, expect } from 'vitest';
import { answer } from '../apps/mobile/features/kitai/engine';

describe('answers', ()=>{
  it('returns deterministic text structure', ()=>{
    const a = answer('org1','total billed today');
    expect(a.role).toBe('assistant');
    expect(typeof a.text).toBe('string');
  });
});
