import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import TaskItem from '../../components/TaskItem';
import { addTask, listTasks, toggleTask, reorderTasks } from '../../features/tasks/api';

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tasks, setTasks] = useState<any[]>([]);
  const [input, setInput] = useState('');

  const load = async ()=> {
    const rows = await listTasks(id as string); setTasks(rows);
  };
  useEffect(()=>{ if (id) load(); }, [id]);

  const onAdd = async ()=> {
    try { await addTask(id as string, input); setInput(''); load(); }
    catch (e:any) { Alert.alert('Failed', e.message||''); }
  };

  const onToggle = async (tid: string, done: boolean)=> {
    try { await toggleTask(tid, done); load(); } catch(e:any){ Alert.alert('Failed', e.message||''); }
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontWeight:'700' }}>Job</Text>
      <Text style={{ marginTop:12, fontWeight:'600' }}>Tasks</Text>
      <FlatList data={tasks} keyExtractor={(t)=> t.id} renderItem={({item})=> (
        <TaskItem item={item} onToggle={()=> onToggle(item.id, !item.done)} />
      )} />
      <View style={{ flexDirection:'row', gap:8 }}>
        <TextInput placeholder='New task' value={input} onChangeText={setInput} style={{ flex:1, borderWidth:1, borderRadius:12, padding:10 }} />
        <Pressable onPress={onAdd} style={{ backgroundColor:'black', padding:12, borderRadius:12 }}><Text style={{ color:'#fff', fontWeight:'600' }}>Add</Text></Pressable>
      </View>
    </View>
  );
}
