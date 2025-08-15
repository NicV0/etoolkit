import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getJob } from '../../features/jobs/api';

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<any>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getJob(String(id))
      .then(setJob)
      .catch((e: any) => Alert.alert('Load failed', e.message || ''))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator />;
  if (!job) return null;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>{job.title}</Text>
      <Text style={{ marginVertical: 8 }}>Status: {job.status}</Text>
      {job.notes ? <Text>{job.notes}</Text> : null}
      <Pressable onPress={() => router.push('/(tabs)/schedule')} style={{ marginTop: 12 }}>
        <Text style={{ color: 'blue' }}>View Schedule</Text>
      </Pressable>
    </View>
  );
}
