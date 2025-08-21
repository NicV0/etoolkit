import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Settings,
  Users
} from 'lucide-react-native';
import { designSystem } from '../../../theme/design-system';
import { SkeletonList, ErrorMessage, AnimatedButton, AnimatedListItem } from '../../../components/ui';

// Mock client data - replace with real data from API
const mockClients = [
  {
    id: '1',
    name: 'John Smith',
    company: 'Smith Construction',
    phone: '+1 (555) 123-4567',
    email: 'john@smithconstruction.com',
    address: '123 Main St, Anytown, ST 12345',
    status: 'active',
    totalQuotes: 5,
    totalInvoices: 3,
    lastContact: '2024-01-15'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    company: 'Johnson Renovations',
    phone: '+1 (555) 987-6543',
    email: 'sarah@johnsonreno.com',
    address: '456 Oak Ave, Somewhere, ST 67890',
    status: 'active',
    totalQuotes: 3,
    totalInvoices: 2,
    lastContact: '2024-01-10'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    company: 'Wilson Builders',
    phone: '+1 (555) 456-7890',
    email: 'mike@wilsonbuilders.com',
    address: '789 Pine Rd, Elsewhere, ST 11111',
    status: 'prospect',
    totalQuotes: 1,
    totalInvoices: 0,
    lastContact: '2024-01-05'
  }
];

