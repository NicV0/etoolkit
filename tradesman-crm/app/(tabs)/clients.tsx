import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  project_name: string;
  created_at: string;
}

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    project_name: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Error', 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async () => {
    if (!user || !newClient.name.trim()) {
      Alert.alert('Error', 'Please enter at least a client name');
      return;
    }

    try {
      const { error } = await supabase.from('clients').insert({
        user_id: user.id,
        ...newClient,
      });

      if (error) throw error;

      setNewClient({
        name: '',
        email: '',
        phone: '',
        address: '',
        project_name: '',
      });
      setShowAddForm(false);
      loadClients();
      Alert.alert('Success', 'Client added successfully');
    } catch (error) {
      console.error('Error adding client:', error);
      Alert.alert('Error', 'Failed to add client');
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.project_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderClient = ({ item }: { item: Client }) => (
    <Card style={styles.clientCard}>
      <View style={styles.clientHeader}>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.name}</Text>
          {item.project_name && (
            <Text style={styles.projectName}>{item.project_name}</Text>
          )}
        </View>
        <View style={styles.clientActions}>
          <Pressable style={styles.actionButton}>
            <Ionicons name="call-outline" size={20} color="#007AFF" />
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Ionicons name="mail-outline" size={20} color="#007AFF" />
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </Pressable>
        </View>
      </View>
      
      <View style={styles.clientDetails}>
        {item.email && (
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color="#8E8E93" />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
        )}
        {item.phone && (
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color="#8E8E93" />
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>
        )}
        {item.address && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#8E8E93" />
            <Text style={styles.detailText}>{item.address}</Text>
          </View>
        )}
      </View>
    </Card>
  );

  if (showAddForm) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => setShowAddForm(false)}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Add New Client</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Client Name"
            value={newClient.name}
            onChangeText={(text) => setNewClient({ ...newClient, name: text })}
            required
          />
          <Input
            label="Email"
            value={newClient.email}
            onChangeText={(text) => setNewClient({ ...newClient, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Phone"
            value={newClient.phone}
            onChangeText={(text) => setNewClient({ ...newClient, phone: text })}
            keyboardType="phone-pad"
          />
          <Input
            label="Address"
            value={newClient.address}
            onChangeText={(text) => setNewClient({ ...newClient, address: text })}
            multiline
          />
          <Input
            label="Project Name"
            value={newClient.project_name}
            onChangeText={(text) => setNewClient({ ...newClient, project_name: text })}
          />

          <Button
            title="Add Client"
            onPress={handleAddClient}
            style={styles.addButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
        <Pressable
          onPress={() => setShowAddForm(true)}
          style={styles.addClientButton}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredClients}
        renderItem={renderClient}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No Clients Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first client to get started
            </Text>
            <Button
              title="Add Client"
              onPress={() => setShowAddForm(true)}
              style={styles.emptyButton}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  addClientButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  clientCard: {
    marginBottom: 12,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  clientActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  clientDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  addButton: {
    marginTop: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 32,
  },
});