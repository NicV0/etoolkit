import { Pressable, Text, Alert, Share } from 'react-native';
import { useCallback } from 'react';
import { createPaymentLink } from '../../features/stripe/api';
import * as Linking from 'expo-linking';

const FUNCTIONS_HOST = 'https://<ref>.functions.supabase.co';

export default function InvoiceDetail({ route }: any) {
  const { id } = route.params;
  const sendPayLink = useCallback(async () => {
    try {
      const { url } = await createPaymentLink(FUNCTIONS_HOST, id as string);
      await Share.share({ message: url, url });
    } catch (e: any) {
      Alert.alert('Failed to create link', e.message || 'Unknown error');
    }
  }, [id]);

  return (
    <Pressable onPress={sendPayLink}>
      <Text>Send Pay Link</Text>
    </Pressable>
  );
}
