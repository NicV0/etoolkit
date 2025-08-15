import { supabase } from '../../lib/supabase';

export function subscribeOrg(orgId: string, onEvent: (payload:{ table:string; type:string; new:any; old:any })=>void) {
  const ch = supabase
    .channel(`org:${orgId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule_events', filter: `org_id=eq.${orgId}` }, (p)=> onEvent({ table:'schedule_events', type:p.eventType, new:(p as any).new, old:(p as any).old }))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, (p)=> onEvent({ table:'jobs', type:p.eventType, new:(p as any).new, old:(p as any).old }))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'task_items' }, (p)=> onEvent({ table:'task_items', type:p.eventType, new:(p as any).new, old:(p as any).old }))
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}
