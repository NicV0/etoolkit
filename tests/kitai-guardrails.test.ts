import { describe, it, expect } from 'vitest';
import { safeShare, redactPII } from '../apps/mobile/features/kitai/redact';

describe('redaction', ()=>{
  it('redacts email and phone', ()=>{
    const out = redactPII('Contact jane@example.com or +1 (555) 123-4567');
    expect(out).toContain('[email]');
    expect(out).toContain('[phone]');
  });
  it('passes internal mode', ()=>{
    expect(safeShare('ok', 'internal')).toBe('ok');
  });
});
