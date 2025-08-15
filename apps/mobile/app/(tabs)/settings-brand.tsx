import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

export default function SettingsBrandScreen() {
  const [company, setCompany] = useState('');
  const [color, setColor] = useState('#1e3a8a');
  const [logo, setLogo] = useState<string | null>(null);

  const pickLogo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!res.canceled) {
      setLogo(res.assets[0].uri);
    }
  };

  const save = async () => {
    const org_id = 'org-id'; // placeholder
    let logo_url: string | undefined;
    if (logo) {
      const file = await fetch(logo);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const path = `${org_id}/logo.png`;
      await supabase.storage.from('branding-logos').upload(path, bytes, { upsert: true, contentType: 'image/png' });
      logo_url = path;
    }
    await supabase.from('org_features').upsert({ org_id, company_name: company, brand_color: color, logo_url });
  };

  return (
    <View>
      <TextInput placeholder="Company Name" value={company} onChangeText={setCompany} />
      <TextInput placeholder="Brand Color" value={color} onChangeText={setColor} />
      <Button title="Pick Logo" onPress={pickLogo} />
      <Button title="Save" onPress={save} />
    </View>
  );
}