export default function ClientsScreen() {
  const [clients, setClients] = useState(mockClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    setHasError(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setClients(mockClients);
    } catch (error) {
      setHasError(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  const retryLoad = () => {
    setIsLoading(true);
    setHasError(false);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderClientCard = ({ item: client, index }: { item: typeof mockClients[0], index: number }) => (
    <AnimatedListItem
      index={index}
      onPress={() => router.push(`/clients/${client.id}`)}
      style={{ marginBottom: designSystem.spacing.sm }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: designSystem.spacing.md }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: designSystem.borderRadius.lg,
          backgroundColor: designSystem.colors.primary[50],
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: designSystem.spacing.md,
        }}>
          <User size={24} color={designSystem.colors.primary[500]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: designSystem.typography.fontSize.lg,
            fontWeight: designSystem.typography.fontWeight.semibold,
            color: designSystem.colors.text.primary,
            marginBottom: designSystem.spacing.xs,
          }}>
            {client.name}
          </Text>
          <Text style={{
            fontSize: designSystem.typography.fontSize.sm,
            color: designSystem.colors.text.secondary,
            marginBottom: designSystem.spacing.xs,
          }}>
            {client.company}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: designSystem.spacing.xs }}>
            <Phone size={14} color={designSystem.colors.text.tertiary} />
            <Text style={{
              fontSize: designSystem.typography.fontSize.sm,
              color: designSystem.colors.text.tertiary,
              marginLeft: designSystem.spacing.xs,
            }}>
              {client.phone}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Mail size={14} color={designSystem.colors.text.tertiary} />
            <Text style={{
              fontSize: designSystem.typography.fontSize.sm,
              color: designSystem.colors.text.tertiary,
              marginLeft: designSystem.spacing.xs,
            }}>
              {client.email}
            </Text>
          </View>
        </View>
        <View style={{
          backgroundColor: client.status === 'active' 
            ? designSystem.colors.success[50] 
            : designSystem.colors.warning[50],
          borderRadius: designSystem.borderRadius.md,
          paddingHorizontal: designSystem.spacing.sm,
          paddingVertical: designSystem.spacing.xs,
        }}>
          <Text style={{
            fontSize: designSystem.typography.fontSize.xs,
            fontWeight: designSystem.typography.fontWeight.medium,
            color: client.status === 'active' 
              ? designSystem.colors.success[600] 
              : designSystem.colors.warning[600],
            textTransform: 'uppercase',
          }}>
            {client.status}
          </Text>
        </View>
      </View>
      
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        paddingTop: designSystem.spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            fontSize: designSystem.typography.fontSize.lg,
            fontWeight: designSystem.typography.fontWeight.bold,
            color: designSystem.colors.text.primary,
          }}>
            {client.totalQuotes}
          </Text>
          <Text style={{
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.text.tertiary,
          }}>
            Quotes
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            fontSize: designSystem.typography.fontSize.lg,
            fontWeight: designSystem.typography.fontWeight.bold,
            color: designSystem.colors.text.primary,
          }}>
            {client.totalInvoices}
          </Text>
          <Text style={{
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.text.tertiary,
          }}>
            Invoices
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            fontSize: designSystem.typography.fontSize.sm,
            color: designSystem.colors.text.secondary,
          }}>
            {new Date(client.lastContact).toLocaleDateString()}
          </Text>
          <Text style={{
            fontSize: designSystem.typography.fontSize.xs,
            color: designSystem.colors.text.tertiary,
          }}>
            Last Contact
          </Text>
        </View>
      </View>
    </AnimatedListItem>
  );

  if (hasError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fb' }}>
        <View style={{ flex: 1, padding: designSystem.spacing.md }}>
          <ErrorMessage
            title="Failed to load clients"
            message="There was an error loading your clients. Please check your connection and try again."
            onRetry={retryLoad}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f7fb' }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ 
          padding: designSystem.spacing.md,
          paddingBottom: designSystem.spacing.sm,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: designSystem.spacing.md,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: designSystem.borderRadius.lg,
                backgroundColor: designSystem.colors.primary[50],
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: designSystem.spacing.md,
              }}>
                <Users size={24} color={designSystem.colors.primary[500]} />
              </View>
              <View>
                <Text style={{
                  fontSize: designSystem.typography.fontSize['3xl'],
                  fontWeight: designSystem.typography.fontWeight.bold,
                  color: designSystem.colors.text.primary,
                }}>
                  Clients
                </Text>
                <Text style={{
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.text.secondary,
                }}>
                  {clients.length} total clients
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: designSystem.spacing.sm }}>
              <AnimatedButton
                title=""
                onPress={() => router.push('/settings')}
                variant="secondary"
                size="sm"
                icon={<Settings size={20} color={designSystem.colors.text.secondary} />}
              />
              <AnimatedButton
                title=""
                onPress={() => router.push('/clients/new')}
                variant="primary"
                size="sm"
                icon={<Plus size={20} color="#ffffff" />}
              />
            </View>
          </View>

          {/* Search */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: designSystem.borderRadius.xl,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.6)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: designSystem.spacing.md,
          }}>
            <Search size={20} color={designSystem.colors.text.tertiary} />
            <TextInput
              style={{
                flex: 1,
                paddingVertical: designSystem.spacing.md,
                paddingHorizontal: designSystem.spacing.sm,
                fontSize: designSystem.typography.fontSize.base,
                color: designSystem.colors.text.primary,
              }}
              placeholder="Search clients..."
              placeholderTextColor={designSystem.colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={{ flex: 1, padding: designSystem.spacing.md }}>
            <SkeletonList count={5} cardLines={4} />
          </View>
        ) : (
          <FlatList
            data={filteredClients}
            renderItem={renderClientCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: designSystem.spacing.md }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={designSystem.colors.primary[500]}
              />
            }
            ListEmptyComponent={
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: designSystem.borderRadius.xl,
                padding: designSystem.spacing.xl,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.6)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}>
                <Users size={48} color={designSystem.colors.gray[400]} />
                <Text style={{
                  fontSize: designSystem.typography.fontSize.lg,
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  color: designSystem.colors.text.primary,
                  marginTop: designSystem.spacing.md,
                  marginBottom: designSystem.spacing.xs,
                }}>
                  {searchQuery ? 'No clients found' : 'No clients yet'}
                </Text>
                <Text style={{
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.text.secondary,
                  textAlign: 'center',
                  marginBottom: designSystem.spacing.lg,
                }}>
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Get started by adding your first client'
                  }
                </Text>
                <AnimatedButton
                  title="Add Client"
                  onPress={() => router.push('/clients/new')}
                  variant="primary"
                  icon={<Plus size={16} color="#ffffff" />}
                />
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
