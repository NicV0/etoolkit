import React from 'react';
import { View, Text, Pressable } from 'react-native';

type Props = { item: any; onToggle: ()=>void; dragHandle?: React.ReactNode };
export default function TaskItem({ item, onToggle, dragHandle }: Props) {
  return (
    <View style={{ flexDirection:'row', alignItems:'center', gap:12, paddingVertical:10 }}>
      {dragHandle}
      <Pressable onPress={onToggle} style={{ height:22, width:22, borderRadius:6, borderWidth:1, borderColor:'#ccc', backgroundColor: item.done?'#111':'transparent' }} />
      <Text style={{ flex:1, textDecorationLine: item.done?'line-through':'none' }}>{item.title}</Text>
    </View>
  );
}
