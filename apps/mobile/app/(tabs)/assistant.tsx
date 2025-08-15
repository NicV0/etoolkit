import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import { askKitAI } from '../../lib/kitai';

export default function Assistant() {
  const [log, setLog] = useState<{ role:'user'|'assistant'; text:string }[]>([
    { role: 'assistant', text: 'KitAI ready. Ask: overdue invoices, totals today, quick picks, or client <name> email.' }
  ]);
  const [input, setInput] = useState('');
  const host = useMemo(()=> 'https://<your-ref>.functions.supabase.co', []); // put your project ref here or derive from config

  const send = async () => {
    const q = input.trim(); if (!q) return;
    setLog((l)=> [...l, { role:'user', text:q }]); setInput('');
    const a = await askKitAI(host, q);
    setLog((l)=> [...l, { role:'assistant', text:a }]);
  };

  return (
    <View style={{ flex:1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>KitAI</Text>
      <FlatList data={log} keyExtractor={(_,i)=>`m-${i}`} renderItem={({item})=> (
        <View style={{ alignSelf: item.role==='user'?'flex-end':'flex-start', backgroundColor: item.role==='user'?'#111':'#eee', padding: 10, borderRadius: 12, marginTop: 8 }}>
          <Text style={{ color: item.role==='user'?'#fff':'#111' }}>{item.text}</Text>
        </View>
      )} />
      <View style={{ flexDirection:'row', gap: 8, marginTop: 8 }}>
        <TextInput value={input} onChangeText={setInput} placeholder="Ask KitAI…" style={{ flex:1, borderWidth:1, borderRadius:12, padding:10 }} />
        <Pressable onPress={send} style={{ backgroundColor:'black', paddingHorizontal: 16, borderRadius: 12, justifyContent:'center' }}>
          <Text style={{ color:'#fff', fontWeight:'600' }}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}
