import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function BillingTab() {
  const router = useRouter();
  return (
    <View style={{ padding:16 }}>
      <Text style={{ fontSize:24, fontWeight:'700' }}>Billing</Text>
      <Pressable onPress={()=>router.push('/invoice/new')} style={{ marginTop:12 }}>
        <Text style={{ color:'blue' }}>Convert to Invoice</Text>
      </Pressable>
    </View>
  );
}
