import React, { useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../theme/ThemeProvider';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ListItem } from '../../../components/ui/ListItem';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Plus, Search, User, Phone, Mail } from 'lucide-react-native';

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  lastContact?: string;
}

export default function ClientsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with real data from API
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'John Smith',
      phone: '+1 (555) 123-4567',
      email: 'john@example.com',
      status: 'active',
      lastContact: '2 days ago',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      phone: '+1 (555) 987-6543',
      email: 'sarah@example.com',
      status: 'active',
      lastContact: '1 week ago',
    },
    {
      id: '3',
      name: 'Mike Wilson',
      phone: '+1 (555) 456-7890',
      email: 'mike@example.com',
      status: 'inactive',
      lastContact: '3 weeks ago',
    },
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Refresh clients data
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone?.includes(searchQuery)
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

  const renderClient = ({ item }: { item: Client }) => (
    <ListItem
      title={item.name}
      subtitle={item.email}
      leftIcon={<User size={20} color={isDark ? '#9ca3af' : '#6b7280'} />}
      onPress={() => router.push(`/clients/${item.id}`)}
      showChevron
    >
      <View className="flex-row items-center mt-1">
        {item.phone && (
          <View className="flex-row items-center mr-4">
            <Phone size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
            <Text className={`text-xs ml-1 ${getSubtextColor()}`}>
              {item.phone}
            </Text>
          </View>
        )}
        {item.email && (
          <View className="flex-row items-center">
            <Mail size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
            <Text className={`text-xs ml-1 ${getSubtextColor()}`}>
              {item.email}
            </Text>
          </View>
        )}
      </View>
    </ListItem>
  );

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${getBackgroundColor()}`}>
        <LoadingSpinner text="Loading clients..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${getBackgroundColor()}`}>
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className={`text-2xl font-bold ${getTextColor()}`}>
            Clients
          </Text>
          <Text className={`text-base ${getSubtextColor()}`}>
            Manage your client relationships
          </Text>
        </View>

        {/* Search */}
        <View className="mb-4">
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={20} color={isDark ? '#9ca3af' : '#6b7280'} />}
          />
        </View>

        {/* Add Client Button */}
        <View className="mb-4">
          <Button
            variant="primary"
            onPress={() => router.push('/clients/new')}
          >
            <Plus size={16} color="white" style={{ marginRight: 8 }} />
            Add New Client
          </Button>
        </View>

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <EmptyState
            title={searchQuery ? "No clients found" : "No clients yet"}
            description={
              searchQuery 
                ? "Try adjusting your search terms"
                : "Get started by adding your first client"
            }
            action={
              <Button
                variant="primary"
                onPress={() => router.push('/clients/new')}
              >
                <Plus size={16} color="white" style={{ marginRight: 8 }} />
                Add First Client
              </Button>
            }
          />
        ) : (
          <Card padding="none" className="flex-1">
            <FlatList
              data={filteredClients}
              renderItem={renderClient}
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
