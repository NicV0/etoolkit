import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  DollarSign,
  Plus,
  ArrowRight,
  Clock,
  Calendar,
  Settings
} from 'lucide-react-native';
import { designSystem } from '../../theme/design-system';

export default function DashboardScreen() {
  // KPI Data
  const kpis = [
    {
      title: 'Accounts Receivable',
      value: '$12,450',
      subtitle: 'Unpaid balances on invoices',
      trend: { direction: 'up' as const, value: '+12%' },
      icon: <DollarSign size={24} color={designSystem.colors.primary[500]} />,
    },
    {
      title: 'Open Quotes',
      value: '8',
      subtitle: 'Awaiting client approval',
      trend: { direction: 'down' as const, value: '-2' },
      icon: <FileText size={24} color={designSystem.colors.primary[500]} />,
    },
    {
      title: 'Clients',
      value: '24',
      subtitle: 'Total active clients',
      trend: { direction: 'up' as const, value: '+3' },
      icon: <Users size={24} color={designSystem.colors.primary[500]} />,
    },
  ];

  // Quick Actions
  const quickActions = [
    {
      title: 'New Client',
      subtitle: 'Add a new client',
      icon: <Users size={20} color={designSystem.colors.primary[500]} />,
      onPress: () => router.push('/clients/new'),
    },
    {
      title: 'Create Quote',
      subtitle: 'Generate a new quote',
      icon: <FileText size={20} color={designSystem.colors.primary[500]} />,
      onPress: () => router.push('/billing/quotes/new'),
    },
    {
      title: 'New Invoice',
      subtitle: 'Create an invoice',
      icon: <DollarSign size={20} color={designSystem.colors.primary[500]} />,
      onPress: () => router.push('/billing/invoices/new'),
    },
  ];

  // Recent Activity
  const recentActivity = [
    {
      type: 'Quote sent',
      client: 'John Smith',
      amount: '$2,500',
      time: '2 hours ago',
      icon: <FileText size={16} color={designSystem.colors.primary[500]} />,
    },
    {
      type: 'Payment received',
      client: 'Sarah Johnson',
      amount: '$1,800',
      time: '4 hours ago',
      icon: <DollarSign size={16} color={designSystem.colors.success[500]} />,
    },
    {
      type: 'New client added',
      client: 'Mike Wilson',
      amount: '',
      time: '6 hours ago',
      icon: <Users size={16} color={designSystem.colors.primary[500]} />,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fb' }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: designSystem.spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: designSystem.spacing.lg 
        }}>
          <Text style={{
            fontSize: designSystem.typography.fontSize['3xl'],
            fontWeight: designSystem.typography.fontWeight.bold,
            color: designSystem.colors.text.primary,
          }}>
            Dashboard
          </Text>
          <Pressable
            onPress={() => router.push('/settings')}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: designSystem.borderRadius.lg,
              padding: designSystem.spacing.sm,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.6)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Settings size={20} color={designSystem.colors.text.secondary} />
          </Pressable>
        </View>

        {/* KPI Cards - Apple-style frosted glass */}
        <View style={{ marginBottom: designSystem.spacing.xl }}>
          {kpis.map((kpi, index) => (
            <View
              key={index}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: designSystem.borderRadius.xl,
                padding: designSystem.spacing.lg,
                marginBottom: designSystem.spacing.md,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.6)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 24,
                elevation: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: designSystem.borderRadius.lg,
                    backgroundColor: designSystem.colors.primary[50],
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: designSystem.spacing.md,
                  }}>
                    {kpi.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.text.secondary,
                      fontWeight: designSystem.typography.fontWeight.medium,
                    }}>
                      {kpi.title}
                    </Text>
                    <Text style={{
                      fontSize: designSystem.typography.fontSize['2xl'],
                      fontWeight: designSystem.typography.fontWeight.bold,
                      color: designSystem.colors.text.primary,
                    }}>
                      {kpi.value}
                    </Text>
                    <Text style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.text.tertiary,
                    }}>
                      {kpi.subtitle}
                    </Text>
                  </View>
                </View>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: kpi.trend.direction === 'up' 
                    ? designSystem.colors.success[50] 
                    : designSystem.colors.error[50],
                  paddingHorizontal: designSystem.spacing.sm,
                  paddingVertical: designSystem.spacing.xs,
                  borderRadius: designSystem.borderRadius.full,
                }}>
                  {kpi.trend.direction === 'up' ? (
                    <TrendingUp size={16} color={designSystem.colors.success[500]} />
                  ) : (
                    <TrendingDown size={16} color={designSystem.colors.error[500]} />
                  )}
                  <Text style={{
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium,
                    color: kpi.trend.direction === 'up' 
                      ? designSystem.colors.success[500] 
                      : designSystem.colors.error[500],
                    marginLeft: designSystem.spacing.xs,
                  }}>
                    {kpi.trend.value}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: designSystem.spacing.xl }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: designSystem.spacing.md,
          }}>
            <Text style={{
              fontSize: designSystem.typography.fontSize.lg,
              fontWeight: designSystem.typography.fontWeight.semibold,
              color: designSystem.colors.text.primary,
            }}>
              Quick Actions
            </Text>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{
                fontSize: designSystem.typography.fontSize.sm,
                color: designSystem.colors.primary[500],
                fontWeight: designSystem.typography.fontWeight.medium,
                marginRight: designSystem.spacing.xs,
              }}>
                View All
              </Text>
              <ArrowRight size={16} color={designSystem.colors.primary[500]} />
            </Pressable>
          </View>

          {quickActions.map((action, index) => (
            <Pressable
              key={index}
              onPress={action.onPress}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: designSystem.borderRadius.xl,
                padding: designSystem.spacing.lg,
                marginBottom: designSystem.spacing.sm,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.6)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: designSystem.borderRadius.lg,
                    backgroundColor: designSystem.colors.primary[50],
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: designSystem.spacing.md,
                  }}>
                    {action.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: designSystem.typography.fontSize.base,
                      fontWeight: designSystem.typography.fontWeight.semibold,
                      color: designSystem.colors.text.primary,
                    }}>
                      {action.title}
                    </Text>
                    <Text style={{
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.text.secondary,
                    }}>
                      {action.subtitle}
                    </Text>
                  </View>
                </View>
                <ArrowRight size={20} color={designSystem.colors.gray[400]} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={{ marginBottom: designSystem.spacing.xl }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: designSystem.spacing.md,
          }}>
            <Text style={{
              fontSize: designSystem.typography.fontSize.lg,
              fontWeight: designSystem.typography.fontWeight.semibold,
              color: designSystem.colors.text.primary,
            }}>
              Recent Activity
            </Text>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{
                fontSize: designSystem.typography.fontSize.sm,
                color: designSystem.colors.primary[500],
                fontWeight: designSystem.typography.fontWeight.medium,
                marginRight: designSystem.spacing.xs,
              }}>
                View All
              </Text>
              <ArrowRight size={16} color={designSystem.colors.primary[500]} />
            </Pressable>
          </View>

          {recentActivity.map((activity, index) => (
            <View
              key={index}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: designSystem.borderRadius.xl,
                padding: designSystem.spacing.lg,
                marginBottom: designSystem.spacing.sm,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.6)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: designSystem.borderRadius.lg,
                    backgroundColor: designSystem.colors.gray[100],
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: designSystem.spacing.md,
                  }}>
                    {activity.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: designSystem.typography.fontSize.base,
                      fontWeight: designSystem.typography.fontWeight.medium,
                      color: designSystem.colors.text.primary,
                    }}>
                      {activity.type}
                    </Text>
                    <Text style={{
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.text.secondary,
                    }}>
                      {activity.client}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {activity.amount && (
                    <Text style={{
                      fontSize: designSystem.typography.fontSize.base,
                      fontWeight: designSystem.typography.fontWeight.semibold,
                      color: designSystem.colors.text.primary,
                    }}>
                      {activity.amount}
                    </Text>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: designSystem.spacing.xs }}>
                    <Clock size={12} color={designSystem.colors.text.tertiary} />
                    <Text style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.text.tertiary,
                      marginLeft: designSystem.spacing.xs,
                    }}>
                      {activity.time}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
