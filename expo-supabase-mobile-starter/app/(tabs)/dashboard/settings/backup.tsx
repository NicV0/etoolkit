import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Button, Card } from '../../../../components/ui';
import { textStyles } from '../../../../lib/theme/utils';
import { theme } from '../../../../lib/theme/tokens';
import { createJsonBackup, shareLatestBackup, restoreFromBackup } from '../../../../lib/backup';

export default function BackupScreen() {
  const [busy, setBusy] = useState(false);

  const doBackup = useCallback(async () => {
    try {
      setBusy(true);
      await createJsonBackup();
      Alert.alert('Backup', 'Backup created.');
    } catch (e: unknown) {
      Alert.alert('Backup failed', String((e as Error)?.message ?? e));
    } finally { setBusy(false); }
  }, []);

  const doShare = useCallback(async () => {
    setBusy(true);
    await shareLatestBackup();
    setBusy(false);
  }, []);

  const doRestore = useCallback(async () => {
    const pick = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (pick.canceled || !pick.assets?.[0]) return;
    setBusy(true);
    await restoreFromBackup(pick.assets[0].uri);
    setBusy(false);
  }, []);

  return (
    <View style={styles.container}>
      <Card variant="elevated" style={{ marginBottom: theme.spacing.lg }}>
        <Text style={[textStyles.h3, { color: theme.colors.text.primary, marginBottom: theme.spacing.md }]}>
          Backups
        </Text>
        <Button title="Create Backup Now" variant="primary" onPress={doBackup} loading={busy} style={{ marginBottom: 8 }} />
        <Button title="Share Latest Backup" variant="outline" onPress={doShare} disabled={busy} style={{ marginBottom: 8 }} />
        <Button title="Restore From File" variant="primary" onPress={doRestore} disabled={busy} style={{ backgroundColor: theme.colors.error }} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg },
});
