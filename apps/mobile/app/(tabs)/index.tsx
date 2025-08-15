import { View, Text } from 'react-native';
import { OrgProvider, useOrg } from '../../lib/org';

function Home() {
  const { orgId, loading } = useOrg();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{loading ? 'Loading...' : `Org: ${orgId}`}</Text>
    </View>
  );
}

export default function Tabs() {
  return (
    <OrgProvider>
      <Home />
    </OrgProvider>
  );
}
