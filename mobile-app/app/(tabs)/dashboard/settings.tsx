import React from 'react';
import { ScrollView, Text, View, Image, Alert } from 'react-native';
import { Header } from '../../../components/layout/Header';
import { colors } from '../../../lib/theme/tokens';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useSettings } from '../../../lib/state/settings';
import * as ImagePicker from 'expo-image-picker';

export default function SettingsScreen() {
  const { settings, setSettings } = useSettings();

  const pickLogo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled && res.assets && res.assets[0] && res.assets[0].uri) {
      setSettings({ logoUri: res.assets[0].uri });
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <Header title="Settings" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: colors.textMuted, marginBottom: 8 }}>Organization</Text>
        <Input
          label="Organization Name"
          value={settings.orgName}
          onChangeText={(t: string) => setSettings({ orgName: t })}
        />
        <Button title="Upload Logo" onPress={pickLogo} className="mt-2" />
        {settings.logoUri ? (
          <Image
            source={{ uri: settings.logoUri }}
            style={{ width: 100, height: 100, borderRadius: 8, marginTop: 12 }}
          />
        ) : null}
        <View className="h-6" />
        <Button title="Save" onPress={() => Alert.alert('Saved')} />
      </ScrollView>
    </View>
  );
}