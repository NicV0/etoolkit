import { supabase } from '../../lib/supabase';

export async function createPublicLink(kind: 'quote'|'invoice', entity_id: string, org_id: string, ttlHours = 168) {
  const token = crypto.randomUUID().replace(/-/g,'');
  const expires_at = new Date(Date.now() + ttlHours*3600*1000).toISOString();
  const { error } = await supabase.from('public_links').insert({ kind, entity_id, org_id, token, expires_at });
  if (error) throw error;
  const base = process.env.EXPO_PUBLIC_FUNCTIONS_URL || 'https://example.functions.supabase.co';
  const path = kind === 'quote' ? 'public-quote' : 'public-invoice';
  return `${base}/${path}?token=${token}`;
}
