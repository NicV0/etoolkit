import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, FlatList, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useOrg } from '../../lib/org';
import { listEventsByDay, createEvent } from '../../features/schedule/api';
import { dayBoundsISO } from '../../lib/date';
import WeekStrip from '../../components/WeekStrip';
import EventCard from '../../components/EventCard';
import { subscribeOrg } from '../../features/realtime';
import { useRouter } from 'expo-router';

export default function Schedule() {
  const { orgId } = useOrg();
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ job_id: '', starts: '', ends: '', note: '' });
  const router = useRouter();

  const bounds = useMemo(()=> dayBoundsISO(date), [date]);

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try { const rows = await listEventsByDay(orgId, bounds.startISO, bounds.endISO); setEvents(rows); }
    catch (e:any) { Alert.alert('Load failed', e.message||''); }
    finally { setLoading(false); }
  }, [orgId, bounds.startISO]);

  useEffect(()=>{ load(); }, [load]);

  useEffect(()=>{
    if (!orgId) return;
    return subscribeOrg(orgId, (p)=>{
      if (p.table==='schedule_events') load();
      if (p.table==='jobs') load();
    });
  }, [orgId, load]);

  const create = async () => {
    try {
      if (!orgId) return;
      const payload = { org_id: orgId, job_id: form.job_id, starts_at: form.starts, ends_at: form.ends, note: form.note };
      await createEvent(payload);
      setModal(false); setForm({ job_id:'', starts:'', ends:'', note:'' });
      load();
    } catch (e:any) {
      setModal(false);
      Alert.alert('Failed', e.message||'Unknown error');
    }
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:24, fontWeight:'700' }}>Schedule</Text>
      <WeekStrip date={date} onChange={setDate} />

      {loading ? <ActivityIndicator/> : (
        <FlatList data={events} keyExtractor={(e)=> e.id} renderItem={({item})=> (
          <EventCard item={item} onPress={()=> router.push(`/job/${item.job_id}`)} />
        )} />
      )}

      <Pressable onPress={()=> setModal(true)} style={{ marginTop:12, backgroundColor:'black', padding:12, borderRadius:12, alignSelf:'flex-start' }}>
        <Text style={{ color:'#fff', fontWeight:'600' }}>New Event</Text>
      </Pressable>

      <Modal visible={modal} transparent animationType='fade'>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', padding:16 }}>
          <View style={{ backgroundColor:'white', borderRadius:16, padding:16 }}>
            <Text style={{ fontSize:18, fontWeight:'700', marginBottom:8 }}>New Event</Text>
            <TextInput placeholder='Job ID' value={form.job_id} onChangeText={(t)=> setForm({ ...form, job_id: t })} style={{ borderWidth:1, borderRadius:12, padding:10, marginBottom:8 }} />
            <TextInput placeholder='Start (ISO)' value={form.starts} onChangeText={(t)=> setForm({ ...form, starts: t })} style={{ borderWidth:1, borderRadius:12, padding:10, marginBottom:8 }} />
            <TextInput placeholder='End (ISO)' value={form.ends} onChangeText={(t)=> setForm({ ...form, ends: t })} style={{ borderWidth:1, borderRadius:12, padding:10, marginBottom:8 }} />
            <TextInput placeholder='Note' value={form.note} onChangeText={(t)=> setForm({ ...form, note: t })} style={{ borderWidth:1, borderRadius:12, padding:10 }} />
            <View style={{ flexDirection:'row', justifyContent:'flex-end', gap:12, marginTop:12 }}>
              <Pressable onPress={()=> setModal(false)}><Text>Cancel</Text></Pressable>
              <Pressable onPress={create} style={{ backgroundColor:'black', paddingHorizontal:14, paddingVertical:10, borderRadius:12 }}>
                <Text style={{ color:'#fff', fontWeight:'600' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
