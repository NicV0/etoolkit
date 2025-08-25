import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { FileText, Calendar } from 'lucide-react-native';

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
  useInvoices,
  useDeleteInvoice,
} from '../../../lib/query/hooks';

// Theme
import { theme } from '../../../lib/theme/tokens';
import { textStyles } from '../../../lib/theme/utils';

// Types
import { InvoiceWithItems } from '../../../lib/api/invoices';
import { InvoiceFilters } from '../../../lib/database/types';

type Invoice = InvoiceWithItems;

// Utils
import { formatCurrencySafe } from '../../../lib/utils/number';

// Invoice card component
const InvoiceCard: React.FC<{
  invoice: Invoice;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}> = ({ invoice, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => {
    onEdit(invoice);
  }, [invoice, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(invoice);
  }, [invoice, onDelete]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'sent':
        return 'info';
      case 'overdue':
        return 'error';
      case 'draft':
        return 'warning';
      default:
        return 'info';
    }
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencySafe(amount, invoice.currency || 'USD');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card variant="elevated" style={styles.invoiceCard}>
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceInfo}>
          <View style={styles.invoiceNumberRow}>
            <Text style={[textStyles.h3, styles.invoiceNumber]}>
              #{invoice.number}
            </Text>
            <Badge variant={getStatusColor(invoice.status) as 'success' | 'info' | 'error' | 'warning'}>
              {invoice.status}
            </Badge>
          </View>
          <Text style={[textStyles.body, styles.invoiceAmount]}>
            {formatCurrency(invoice.total)}
          </Text>
          {invoice.due_date && (
            <View style={styles.dueDateRow}>
              <Calendar size={14} color={theme.colors.text.secondary} />
              <Text style={[textStyles.caption, styles.dueDate]}>
                Due: {formatDate(invoice.due_date)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.invoiceActions}>
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
const EmptyState: React.FC<{ onAddInvoice: () => void }> = ({ onAddInvoice }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIcon}>
      <FileText size={48} color={theme.colors.text.secondary} />
    </View>
    <Text style={[textStyles.h2, styles.emptyTitle]}>
      No invoices yet
    </Text>
    <Text style={[textStyles.body, styles.emptySubtitle]}>
      Get started by creating your first invoice
    </Text>
    <Button
      variant="primary"
      size="lg"
      onPress={onAddInvoice}
      style={styles.emptyButton}
      title="Create Invoice"
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

// Main Billing screen
export default function BillingScreen() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Query hooks
  const filters: InvoiceFilters = {
    search: searchQuery || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  };

  // Convert filters to match the expected type
  const apiFilters = {
    ...filters,
    client_id: filters.client_id?.toString()
  };

  const {
    data: invoicesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useInvoices('org-id', apiFilters);

  const deleteInvoiceMutation = useDeleteInvoice();

  // Handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleAddInvoice = useCallback(() => {
    router.push('/billing/new');
  }, []);

  const handleEditInvoice = useCallback((invoice: Invoice) => {
    router.push(`/billing/${invoice.id}`);
  }, []);

  const handleDeleteInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedInvoice) return;

    try {
      await deleteInvoiceMutation.mutateAsync(selectedInvoice.id.toString());
      setShowDeleteModal(false);
      setSelectedInvoice(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete invoice. Please try again.');
    }
  }, [selectedInvoice, deleteInvoiceMutation]);

  // const _cancelDelete = useCallback(() => {
  //   setShowDeleteModal(false);
  //   setSelectedInvoice(null);
  // }, []);



  // Error state
  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[textStyles.h2, styles.errorTitle]}>
          Something went wrong
        </Text>
        <Text style={[textStyles.body, styles.errorMessage]}>
          {error?.message || 'Failed to load invoices'}
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
              Billing
            </Text>
            {invoicesData && (
              <Text style={[textStyles.body, styles.invoiceCount]}>
                {invoicesData?.length || 0} invoice{(invoicesData?.length || 0) !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <Button
              variant="primary"
              size="sm"
              onPress={handleAddInvoice}
              style={styles.addButton}
              title="New"
            />
          </View>
        </View>

        <View style={styles.filters}>
          <SearchInput
            placeholder="Search invoices..."
            onSearch={handleSearch}
            style={styles.searchInput}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusFilters}
          >
            <Button
              variant={statusFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setStatusFilter('all')}
              style={styles.filterButton}
              title="All"
            />
            <Button
              variant={statusFilter === 'draft' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setStatusFilter('draft')}
              style={styles.filterButton}
              title="Draft"
            />
            <Button
              variant={statusFilter === 'sent' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setStatusFilter('sent')}
              style={styles.filterButton}
              title="Sent"
            />
            <Button
              variant={statusFilter === 'paid' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setStatusFilter('paid')}
              style={styles.filterButton}
              title="Paid"
            />
            <Button
              variant={statusFilter === 'overdue' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setStatusFilter('overdue')}
              style={styles.filterButton}
              title="Overdue"
            />
          </ScrollView>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : invoicesData?.length === 0 ? (
        <EmptyState onAddInvoice={handleAddInvoice} />
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
          {invoicesData?.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onEdit={handleEditInvoice}
              onDelete={handleDeleteInvoice}
            />
          ))}
        </ScrollView>
      )}

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader>
          <Text style={[textStyles.h3, styles.modalTitle]}>Delete Invoice</Text>
        </ModalHeader>
        <ModalContent>
          <Text style={[textStyles.body, styles.modalMessage]}>
            Are you sure you want to delete invoice #{selectedInvoice?.number}? This action cannot be undone.
          </Text>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            size="md"
            onPress={() => setShowDeleteModal(false)}
            style={styles.modalButton}
            title="Cancel"
          />
          <Button
            variant="primary"
            size="md"
            onPress={confirmDelete}
            loading={deleteInvoiceMutation.isPending}
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
  invoiceCount: {
    color: theme.colors.text.secondary,
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
    gap: theme.spacing.sm,
  },
  filterButton: {
    marginRight: theme.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  invoiceCard: {
    marginBottom: theme.spacing.md,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  invoiceNumber: {
    color: theme.colors.text.primary,
    flex: 1,
  },
  invoiceAmount: {
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  dueDate: {
    color: theme.colors.text.secondary,
  },
  invoiceActions: {
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
  emptyIcon: {
    marginBottom: theme.spacing.lg,
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
  
  // Modal styles
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
