import React, { useState } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../theme/ThemeProvider';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ListItem } from '../../../components/ui/ListItem';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Plus, FileText, Receipt, DollarSign, Calendar } from 'lucide-react-native';

interface BillingItem {
  id: string;
  type: 'quote' | 'invoice';
  number: string;
  clientName: string;
  amount: number;
  status: 'draft' | 'sent' | 'approved' | 'paid' | 'overdue';
  dueDate?: string;
  issueDate: string;
}

export default function BillingScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'quotes' | 'invoices'>('quotes');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with real data from API
  const [billingItems, setBillingItems] = useState<BillingItem[]>([
    {
      id: '1',
      type: 'quote',
      number: 'Q-2024-001',
      clientName: 'John Smith',
      amount: 2500,
      status: 'sent',
      issueDate: '2024-01-15',
    },
    {
      id: '2',
      type: 'invoice',
      number: 'INV-2024-001',
      clientName: 'Sarah Johnson',
      amount: 1800,
      status: 'paid',
      dueDate: '2024-01-20',
      issueDate: '2024-01-05',
    },
    {
      id: '3',
      type: 'invoice',
      number: 'INV-2024-002',
      clientName: 'Mike Wilson',
      amount: 3200,
      status: 'overdue',
      dueDate: '2024-01-10',
      issueDate: '2024-01-01',
    },
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Refresh billing data
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredItems = billingItems.filter(item => 
    activeTab === 'quotes' ? item.type === 'quote' : item.type === 'invoice'
  );

  const getBackgroundColor = () => {
    return isDark ? 'bg-gray-900' : 'bg-gray-50';
  };

  const getTextColor = () => {
    return isDark ? 'text-white' : 'text-gray-900';
  };

  const getSubtextColor = () => {
    return isDark ? 'text-gray-400' : 'text-gray-600';
  };

  const getStatusBadgeVariant = (status: BillingItem['status']) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'sent':
        return 'primary';
      case 'approved':
        return 'success';
      case 'paid':
        return 'success';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: BillingItem['status']) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'sent':
        return 'Sent';
      case 'approved':
        return 'Approved';
      case 'paid':
        return 'Paid';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  const renderBillingItem = ({ item }: { item: BillingItem }) => (
    <ListItem
      title={`${item.number} - ${item.clientName}`}
      subtitle={`$${item.amount.toLocaleString()}`}
      leftIcon={
        item.type === 'quote' ? (
          <FileText size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
        ) : (
          <Receipt size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
        )
      }
      rightIcon={
        <Badge variant={getStatusBadgeVariant(item.status)} size="sm">
          {getStatusText(item.status)}
        </Badge>
      }
      onPress={() => router.push(`/billing/${item.type}/${item.id}`)}
      showChevron
    >
      <View className="flex-row items-center mt-1">
        <Calendar size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
        <Text className={`text-xs ml-1 ${getSubtextColor()}`}>
          {item.issueDate}
        </Text>
        {item.dueDate && (
          <>
            <Text className={`text-xs mx-2 ${getSubtextColor()}`}>•</Text>
            <Text className={`text-xs ${getSubtextColor()}`}>
              Due: {item.dueDate}
            </Text>
          </>
        )}
      </View>
    </ListItem>
  );

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${getBackgroundColor()}`}>
        <LoadingSpinner text="Loading billing..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${getBackgroundColor()}`}>
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className={`text-2xl font-bold ${getTextColor()}`}>
            Billing
          </Text>
          <Text className={`text-base ${getSubtextColor()}`}>
            Manage quotes and invoices
          </Text>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row mb-4 bg-gray-200 rounded-lg p-1">
          <Pressable
            className={`flex-1 py-2 px-4 rounded-md ${activeTab === 'quotes' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('quotes')}
          >
            <Text className={`text-center font-medium ${activeTab === 'quotes' ? getTextColor() : getSubtextColor()}`}>
              Quotes
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2 px-4 rounded-md ${activeTab === 'invoices' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('invoices')}
          >
            <Text className={`text-center font-medium ${activeTab === 'invoices' ? getTextColor() : getSubtextColor()}`}>
              Invoices
            </Text>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View className="mb-4">
          <View className="flex-row space-x-3">
            <Button
              variant="primary"
              className="flex-1"
              onPress={() => router.push('/billing/quotes/new')}
            >
              <Plus size={16} color="white" style={{ marginRight: 8 }} />
              New Quote
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onPress={() => router.push('/billing/invoices/new')}
            >
              <Receipt size={16} color="#3b82f6" style={{ marginRight: 8 }} />
              New Invoice
            </Button>
          </View>
        </View>

        {/* Billing Items List */}
        {filteredItems.length === 0 ? (
          <EmptyState
            title={`No ${activeTab} yet`}
            description={`Get started by creating your first ${activeTab.slice(0, -1)}`}
            action={
              <Button
                variant="primary"
                onPress={() => router.push(`/billing/${activeTab}/new`)}
              >
                <Plus size={16} color="white" style={{ marginRight: 8 }} />
                Create {activeTab.slice(0, -1)}
              </Button>
            }
          />
        ) : (
          <Card padding="none" className="flex-1">
            <FlatList
              data={filteredItems}
              renderItem={renderBillingItem}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              showsVerticalScrollIndicator={false}
            />
          </Card>
        )}
      </View>
    </SafeAreaView>
  );
}
