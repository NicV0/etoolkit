import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../../lib/theme/tokens';
import Button from './Button';

export const LockScreen: React.FC<{ onUnlock: () => void; tryBiometric: () => Promise<void> }> = ({ onUnlock, tryBiometric }) => {
  return (
    <View style={{ flex: 1, backgroundColor: theme.semantic.colors.background.base, justifyContent: 'center', alignItems: 'center', padding: theme.semantic.spacing.lg }}>
      <Text style={{ color: theme.semantic.colors.text.primary, fontSize: theme.semantic.type.section, marginBottom: theme.semantic.spacing.lg }}>Locked</Text>
      <Button title="Use biometrics" onPress={tryBiometric} style={{ marginBottom: theme.semantic.spacing.md }} />
      <Button title="Unlock (dev)" onPress={onUnlock} variant="secondary" />
    </View>
  );
};

export default LockScreen;
