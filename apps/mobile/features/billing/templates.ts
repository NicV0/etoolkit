export type TemplateKey = 'clean'|'bold'|'lined'|'stacked';
export type Plan = 'free'|'pro';

export const TEMPLATE_CATALOG: { key:TemplateKey; name:string; tier:Plan }[] = [
  { key:'clean', name:'Clean Minimal', tier:'free' },
  { key:'bold', name:'Bold Accent', tier:'free' },
  { key:'lined', name:'Lined Pro', tier:'pro' },
  { key:'stacked', name:'Stacked Ledger', tier:'pro' },
];

export function canUseTemplate(plan:Plan, key:TemplateKey) {
  const tpl = TEMPLATE_CATALOG.find(t=>t.key===key);
  if (!tpl) return false; return plan==='pro' || tpl.tier==='free';
}
