import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
  Text,
} from 'react-native';
import { router } from 'expo-router';
// import { Plus } from 'lucide-react-native';

// Components
import {
  Card,
  Button,
  Badge,
  SearchInput,
  SkeletonCard,
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from '../../../components/ui';

// Hooks
import {
  useClients,
  useDeleteClient,
  useRefreshData,
} from '../../../lib/query/hooks';

// Theme
import { theme } from '../../../lib/theme/tokens';
import { textStyles } from '../../../lib/theme/utils';

// Types
import { ClientWithJobs } from '../../../lib/api/clients';
import { ClientFilters } from '../../../lib/database/types';

type Client = ClientWithJobs;

// Client card component
const ClientCard: React.FC<{
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}> = ({ client, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => {
    onEdit(client);
  }, [client, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(client);
  }, [client, onDelete]);

  return (
    <Card variant="elevated" style={styles.clientCard}>
      <View style={styles.clientHeader}>
        <View style={styles.clientInfo}>
          <View style={styles.clientNameRow}>
            <Text style={[textStyles.h3, styles.clientName]}>
              {client.name}
            </Text>
            <Badge variant={client.status === 'active' ? 'success' : 'warning'}>
              {client.status}
            </Badge>
          </View>
          {/* contact_name not available in current API response */}
          <Text style={[textStyles.body, styles.clientEmail]}>
            {client.email}
          </Text>
          {client.phone && (
            <Text style={[textStyles.body, styles.clientPhone]}>
              {client.phone}
            </Text>
          )}
        </View>
        <View style={styles.clientActions}>
          <Button
            variant="ghost"
            size="sm"
            onPress={handleEdit}
            style={styles.actionButton}
            title="Edit"
          />
          <Button
            variant="ghost"
            size="sm"
            onPress={handleDelete}
            style={styles.actionButton}
            title="Delete"
          />
        </View>
      </View>
    </Card>
  );
};

// Empty state component
const EmptyState: React.FC<{ onAddClient: () => void }> = ({ onAddClient }) => (
  <View style={styles.emptyState}>
    <Text style={[textStyles.h2, styles.emptyTitle]}>
      No clients yet
    </Text>
    <Text style={[textStyles.body, styles.emptySubtitle]}>
      Get started by adding your first client
    </Text>
    <Button
      variant="primary"
      size="lg"
      onPress={onAddClient}
      style={styles.emptyButton}
      title="Add Client"
    />
  </View>
);

// Loading skeleton component
const LoadingSkeleton: React.FC = () => (
  <View style={styles.skeletonContainer}>
    {Array.from({ length: 5 }).map((_, index) => (
      <SkeletonCard key={index} style={styles.skeletonCard} />
    ))}
  </View>
);

// Main Clients screen
export default function ClientsScreen() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Query hooks
  const filters: ClientFilters = {
    search: searchQuery || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  };

  // Convert filters to match the expected type
  const apiFilters = filters?.status || 'active';

  const {
    data: clientsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useClients(apiFilters);

  const deleteClientMutation = useDeleteClient();
  const { refreshClients } = useRefreshData();

  // Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refetch();
    refreshClients();
  }, [refetch, refreshClients]);

  const handleAddClient = useCallback(() => {
    router.push('/clients/new');
  }, []);

  const handleEditClient = useCallback((client: Client) => {
    router.push(`/clients/${client.id}`);
  }, []);

  const handleDeleteClient = useCallback((client: Client) => {
    setSelectedClient(client);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedClient) return;

    try {
      await deleteClientMutation.mutateAsync(selectedClient.id.toString());
      setShowDeleteModal(false);
      setSelectedClient(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete client. Please try again.');
    }
  }, [selectedClient, deleteClientMutation]);

  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setSelectedClient(null);
  }, []);

  const handleSettings = useCallback(() => {
    router.push('/dashboard/settings');
  }, []);

  // Error state
  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[textStyles.h2, styles.errorTitle]}>
          Something went wrong
        </Text>
        <Text style={[textStyles.body, styles.errorMessage]}>
          {error?.message || 'Failed to load clients'}
        </Text>
        <Button
          variant="primary"
          size="lg"
          onPress={handleRefresh}
          style={styles.errorButton}
          title="Try Again"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={[textStyles.h2, styles.screenTitle]}>
              Clients
            </Text>
            {clientsData && (
              <Text style={[textStyles.body, styles.clientCount]}>
                {clientsData?.length || 0} client{(clientsData?.length || 0) !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <Button
              variant="ghost"
              size="sm"
              onPress={handleSettings}
              style={styles.settingsButton}
              title="Settings"
            />
            <Button
              variant="primary"
              size="sm"
              onPress={handleAddClient}
              style={styles.addButton}
              title="Add"
            />
          </View>
        </View>

        <View style={styles.filters}>
          <SearchInput
            placeholder="Search clients..."
            onSearch={handleSearch}
            style={styles.searchInput}
          />
          <View style={styles.statusFilters}>
            <Button
              variant={statusFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setStatusFilter('all')}
              style={styles.filterButton}
              title="All"
            />
            <Button
              variant={statusFilter === 'active' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setStatusFilter('active')}
              style={styles.filterButton}
              title="Active"
            />
            <Button
              variant={statusFilter === 'inactive' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setStatusFilter('inactive')}
              style={styles.filterButton}
              title="Inactive"
            />
          </View>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : clientsData?.length === 0 ? (
        <EmptyState onAddClient={handleAddClient} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {clientsData?.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
            />
          ))}
        </ScrollView>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        onClose={cancelDelete}
        style={styles.modal}
      >
        <ModalHeader>
          <Text style={[textStyles.h3, styles.modalTitle]}>
            Delete Client
          </Text>
        </ModalHeader>
        <ModalContent>
          <Text style={[textStyles.body, styles.modalMessage]}>
            Are you sure you want to delete &quot;{selectedClient?.name}&quot;? This action cannot be undone.
          </Text>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            size="md"
            onPress={cancelDelete}
            style={styles.modalButton}
            title="Cancel"
          />
          <Button
            variant="primary"
            size="md"
            onPress={confirmDelete}
            loading={deleteClientMutation.isPending}
            style={{ ...styles.modalButton, backgroundColor: theme.colors.error }}
            title="Delete"
          />
        </ModalFooter>
      </Modal>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  screenTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  clientCount: {
    color: theme.colors.text.secondary,
  },
  settingsButton: {
    paddingHorizontal: theme.spacing.sm,
  },
  addButton: {
    paddingHorizontal: theme.spacing.sm,
  },
  filters: {
    gap: theme.spacing.md,
  },
  searchInput: {
    marginBottom: 0,
  },
  statusFilters: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterButton: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  clientCard: {
    marginBottom: theme.spacing.md,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clientInfo: {
    flex: 1,
  },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  clientName: {
    color: theme.colors.text.primary,
    flex: 1,
  },
  contactName: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  clientEmail: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  clientPhone: {
    color: theme.colors.text.secondary,
  },
  clientActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 120,
  },
  skeletonContainer: {
    padding: theme.spacing.lg,
  },
  skeletonCard: {
    marginBottom: theme.spacing.md,
    height: 120,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  errorButton: {
    minWidth: 120,
  },
  modal: {
    margin: theme.spacing.lg,
  },
  modalTitle: {
    color: theme.colors.text.primary,
  },
  modalMessage: {
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});
