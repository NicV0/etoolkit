import { describe, it, expect } from 'vitest';
import { uiStateFromSheet } from '../apps/mobile/features/payments/map';

describe('uiStateFromSheet', ()=>{
  it('success maps to Paid/green', ()=>{
    expect(uiStateFromSheet({ status: 'success' })).toEqual({ label: 'Paid', color: 'green' });
  });
  it('canceled maps to gray', ()=>{
    expect(uiStateFromSheet({ status: 'error', message: 'Canceled by user' })).toEqual({ label: 'Canceled', color: 'gray' });
  });
  it('declined maps to red', ()=>{
    expect(uiStateFromSheet({ status: 'error', message: 'Card declined' })).toEqual({ label: 'Declined', color: 'red' });
  });
});
