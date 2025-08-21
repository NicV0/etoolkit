import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ListItem } from '../../../components/ui/ListItem';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ArrowLeft, Search, User, Phone, Mail } from 'lucide-react-native';

// Mock client data - replace with real data from API
const mockClients = [
  {
    id: '1',
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    email: 'john@example.com',
    company: 'Smith Construction',
    status: 'active'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    phone: '+1 (555) 234-5678',
    email: 'sarah@example.com',
    company: 'Johnson Plumbing',
    status: 'active'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    phone: '+1 (555) 345-6789',
    email: 'mike@example.com',
    company: 'Wilson Electric',
    status: 'active'
  }
];

export default function ClientSelectionScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [clients, setClients] = useState(mockClients);
  const [filteredClients, setFilteredClients] = useState(mockClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Filter clients based on search query
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery)
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  const handleClientSelect = (client: any) => {
    // Return the selected client to the previous screen
    if (returnTo) {
      router.push({
        pathname: returnTo as any,
        params: { selectedClient: JSON.stringify(client) }
      });
    } else {
      // Default behavior - go back
      router.back();
    }
  };

  const handleCreateNewClient = () => {
    router.push({
      pathname: '/clients/new' as any,
      params: { returnTo: returnTo || '/clients/select' }
    });
  };

  const renderClientItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => handleClientSelect(item)}>
      <Card className="mb-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
            {item.company && (
              <Text className="text-sm text-gray-600 mb-1">{item.company}</Text>
            )}
            <View className="flex-row items-center space-x-4">
              <View className="flex-row items-center">
                <Phone size={14} className="text-gray-500 mr-1" />
                <Text className="text-sm text-gray-600">{item.phone}</Text>
              </View>
              <View className="flex-row items-center">
                <Mail size={14} className="text-gray-500 mr-1" />
                <Text className="text-sm text-gray-600">{item.email}</Text>
              </View>
            </View>
          </View>
          <View className="ml-4">
            <View className="bg-green-100 px-2 py-1 rounded-full">
              <Text className="text-xs text-green-800 capitalize">{item.status}</Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <LoadingSpinner text="Loading clients..." />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
            className="mr-3"
          >
            <ArrowLeft size={20} />
          </Button>
          <Text className="text-lg font-semibold text-gray-900">Select Client</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="p-4 bg-white border-b border-gray-200">
        <View className="relative">
          <Search size={20} className="absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="pl-10"
          />
        </View>
      </View>

      {/* Client List */}
      <View className="flex-1 p-4">
        {filteredClients.length > 0 ? (
          <FlatList
            data={filteredClients}
            renderItem={renderClientItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <EmptyState
            icon={<User size={48} className="text-gray-400" />}
            title="No clients found"
            subtitle={searchQuery ? `No clients match "${searchQuery}"` : "You haven't added any clients yet"}
            action={
              <Button onPress={handleCreateNewClient} className="mt-4">
                Add New Client
              </Button>
            }
          />
        )}
      </View>

      {/* Create New Client Button */}
      <View className="p-4 bg-white border-t border-gray-200">
        <Button onPress={handleCreateNewClient} variant="secondary">
          Create New Client
        </Button>
      </View>
    </View>
  );
}
