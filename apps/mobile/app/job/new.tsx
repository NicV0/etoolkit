import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useOrg } from '../../lib/org';
import { createJob } from '../../features/jobs/api';
import { outboxEnqueue } from '../../lib/offline';

export default function NewJob() {
  const { orgId } = useOrg();
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const onSave = async () => {
    try {
      if (!orgId) return Alert.alert('No org');
      const id = await createJob({ org_id: orgId, client_id: clientId, title, notes });
      Alert.alert('Job created', id);
    } catch {
      await outboxEnqueue({ id: crypto.randomUUID(), type: 'job.create', payload: { org_id: orgId, client_id: clientId, title, notes } });
      Alert.alert('Queued offline', 'Will sync when back online.');
    }
  };

  return (
    <View style={{ padding:16 }}>
      <Text style={{ fontSize:24, fontWeight:'700' }}>New Job</Text>
      <TextInput placeholder='Client ID' value={clientId} onChangeText={setClientId} style={{ borderWidth:1, borderRadius:12, padding:10, marginVertical:8 }} />
      <TextInput placeholder='Title' value={title} onChangeText={setTitle} style={{ borderWidth:1, borderRadius:12, padding:10, marginVertical:8 }} />
      <TextInput placeholder='Notes' value={notes} onChangeText={setNotes} multiline style={{ borderWidth:1, borderRadius:12, padding:10, minHeight:100 }} />
      <Pressable onPress={onSave} style={{ marginTop:12, backgroundColor:'black', padding:12, borderRadius:12, alignSelf:'flex-start' }}>
        <Text style={{ color:'#fff', fontWeight:'600' }}>Save Job</Text>
      </Pressable>
    </View>
  );
}
