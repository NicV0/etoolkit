import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Plus, TrendingUp, TrendingDown, DollarSign, Users, FileText } from 'lucide-react-native';

export default function DashboardScreen() {
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Refresh dashboard data
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getBackgroundColor = () => {
    return isDark ? 'bg-gray-900' : 'bg-gray-50';
  };

  const getTextColor = () => {
    return isDark ? 'text-white' : 'text-gray-900';
  };

  const getSubtextColor = () => {
    return isDark ? 'text-gray-400' : 'text-gray-600';
  };

  // Mock data - replace with real data from API
  const kpiData = [
    {
      title: 'Total Revenue',
      value: '$12,450',
      subtitle: 'This month',
      trend: { direction: 'up' as const, value: '+12%' },
      icon: <DollarSign size={24} color="#f97316" />,
    },
    {
      title: 'Active Clients',
      value: '24',
      subtitle: 'Total clients',
      trend: { direction: 'up' as const, value: '+3' },
      icon: <Users size={24} color="#f97316" />,
    },
    {
      title: 'Pending Quotes',
      value: '8',
      subtitle: 'Awaiting approval',
      trend: { direction: 'down' as const, value: '-2' },
      icon: <FileText size={24} color="#f97316" />,
    },
  ];

  const recentActivity = [
    {
      id: '1',
      action: 'Quote sent',
      client: 'John Smith',
      amount: '$2,500',
      time: '2 hours ago',
    },
    {
      id: '2',
      action: 'Payment received',
      client: 'Sarah Johnson',
      amount: '$1,800',
      time: '4 hours ago',
    },
    {
      id: '3',
      action: 'New client added',
      client: 'Mike Wilson',
      amount: '',
      time: '1 day ago',
    },
  ];

  return (
    <SafeAreaView className={`flex-1 ${getBackgroundColor()}`}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          {/* Header */}
          <View className="mb-6">
            <Text className={`text-2xl font-bold ${getTextColor()}`}>
              Dashboard
            </Text>
            <Text className={`text-base ${getSubtextColor()}`}>
              Welcome back! Here's what's happening today.
            </Text>
          </View>

          {/* KPI Cards */}
          <View className="mb-6">
            <Text className={`text-lg font-semibold mb-4 ${getTextColor()}`}>
              Overview
            </Text>
            {kpiData.map((kpi, index) => (
              <Card key={index} className="mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="mr-3">
                      {kpi.icon}
                    </View>
                    <View className="flex-1">
                      <Text className={`text-sm ${getSubtextColor()}`}>
                        {kpi.title}
                      </Text>
                      <Text className={`text-xl font-bold ${getTextColor()}`}>
                        {kpi.value}
                      </Text>
                      <Text className={`text-xs ${getSubtextColor()}`}>
                        {kpi.subtitle}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    {kpi.trend.direction === 'up' ? (
                      <TrendingUp size={16} color="#10b981" />
                    ) : (
                      <TrendingDown size={16} color="#ef4444" />
                    )}
                    <Text
                      className={`text-sm ml-1 ${
                        kpi.trend.direction === 'up' ? 'text-success-500' : 'text-error-500'
                      }`}
                    >
                      {kpi.trend.value}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>

          {/* Quick Actions */}
          <View className="mb-6">
            <Text className={`text-lg font-semibold mb-4 ${getTextColor()}`}>
              Quick Actions
            </Text>
            <View className="flex-row space-x-3">
              <Button
                variant="primary"
                className="flex-1"
                onPress={() => {
                  // TODO: Navigate to new client
                }}
              >
                <Plus size={16} color="white" style={{ marginRight: 8 }} />
                New Client
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onPress={() => {
                  // TODO: Navigate to new quote
                }}
              >
                <FileText size={16} color="#3b82f6" style={{ marginRight: 8 }} />
                New Quote
              </Button>
            </View>
          </View>

          {/* Recent Activity */}
          <View className="mb-6">
            <Text className={`text-lg font-semibold mb-4 ${getTextColor()}`}>
              Recent Activity
            </Text>
            <Card>
              {recentActivity.map((activity) => (
                <View key={activity.id} className="py-3 border-b border-gray-200 last:border-b-0">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className={`font-medium ${getTextColor()}`}>
                        {activity.action}
                      </Text>
                      <Text className={`text-sm ${getSubtextColor()}`}>
                        {activity.client}
                      </Text>
                    </View>
                    <View className="items-end">
                      {activity.amount && (
                        <Text className={`font-medium ${getTextColor()}`}>
                          {activity.amount}
                        </Text>
                      )}
                      <Text className={`text-xs ${getSubtextColor()}`}>
                        {activity.time}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
