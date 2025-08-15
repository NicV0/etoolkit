import React from 'react';
import { View, Text, Pressable } from 'react-native';

type Props = { item: any; onPress?: ()=>void };
export default function EventCard({ item, onPress }: Props) {
  const start = new Date(item.starts_at); const end = new Date(item.ends_at);
  const time = `${start.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })} – ${end.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}`;
  const color = item.job_status==='IN_PROGRESS' ? '#0ea5e9' : item.job_status==='COMPLETE' ? '#22c55e' : '#111';
  return (
    <Pressable onPress={onPress} style={{ paddingVertical:12, borderBottomWidth:1, borderColor:'#eee' }}>
      <Text style={{ fontWeight:'700', color }}>{item.job_title || 'Job'}</Text>
      <Text style={{ opacity:.7 }}>{time}</Text>
      {item.note ? <Text>{item.note}</Text> : null}
    </Pressable>
  );
}
