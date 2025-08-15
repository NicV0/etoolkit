import { supabase } from '../../lib/supabase';

export type JobInput = { org_id: string; client_id: string; title: string; notes?: string };
export type Job = { id: string; org_id: string; client_id: string; title: string; notes?: string; status: string };

export async function createJob(input: JobInput) {
  const { data, error } = await supabase.from('jobs').insert(input).select('id').single();
  if (error) throw error;
  return data!.id as string;
}

export async function updateJob(id: string, patch: Partial<Job>) {
  const { error } = await supabase.from('jobs').update(patch).eq('id', id);
  if (error) throw error;
}

export async function listJobs(org_id: string) {
  const { data, error } = await supabase.from('jobs').select('*').eq('org_id', org_id).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getJob(id: string) {
  const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
  if (error) throw error;
  return data!;
}
