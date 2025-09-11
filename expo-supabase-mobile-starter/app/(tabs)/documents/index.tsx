------- SEARCH
export default function Dashboard() {
=======
export default function Dashboard() {
+++++++ REPLACE

------- SEARCH
  return (
-    <View style={{ flex: 1, backgroundColor: colors.background }}>
+    <View style={{ flex: 1, backgroundColor: colors.background }} testID="screen.dashboard">
      <Header title="Dashboard" subtitle="Welcome back! Here's what's happening today." />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Accounts Receivable */}
        <Card className="mb-3" style={{ paddingVertical: 16 }}>
          <Text style={{ color: colors.text.secondary, fontFamily: 'Inter_600SemiBold' }}>
            Accounts Receivable
          </Text>
+++++++ REPLACEimport React from 'react';
import { View, Text } from 'react-native';
import Header from '../../../components/layout/Header';
import { colors } from '../../../lib/theme/tokens';

export default function DocumentsList() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID="screen.documents.list">
      <Header title="Documents" />
      <View style={{ padding: 16 }}>
        <Text style={{ color: colors.text.secondary }}>
          Documents list placeholder. Filters and search coming in Phase 4.
        </Text>
      </View>
    </View>
  );
}
