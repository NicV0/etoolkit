import { supabase } from '../../lib/supabase';

export type TaskInput = { job_id: string; title: string };

export async function addTask(job_id: string, title: string) {
  const { data, error } = await supabase.from('task_items').insert({ job_id, title }).select('id').single();
  if (error) throw error; return data!.id as string;
}

export async function toggleTask(id: string, done: boolean) {
  const { error } = await supabase.from('task_items').update({ done }).eq('id', id);
  if (error) throw error;
}

export async function reorderTasks(job_id: string, orderedIds: string[]) {
  const updates = orderedIds.map((id, idx)=> ({ id, order_index: idx*10 }));
  const { error } = await supabase.from('task_items').upsert(updates, { onConflict: 'id' });
  if (error) throw error;
}

export async function listTasks(job_id: string) {
  const { data, error } = await supabase.from('task_items').select('*').eq('job_id', job_id).order('order_index');
  if (error) throw error; return data||[];
}
