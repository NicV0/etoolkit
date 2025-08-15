import { supabase } from '../../lib/supabase';

export type EventInput = { org_id: string; job_id: string; starts_at: string; ends_at: string; note?: string; assignee_user_id?: string };

export async function createEvent(input: EventInput) {
  const { data, error } = await supabase.from('schedule_events').insert(input).select('id').single();
  if (error) throw error;
  return data!.id as string;
}

export async function updateEvent(id: string, patch: Partial<EventInput>) {
  const { error } = await supabase.from('schedule_events').update(patch).eq('id', id);
  if (error) throw error;
}

export async function listEventsByDay(org_id: string, dayStartISO: string, dayEndISO: string) {
  const { data, error } = await supabase
    .from('schedule_events')
    .select('*, jobs(title)')
    .eq('org_id', org_id)
    .gte('starts_at', dayStartISO)
    .lt('starts_at', dayEndISO)
    .order('starts_at');
  if (error) throw error;
  return data || [];
}
