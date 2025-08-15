import { describe, it, expect } from 'vitest';

function buildLineItem(amount_cents:number, currency:string) {
  return { price_data: { currency, product_data: { name: 'Invoice X' }, unit_amount: amount_cents }, quantity: 1 };
}

describe('buildLineItem', ()=>{
  it('constructs stripe object', ()=>{
    expect(buildLineItem(5000,'usd')).toEqual({ price_data: { currency:'usd', product_data:{ name:'Invoice X' }, unit_amount:5000 }, quantity:1 });
  });
});
