import { supabase } from './supabase';

function functionUrl(url: string) {
  return url.replace('supabase.co', 'functions.supabase.co') + '/bootstrap-org';
}

export async function callBootstrapOrg() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('No session');

  const url = functionUrl(process.env.EXPO_PUBLIC_SUPABASE_URL!);
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json() as Promise<{ org_id: string; role: string; created: boolean }>;
}
