import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { TEMPLATE_CATALOG, canUseTemplate, type TemplateKey } from '../../features/billing/templates';

export default function BillingScreen(){
  const [templateKey, setTemplateKey] = useState<TemplateKey>('clean');
  const plan: 'free'|'pro' = 'free';
  return (
    <>
      <Text style={{ marginTop:16, fontWeight:'600' }}>Template</Text>
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:8 }}>
        {TEMPLATE_CATALOG.map(t=> (
          <Pressable key={t.key} disabled={!canUseTemplate(plan, t.key)} onPress={()=>setTemplateKey(t.key)}
            style={{ paddingVertical:8, paddingHorizontal:12, borderRadius:12, borderWidth:1, borderColor: templateKey===t.key?'#111':'#ddd', opacity: canUseTemplate(plan, t.key)?1:0.5 }}>
            <Text>{t.name}{t.tier==='pro'?' • Pro':''}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}
