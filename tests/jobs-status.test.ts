import { describe, it, expect } from 'vitest';

function nextStatus(current: string, action: string) {
  if (current==='NEW' && action==='schedule') return 'SCHEDULED';
  if (current==='SCHEDULED' && action==='start') return 'IN_PROGRESS';
  if (current==='IN_PROGRESS' && action==='complete') return 'COMPLETE';
  if (action==='void') return 'VOID';
  return current;
}

describe('job status transitions', () => {
  it('NEW → SCHEDULED', ()=> expect(nextStatus('NEW','schedule')).toBe('SCHEDULED'));
  it('SCHEDULED → IN_PROGRESS', ()=> expect(nextStatus('SCHEDULED','start')).toBe('IN_PROGRESS'));
  it('IN_PROGRESS → COMPLETE', ()=> expect(nextStatus('IN_PROGRESS','complete')).toBe('COMPLETE'));
  it('any → VOID', ()=> expect(nextStatus('NEW','void')).toBe('VOID'));
});
