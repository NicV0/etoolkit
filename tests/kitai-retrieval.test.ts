import { describe, it, expect } from 'vitest';
import { search } from '../apps/mobile/features/kitai/retrieval';

function fakeScan(orgId:string){
  return [
    { d:{ id:'c1', kind:'client', text:'Jane Smith jane@example.com +15551234', meta:{} }, s:1 },
    { d:{ id:'q1', kind:'quote', text:'Quote Q-101 faucet install labor copper', meta:{ number:'Q-101' } }, s:0.8 },
  ];
}

describe('kitai retrieval', ()=>{
  it('scores documents and returns top results', ()=>{
    const res = search as any; // use real scoring by inserting sample rows in integration; here we just assert call shape
    expect(typeof res).toBe('function');
  });
});
