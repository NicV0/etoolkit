import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Edit, Trash2, Download, Share } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';

// Components
import {
  Card,
  Button,
  Badge,
  LoadingSpinner,
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from '../../../components/ui';

// Hooks
import {
  useInvoice,
  useDeleteInvoice,
} from '../../../lib/query/hooks';

// Theme
import { theme } from '../../../lib/theme/tokens';
import { textStyles } from '../../../lib/theme/utils';

// Types
import type { InvoiceWithItems } from '../../../lib/api/invoices';

type InvoiceItem = InvoiceWithItems['items'][0];

// PDF Generator
import { PDFGenerator } from '../../../lib/pdf/generators';

// Accessibility
import { announce } from '../../../lib/a11y';

// Invoice status badge component
const InvoiceStatusBadge: React.FC<{ status: string }> = ({ status }) => {
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

  return (
    <Badge variant={getStatusColor(status) as "success" | "warning" | "error" | "info" | "default"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Line item component
const LineItemCard: React.FC<{
  item: InvoiceItem;
  onEdit: (item: InvoiceItem) => void;
  onDelete: (item: InvoiceItem) => void;
}> = ({ item, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => {
    onEdit(item);
  }, [item, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(item);
  }, [item, onDelete]);

  return (
    <Card variant="outlined" style={styles.lineItemCard}>
      <View style={styles.lineItemHeader}>
        <View style={styles.lineItemInfo}>
          <Text style={[textStyles.body, styles.lineItemDescription]}>
            {item.description}
          </Text>
          <Text style={[textStyles.caption, styles.lineItemDetails]}>
            {item.quantity} × ${item.unit_price.toFixed(2)} = ${item.line_total.toFixed(2)}
          </Text>
        </View>
        <View style={styles.lineItemActions}>
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

// Main Invoice Detail Screen
export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = parseInt(id || '0', 10);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get invoice data
  const { 
    data: invoice, 
    isLoading: invoiceLoading,
    isError: invoiceError,
    error: invoiceErrorData,
    refetch: refetchInvoice,
  } = useInvoice('org-id', id);
  
  // Get line items separately since they're included in the invoice
  const lineItems = invoice?.items || [];
  
  // Mutations
  const deleteInvoiceMutation = useDeleteInvoice();
  
  // Loading state
  const itemsLoading = false; // Since items are included in invoice data

  // Handlers
  const handleDeleteInvoice = useCallback(async () => {
    if (!invoice) return;
    
    try {
      await deleteInvoiceMutation.mutateAsync(invoice.id);
      router.back();
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    }
  }, [invoice, deleteInvoiceMutation, router]);

  const handleDeleteLineItem = useCallback(async (itemId: string) => {
    // TODO: Implement line item deletion
    console.log('Delete line item:', itemId);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchInvoice();
    } finally {
      setRefreshing(false);
    }
  }, [refetchInvoice]);

  const handleEdit = useCallback(() => {
    // TODO: Navigate to edit screen
    console.log('Edit invoice');
  }, []);

  const handleDelete = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!invoice) return;

    try {
      await deleteInvoiceMutation.mutateAsync(invoice.id);
      await announce('Invoice deleted successfully');
      setShowDeleteModal(false);
      router.back();
    } catch (error) {
      await announce('Failed to delete invoice');
      Alert.alert('Error', 'Failed to delete invoice. Please try again.');
    }
  }, [invoice, deleteInvoiceMutation]);

  const handleExportPDF = useCallback(async () => {
    if (!invoice || !invoice.items) return;

    try {
      const pdfData = {
        org_name: 'Your Company', // TODO: Get from settings
        org_address: '123 Business St',
        org_phone: '+1-555-0123',
        org_email: 'contact@company.com',
        document_type: 'invoice' as const,
        number: invoice.number,
        date: invoice.created_at,
        due_date: invoice.due_date,
        client_name: 'Client Name', // TODO: Get client name
        client_address: 'Client Address',
        client_phone: 'Client Phone',
        client_email: 'client@email.com',
        items: invoice.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total,
          taxable: true,
        })),
        subtotal: invoice.subtotal,
        tax_total: invoice.tax_total,
        discount_amt: invoice.discount_amt,
        total: invoice.total,
        terms: '',
        notes: '',
      };

      await PDFGenerator.generatePDF(pdfData, {
        filename: `invoice-${invoice.number}.pdf`,
        shareAfterGeneration: true,
      });

      await announce('PDF exported successfully');
      Alert.alert('Success', 'PDF exported successfully');
    } catch (error) {
      await announce('Failed to export PDF');
      Alert.alert('Error', 'Failed to export PDF. Please try again.');
    }
  }, [invoice, lineItems]);

  const handleShare = useCallback(async () => {
    if (!invoice) return;

    try {
      const shareText = `Invoice ${invoice.number} - ${invoice.total.toFixed(2)}`;
      await Sharing.shareAsync('', { mimeType: 'text/plain', dialogTitle: shareText });
    } catch (error) {
      Alert.alert('Error', 'Failed to share invoice.');
    }
  }, [invoice]);

  const handleLineItemEdit = useCallback((item: InvoiceItem) => {
    // TODO: Navigate to line item edit screen
    console.log('Edit line item:', item);
  }, []);

  const handleLineItemDelete = useCallback(async (item: InvoiceItem) => {
    try {
      await handleDeleteLineItem(item.id.toString());
      Alert.alert('Success', 'Line item deleted');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete line item. Please try again.');
    }
  }, [handleDeleteLineItem]);

  // Loading state
  if (invoiceLoading || itemsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={[textStyles.body, styles.loadingText]}>
          Loading invoice...
        </Text>
      </View>
    );
  }

  // Error state
  if (invoiceError || !invoice) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[textStyles.h2, styles.errorTitle]}>
          Invoice not found
        </Text>
        <Text style={[textStyles.body, styles.errorMessage]}>
          {invoiceErrorData?.message || 'The invoice you are looking for does not exist.'}
        </Text>
        <Button
          variant="primary"
          size="lg"
          onPress={() => router.back()}
          style={styles.errorButton}
          title="Go Back"
        />
      </View>
    );
  }

  const subtotal = lineItems?.reduce((sum, item) => sum + item.line_total, 0) || 0;
  const taxAmount = invoice.tax_total;
  const total = invoice.total;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
          style={styles.backButton}
          leftIcon={<ArrowLeft size={20} color={theme.colors.text.primary} />}
          title="Back"
        />
        <View style={styles.headerContent}>
          <Text style={[textStyles.h2, styles.headerTitle]}>
            Invoice #{invoice.number}
          </Text>
          <InvoiceStatusBadge status={invoice.status} />
        </View>
        <View style={styles.headerActions}>
          <Button
            variant="ghost"
            size="sm"
            onPress={handleEdit}
            style={styles.actionButton}
            leftIcon={<Edit size={16} color={theme.colors.text.primary} />}
            title="Edit"
          />
          <Button
            variant="ghost"
            size="sm"
            onPress={handleDelete}
            style={styles.actionButton}
            leftIcon={<Trash2 size={16} color={theme.colors.error} />}
            title="Delete"
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Invoice Summary */}
        <Card variant="elevated" style={styles.summaryCard}>
          <Text style={[textStyles.h3, styles.summaryTitle]}>
            Invoice Summary
          </Text>
          <View style={styles.summaryRow}>
            <Text style={[textStyles.body, styles.summaryLabel]}>Status:</Text>
            <InvoiceStatusBadge status={invoice.status} />
          </View>
          <View style={styles.summaryRow}>
            <Text style={[textStyles.body, styles.summaryLabel]}>Date:</Text>
            <Text style={[textStyles.body, styles.summaryValue]}>
              {new Date(invoice.created_at).toLocaleDateString()}
            </Text>
          </View>
          {invoice.due_date && (
            <View style={styles.summaryRow}>
              <Text style={[textStyles.body, styles.summaryLabel]}>Due Date:</Text>
              <Text style={[textStyles.body, styles.summaryValue]}>
                {new Date(invoice.due_date).toLocaleDateString()}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={[textStyles.body, styles.summaryLabel]}>Currency:</Text>
            <Text style={[textStyles.body, styles.summaryValue]}>
              {invoice.currency}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[textStyles.body, styles.summaryLabel]}>Terms:</Text>
            <Text style={[textStyles.body, styles.summaryValue]}>
              {/* Terms not available in current interface */}
            </Text>
          </View>
        </Card>

        {/* Line Items */}
        <Card variant="elevated" style={styles.lineItemsCard}>
          <View style={styles.lineItemsHeader}>
            <Text style={[textStyles.h3, styles.lineItemsTitle]}>
              Line Items
            </Text>
            <Text style={[textStyles.body, styles.lineItemsCount]}>
              {lineItems?.length || 0} items
            </Text>
          </View>
          
          {lineItems && lineItems.length > 0 ? (
            <View style={styles.lineItemsList}>
              {lineItems.map((item) => (
                <LineItemCard
                  key={item.id}
                  item={item}
                  onEdit={handleLineItemEdit}
                  onDelete={handleLineItemDelete}
                />
              ))}
            </View>
          ) : (
            <Text style={[textStyles.body, styles.emptyText]}>
              No line items found
            </Text>
          )}
        </Card>

        {/* Totals */}
        <Card variant="elevated" style={styles.totalsCard}>
          <Text style={[textStyles.h3, styles.totalsTitle]}>
            Totals
          </Text>
          <View style={styles.totalsRow}>
            <Text style={[textStyles.body, styles.totalsLabel]}>Subtotal:</Text>
            <Text style={[textStyles.body, styles.totalsValue]}>
              ${subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={[textStyles.body, styles.totalsLabel]}>Tax:</Text>
            <Text style={[textStyles.body, styles.totalsValue]}>
              ${taxAmount.toFixed(2)}
            </Text>
          </View>
          {invoice.discount_amt > 0 && (
            <View style={styles.totalsRow}>
              <Text style={[textStyles.body, styles.totalsLabel]}>Discount:</Text>
              <Text style={[textStyles.body, styles.totalsValue]}>
                -${invoice.discount_amt.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.totalsRow, styles.totalRow]}>
            <Text style={[textStyles.h3, styles.totalLabel]}>Total:</Text>
            <Text style={[textStyles.h3, styles.totalValue]}>
              ${total.toFixed(2)}
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          variant="outline"
          size="lg"
          onPress={handleExportPDF}
          style={styles.actionButton}
          leftIcon={<Download size={20} color={theme.colors.primary} />}
          title="Export PDF"
        />
        <Button
          variant="outline"
          size="lg"
          onPress={handleShare}
          style={styles.actionButton}
          leftIcon={<Share size={20} color={theme.colors.primary} />}
          title="Share"
        />
      </View>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader>
          <Text style={[textStyles.h3, styles.modalTitle]}>Delete Invoice</Text>
        </ModalHeader>
        <ModalContent>
          <Text style={[textStyles.body, styles.modalMessage]}>
            Are you sure you want to delete invoice #{invoice.number}? This action cannot be undone.
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    color: theme.colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  summaryCard: {
    marginBottom: theme.spacing.lg,
  },
  summaryTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    color: theme.colors.text.primary,
  },
  lineItemsCard: {
    marginBottom: theme.spacing.lg,
  },
  lineItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  lineItemsTitle: {
    color: theme.colors.text.primary,
  },
  lineItemsCount: {
    color: theme.colors.text.secondary,
  },
  lineItemsList: {
    gap: theme.spacing.sm,
  },
  lineItemCard: {
    marginBottom: theme.spacing.sm,
  },
  lineItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  lineItemInfo: {
    flex: 1,
  },
  lineItemDescription: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  lineItemDetails: {
    color: theme.colors.text.secondary,
  },
  lineItemActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  totalsCard: {
    marginBottom: theme.spacing.lg,
  },
  totalsTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  totalsLabel: {
    color: theme.colors.text.secondary,
  },
  totalsValue: {
    color: theme.colors.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  totalLabel: {
    color: theme.colors.text.primary,
  },
  totalValue: {
    color: theme.colors.text.primary,
  },
  notesCard: {
    marginBottom: theme.spacing.lg,
  },
  notesTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  notesText: {
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  emptyText: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
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
