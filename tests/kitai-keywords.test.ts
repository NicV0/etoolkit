import { describe, it, expect } from 'vitest';

function classify(q: string): string {
  q = q.toLowerCase();
  if (q.includes('quick pick')) return 'quick';
  if (q.includes('overdue')) return 'overdue';
  if (q.includes('totals') && q.includes('today')) return 'totals';
  if (/client\s+[^\s]+\s+email/.test(q)) return 'client-email';
  return 'help';
}

describe('kitai keywords', () => {
  it('detects quick picks', ()=> expect(classify('List QUICK PICKS')).toBe('quick'));
  it('detects overdue', ()=> expect(classify('Any overdue invoices?')).toBe('overdue'));
  it('detects totals today', ()=> expect(classify('What are the totals today')).toBe('totals'));
  it('detects client email pattern', ()=> expect(classify('client Jane email')).toBe('client-email'));
  it('falls back to help', ()=> expect(classify('hello')).toBe('help'));
});
