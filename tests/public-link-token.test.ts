import { describe, it, expect } from 'vitest';

function mkToken(ttlHours:number){
  const token = 't'+Math.random().toString(36).slice(2);
  const expires = new Date(Date.now()+ttlHours*3600*1000);
  return { token, expires };
}

describe('public link token', () => {
  it('sets a future expiry', ()=> {
    const { expires } = mkToken(24);
    expect(expires.getTime()).toBeGreaterThan(Date.now());
  });
});
