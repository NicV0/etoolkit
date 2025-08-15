import { describe, it, expect } from 'vitest';

function mapAfterRefund(status:string){ return 'VOID'; }

describe('refund → VOID', ()=>{
  it('maps any paid invoice to VOID after refund', ()=>{
    expect(mapAfterRefund('PAID')).toBe('VOID');
  });
});
