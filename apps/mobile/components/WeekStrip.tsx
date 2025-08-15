import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

type Props = { date: Date; onChange: (d: Date)=>void };
export default function WeekStrip({ date, onChange }: Props) {
  const start = new Date(date); const day = start.getDay();
  const diff = (day + 6) % 7; // make Monday=0
  start.setDate(start.getDate() - diff);
  const days = Array.from({ length: 7 }, (_,i)=> new Date(start.getFullYear(), start.getMonth(), start.getDate()+i));
  const same = (a:Date,b:Date)=> a.toDateString()===b.toDateString();
  return (
    <View style={{ flexDirection:'row', gap:8, marginVertical:8 }}>
      {days.map(d=>{
        const active = same(d, date);
        return (
          <Pressable key={d.toDateString()} onPress={()=>{ onChange(new Date(d)); Haptics.selectionAsync(); }} style={{ paddingHorizontal:10, paddingVertical:8, borderRadius:12, backgroundColor: active?'black':'#f2f2f2' }}>
            <Text style={{ color: active?'#fff':'#111', fontWeight:'700' }}>{d.getDate()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
