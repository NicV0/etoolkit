import React from 'react';
import { View, Button, Share, Alert } from 'react-native';
import { createPublicLink } from '../../features/public-links/api';
import { renderEmail } from '../../lib/email-templates';
import { sendEmail } from '../../features/email/api';

export default function InvoiceScreen({ route }: any) {
  const { id } = route.params;
  const org_id = 'org-id'; // placeholder

  const copyLink = async () => {
    const url = await createPublicLink('invoice', id, org_id);
    await Share.share({ message: url, url });
  };

  const sendMail = async () => {
    const url = await createPublicLink('invoice', id, org_id);
    const email = 'client@example.com';
    const { subject, html, text } = renderEmail({ type: 'invoice', company: 'Company', recipient: 'Client', link: url, number: 'INV-1', total: '$0.00' });
    try {
      await sendEmail({ to: email, subject, html, text });
      Alert.alert('Email sent');
    } catch (e: any) {
      Alert.alert('Error', String(e));
    }
  };

  return (
    <View>
      <Button title="Copy Link" onPress={copyLink} />
      <Button title="Send Email" onPress={sendMail} />
    </View>
  );
}
