import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Share } from 'react-native';
import { useOrg } from '../../lib/org';
import { answer } from '../../features/kitai/engine';
import type { Turn } from '../../features/kitai/types';
import { safeShare } from '../../features/kitai/redact';

export default function KitAI() {
  const { orgId } = useOrg();
  const [input, setInput] = useState('');
  const [log, setLog] = useState<Turn[]>([{ role:'assistant', text:'KitAI ready. Ask about clients, quotes, invoices, or jobs.' }]);

  const onSend = () => {
    if (!orgId || !input.trim()) return;
    const userTurn: Turn = { role:'user', text: input };
    const bot = answer(orgId, input);
    setLog((l)=> [...l, userTurn, bot]);
    setInput('');
  };

  const onShare = async () => {
    const last = [...log].reverse().find(t=> t.role==='assistant');
    if (!last) return;
    await Share.share({ message: safeShare(last.text, 'external') });
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:24, fontWeight:'700' }}>KitAI</Text>
      <FlatList style={{ flex:1, marginTop:12 }} data={log} keyExtractor={(_,i)=>`t-${i}`}
        renderItem={({item})=> (
          <View style={{ alignSelf: item.role==='user'?'flex-end':'flex-start', backgroundColor: item.role==='user'?'#111':'#f2f2f2', padding:10, borderRadius:12, marginVertical:4, maxWidth:'85%' }}>
            <Text style={{ color: item.role==='user'?'#fff':'#111' }}>{item.text}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection:'row', gap:8 }}>
        <TextInput placeholder='Ask KitAI…' value={input} onChangeText={setInput} style={{ flex:1, borderWidth:1, borderRadius:12, padding:10 }} />
        <Pressable onPress={onSend} style={{ backgroundColor:'black', padding:12, borderRadius:12 }}><Text style={{ color:'#fff', fontWeight:'600' }}>Send</Text></Pressable>
        <Pressable onPress={onShare} style={{ backgroundColor:'#444', padding:12, borderRadius:12 }}><Text style={{ color:'#fff', fontWeight:'600' }}>Share</Text></Pressable>
      </View>
    </View>
  );
}
