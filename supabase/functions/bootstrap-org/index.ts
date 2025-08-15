import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401 });

  const token = authHeader.replace('Bearer ', '');

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE')!;

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) return new Response('Unauthorized', { status: 401 });

  const admin = createClient(supabaseUrl, serviceRole);

  const { data: membership } = await admin
    .from('memberships')
    .select('org_id, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (membership) {
    return new Response(
      JSON.stringify({ org_id: membership.org_id, role: membership.role, created: false }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }

  const emailLocal = user.email?.split('@')[0] ?? 'New';
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({ name: `${emailLocal} Co.` })
    .select('id')
    .single();
  if (orgError) return new Response(orgError.message, { status: 500 });

  const { error: memError } = await admin
    .from('memberships')
    .insert({ org_id: org.id, user_id: user.id, role: 'OWNER' });
  if (memError) return new Response(memError.message, { status: 500 });

  return new Response(
    JSON.stringify({ org_id: org.id, role: 'OWNER', created: true }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
