import React from 'react';
import { ScrollView, View, RefreshControl, Text } from 'react-native';
import { router } from 'expo-router';
import { Settings, Plus } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

// Components
import { Card, CardContent } from '../../../components/ui/Card';
import { Button, GhostButton } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

// Theme and state
import { theme } from '../../../lib/theme/tokens';
import { textStyles } from '../../../lib/theme/utils';
import { useSettingsStore } from '../../../lib/state/store';
import { useUIStore } from '../../../lib/state/store';

// Utils
import { formatCurrencySafe } from '../../../lib/utils/number';

// Types
interface DashboardStats {
  accountsReceivable: number;
  openQuotes: number;
  activeClients: number;
  mtdRevenue: number;
}

interface RecentActivity {
  id: string;
  type: 'invoice' | 'quote' | 'client';
  title: string;
  subtitle: string;
  timestamp: string;
  amount?: number;
}

export default function Dashboard() {
  const { organization } = useSettingsStore();
  const { addToast } = useUIStore();
  
  // Mock data - will be replaced with real data from queries
  const stats: DashboardStats = {
    accountsReceivable: 38210,
    openQuotes: 3,
    activeClients: 12,
    mtdRevenue: 15420,
  };
  
  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'invoice',
      title: 'Invoice #INV-001',
      subtitle: 'Sent to John Smith',
      timestamp: '2 hours ago',
      amount: 2500,
    },
    {
      id: '2',
      type: 'quote',
      title: 'Quote #QT-002',
      subtitle: 'Created for ACME Corp',
      timestamp: '1 day ago',
      amount: 1800,
    },
    {
      id: '3',
      type: 'client',
      title: 'New Client Added',
      subtitle: 'Sarah Johnson - sarah@techstart.com',
      timestamp: '2 days ago',
    },
  ];

  const [refreshing, setRefreshing] = React.useState(false);
  const [loading] = React.useState(false);

  // Handle refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // TODO: Implement refresh logic
    setTimeout(() => {
      setRefreshing(false);
      addToast({
        type: 'success',
        message: 'Dashboard refreshed',
      });
    }, 1000);
  }, [addToast]);

  // Handle quick actions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-invoice':
        router.push('/(tabs)/billing/new');
        break;
      case 'new-quote':
        router.push('/(tabs)/billing/new?type=quote');
        break;
      case 'new-client':
        router.push('/(tabs)/clients/new');
        break;
      case 'ask-kitai':
        router.push('/(tabs)/kitai');
        break;
      default:
        break;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return formatCurrencySafe(amount, 'USD');
  };

  // Get activity icon color
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'invoice':
        return theme.colors.success;
      case 'quote':
        return theme.colors.warning;
      case 'client':
        return theme.colors.primary;
      default:
        return theme.colors.text.secondary;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: theme.spacing.screen,
        paddingTop: 60, // Account for status bar
        paddingBottom: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}>
        <View>
          <Text style={[textStyles.h2, { marginBottom: theme.spacing.xs }]}>
            Dashboard
          </Text>
          {organization && (
            <Text style={[textStyles.body, { color: theme.colors.text.secondary }]}>
              {organization.name}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/dashboard/settings')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.surface,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Settings size={20} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.spacing.screen }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Summary Cards Grid */}
        <View style={{ marginBottom: theme.spacing['2xl'] }}>
          <Text style={[textStyles.section, { marginBottom: theme.spacing.lg }]}>
            Summary
          </Text>
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: theme.spacing.md 
          }}>
            {/* Accounts Receivable */}
            <Card style={{ flex: 1, minWidth: 150 }}>
              <CardContent>
                <Text style={[textStyles.h3, { marginBottom: theme.spacing.xs }]}>
                  {formatCurrency(stats.accountsReceivable)}
                </Text>
                <Text style={[textStyles.caption, { color: theme.colors.text.secondary }]}>
                  Accounts Receivable
                </Text>
              </CardContent>
            </Card>

            {/* Open Quotes */}
            <Card style={{ flex: 1, minWidth: 150 }}>
              <CardContent>
                <Text style={[textStyles.h3, { marginBottom: theme.spacing.xs }]}>
                  {stats.openQuotes}
                </Text>
                <Text style={[textStyles.caption, { color: theme.colors.text.secondary }]}>
                  Open Quotes
                </Text>
              </CardContent>
            </Card>

            {/* Active Clients */}
            <Card style={{ flex: 1, minWidth: 150 }}>
              <CardContent>
                <Text style={[textStyles.h3, { marginBottom: theme.spacing.xs }]}>
                  {stats.activeClients}
                </Text>
                <Text style={[textStyles.caption, { color: theme.colors.text.secondary }]}>
                  Active Clients
                </Text>
              </CardContent>
            </Card>

            {/* MTD Revenue */}
            <Card style={{ flex: 1, minWidth: 150 }}>
              <CardContent>
                <Text style={[textStyles.h3, { marginBottom: theme.spacing.xs }]}>
                  {formatCurrency(stats.mtdRevenue)}
                </Text>
                <Text style={[textStyles.caption, { color: theme.colors.text.secondary }]}>
                  MTD Revenue
                </Text>
              </CardContent>
            </Card>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: theme.spacing['2xl'] }}>
          <Text style={[textStyles.section, { marginBottom: theme.spacing.lg }]}>
            Quick Actions
          </Text>
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: theme.spacing.md 
          }}>
            <Button
              title="New Invoice"
              onPress={() => handleQuickAction('new-invoice')}
              leftIcon={<Plus size={16} color={theme.colors.text.inverse} />}
              style={{ flex: 1, minWidth: 150 }}
            />
            <Button
              title="New Quote"
              onPress={() => handleQuickAction('new-quote')}
              leftIcon={<Plus size={16} color={theme.colors.text.inverse} />}
              style={{ flex: 1, minWidth: 150 }}
            />
            <Button
              title="New Client"
              onPress={() => handleQuickAction('new-client')}
              leftIcon={<Plus size={16} color={theme.colors.text.inverse} />}
              style={{ flex: 1, minWidth: 150 }}
            />
            <GhostButton
              title="Ask KitAI"
              onPress={() => handleQuickAction('ask-kitai')}
              style={{ flex: 1, minWidth: 150 }}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View>
          <Text style={[textStyles.section, { marginBottom: theme.spacing.lg }]}>
            Recent Activity
          </Text>
          {recentActivity.map((activity) => (
            <Card
              key={activity.id}
              variant="interactive"
              onPress={() => {
                // Handle activity press
                addToast({
                  type: 'info',
                  message: `Opening ${activity.title}`,
                });
              }}
              style={{ marginBottom: theme.spacing.md }}
            >
              <CardContent>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[textStyles.bodyStrong, { marginBottom: theme.spacing.xs }]}>
                      {activity.title}
                    </Text>
                    <Text style={[textStyles.body, { color: theme.colors.text.secondary, marginBottom: theme.spacing.xs }]}>
                      {activity.subtitle}
                    </Text>
                    <Text style={[textStyles.caption, { color: theme.colors.text.muted }]}>
                      {activity.timestamp}
                    </Text>
                  </View>
                  {activity.amount && (
                    <Text style={[textStyles.bodyStrong, { color: getActivityColor(activity.type) }]}>
                      {formatCurrency(activity.amount)}
                    </Text>
                  )}
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Loading overlay */}
      {loading && (
        <LoadingSpinner size="large" fullScreen />
      )}
    </View>
  );
}
