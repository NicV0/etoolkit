import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Trash2, Save, Send } from 'lucide-react-native';

// Components
import {
  Card,
  Button,
  Input,
  Badge,
  LoadingSpinner,
} from '../../../components/ui';

// Hooks
import {
  useClients,
  useCreateInvoice,
} from '../../../lib/query/hooks';

// Theme
import { theme } from '../../../lib/theme/tokens';
import { textStyles } from '../../../lib/theme/utils';

// Types
import { ClientWithJobs } from '../../../lib/api/clients';
import { ClientFilters } from '../../../lib/database/types';

type Client = ClientWithJobs;

// Define a simple InvoiceItem type for the form
interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
  updated_at: string;
}

// Step 1: Client Selection
const ClientSelectionStep: React.FC<{
  selectedClient: Client | null;
  onClientSelect: (client: Client) => void;
  onNext: () => void;
}> = ({ selectedClient, onClientSelect, onNext }) => {
  const { data: clientsData, isLoading } = useClients('org-id', { status: 'active' });

  const handleClientSelect = useCallback((client: Client) => {
    onClientSelect(client);
  }, [onClientSelect]);

  const handleNext = useCallback(() => {
    if (!selectedClient) {
      Alert.alert('Error', 'Please select a client to continue');
      return;
    }
    onNext();
  }, [selectedClient, onNext]);

  return (
    <View style={styles.stepContainer}>
      <Text style={[textStyles.h2, styles.stepTitle]}>
        Select Client
      </Text>
      <Text style={[textStyles.body, styles.stepSubtitle]}>
        Choose the client for this invoice
      </Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={[textStyles.body, styles.loadingText]}>
            Loading clients...
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.clientList}>
          {clientsData?.map((client) => (
                         <Card
               key={client.id}
               variant={selectedClient?.id?.toString() === client.id ? 'elevated' : 'outlined'}
              style={styles.clientCard}
               onPress={() => handleClientSelect(client)}
             >
              <View style={styles.clientInfo}>
                <Text style={[textStyles.h3, styles.clientName]}>
                  {client.name}
                </Text>
                <Text style={[textStyles.body, styles.clientEmail]}>
                  {client.email}
                </Text>
                {/* contact_name not available in current API response */}
              </View>
              {selectedClient?.id?.toString() === client.id && (
                <Badge variant="success" style={styles.selectedBadge}>
                  Selected
                </Badge>
              )}
            </Card>
          ))}
        </ScrollView>
      )}

      <View style={styles.stepActions}>
        <Button
          variant="primary"
          size="lg"
          onPress={handleNext}
          disabled={!selectedClient}
          style={styles.nextButton}
          title="Next: Line Items"
        />
      </View>
    </View>
  );
};

// Step 2: Line Items
const LineItemsStep: React.FC<{
  selectedClient: Client;
  lineItems: InvoiceItem[];
  onLineItemsChange: (items: InvoiceItem[]) => void;
  onBack: () => void;
  onNext: () => void;
}> = ({ selectedClient, lineItems, onLineItemsChange, onBack, onNext }) => {
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: '1',
    unit_price: '',
  });

  const addLineItem = useCallback(() => {
    if (!newItem.description || !newItem.unit_price) {
      Alert.alert('Error', 'Please fill in description and unit price');
      return;
    }

    const item: InvoiceItem = {
      id: Date.now(), // Temporary ID
      invoice_id: 0, // Will be set when invoice is created
      description: newItem.description,
      quantity: parseFloat(newItem.quantity),
      unit_price: parseFloat(newItem.unit_price),
      total: parseFloat(newItem.quantity) * parseFloat(newItem.unit_price),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onLineItemsChange([...lineItems, item]);
    setNewItem({ description: '', quantity: '1', unit_price: '' });
  }, [newItem, lineItems, onLineItemsChange]);

  const removeLineItem = useCallback((index: number) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    onLineItemsChange(updatedItems);
  }, [lineItems, onLineItemsChange]);

  const updateLineItem = useCallback((index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    onLineItemsChange(updatedItems);
  }, [lineItems, onLineItemsChange]);

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.1; // 10% tax rate
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handleNext = useCallback(() => {
    if (lineItems.length === 0) {
      Alert.alert('Error', 'Please add at least one line item');
      return;
    }
    onNext();
  }, [lineItems.length, onNext]);

  return (
    <View style={styles.stepContainer}>
      <Text style={[textStyles.h2, styles.stepTitle]}>
        Line Items
      </Text>
      <Text style={[textStyles.body, styles.stepSubtitle]}>
        Add items and services for {selectedClient.name}
      </Text>

      {/* Add new item form */}
      <Card variant="outlined" style={styles.addItemCard}>
        <Text style={[textStyles.h3, styles.addItemTitle]}>
          Add Item
        </Text>
        <View style={styles.addItemForm}>
          <Input
            placeholder="Description"
            value={newItem.description}
            onChangeText={(text) => setNewItem({ ...newItem, description: text })}
            style={styles.addItemInput}
          />
          <View style={styles.quantityPriceRow}>
            <Input
              placeholder="Qty"
              value={newItem.quantity}
              onChangeText={(text) => setNewItem({ ...newItem, quantity: text })}
              keyboardType="numeric"
              style={styles.quantityInput}
            />
            <Input
              placeholder="Unit Price"
              value={newItem.unit_price}
              onChangeText={(text) => setNewItem({ ...newItem, unit_price: text })}
              keyboardType="numeric"
              style={styles.priceInput}
            />
          </View>
                     <Button
             variant="outline"
             size="sm"
             onPress={addLineItem}
             style={styles.addItemButton}
             title="Add Item"
           />
        </View>
      </Card>

      {/* Line items list */}
      <ScrollView style={styles.lineItemsList}>
        {lineItems.map((item, index) => (
          <Card key={item.id} variant="outlined" style={styles.lineItemCard}>
            <View style={styles.lineItemHeader}>
              <Text style={[textStyles.body, styles.lineItemDescription]}>
                {item.description}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => removeLineItem(index)}
                style={styles.removeItemButton}
                title=""
                leftIcon={<Trash2 size={16} color={theme.colors.error} />}
              />
            </View>
            <View style={styles.lineItemDetails}>
              <View style={styles.quantityPriceRow}>
                <Input
                  placeholder="Qty"
                  value={item.quantity.toString()}
                  onChangeText={(text) => updateLineItem(index, 'quantity', parseFloat(text) || 0)}
                  keyboardType="numeric"
                  style={styles.quantityInput}
                />
                <Input
                  placeholder="Unit Price"
                  value={item.unit_price.toString()}
                  onChangeText={(text) => updateLineItem(index, 'unit_price', parseFloat(text) || 0)}
                  keyboardType="numeric"
                  style={styles.priceInput}
                />
              </View>
              <Text style={[textStyles.body, styles.lineItemTotal]}>
                Total: ${item.total.toFixed(2)}
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Totals */}
      {lineItems.length > 0 && (
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
            <Text style={[textStyles.body, styles.totalsLabel]}>Tax (10%):</Text>
            <Text style={[textStyles.body, styles.totalsValue]}>
              ${taxAmount.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.totalsRow, styles.totalRow]}>
            <Text style={[textStyles.h3, styles.totalLabel]}>Total:</Text>
            <Text style={[textStyles.h3, styles.totalValue]}>
              ${total.toFixed(2)}
            </Text>
          </View>
        </Card>
      )}

      {/* Step actions */}
      <View style={styles.stepActions}>
        <Button
          variant="outline"
          size="lg"
          onPress={onBack}
          style={styles.backButton}
          title="Back"
        />
        <Button
          variant="primary"
          size="lg"
          onPress={handleNext}
          disabled={lineItems.length === 0}
          style={styles.nextButton}
          title="Next: Review"
        />
      </View>
    </View>
  );
};

// Step 3: Review & Send
const ReviewStep: React.FC<{
  selectedClient: Client;
  lineItems: InvoiceItem[];
  onBack: () => void;
  onSave: () => void;
  onSend: () => void;
}> = ({ selectedClient, lineItems, onBack }) => {
  const createInvoiceMutation = useCreateInvoice();
  // Invoice items are created automatically with the invoice

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.1;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handleSave = useCallback(async () => {
    try {
      const invoiceId = await createInvoiceMutation.mutateAsync({
        orgId: 'org-id',
        data: {
          client_id: selectedClient.id.toString(),
          currency: 'USD',
          tax_rate_pct: taxRate,
          discount_amt: 0,
          issue_date: new Date().toISOString().split('T')[0],
          items: lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            taxable: true
          }))
        }
      });

      // Invoice items are created automatically with the invoice

      Alert.alert('Success', 'Invoice saved as draft', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save invoice. Please try again.');
    }
  }, [selectedClient.id, lineItems, subtotal, taxAmount, total, createInvoiceMutation]);

  const handleSend = useCallback(async () => {
    try {
      const invoiceId = await createInvoiceMutation.mutateAsync({
        orgId: 'org-id',
        data: {
          client_id: selectedClient.id.toString(),
          currency: 'USD',
          tax_rate_pct: taxRate,
          discount_amt: 0,
          issue_date: new Date().toISOString().split('T')[0],
          items: lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            taxable: true
          }))
        }
      });

      // Invoice items are created automatically with the invoice

      Alert.alert('Success', 'Invoice sent successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to send invoice. Please try again.');
    }
  }, [selectedClient.id, lineItems, subtotal, taxAmount, total, createInvoiceMutation]);

  return (
    <View style={styles.stepContainer}>
      <Text style={[textStyles.h2, styles.stepTitle]}>
        Review & Send
      </Text>
      <Text style={[textStyles.body, styles.stepSubtitle]}>
        Review your invoice before sending
      </Text>

      <ScrollView style={styles.reviewContent}>
        {/* Client info */}
        <Card variant="outlined" style={styles.reviewCard}>
          <Text style={[textStyles.h3, styles.reviewCardTitle]}>
            Client Information
          </Text>
          <Text style={[textStyles.body, styles.reviewText]}>
            {selectedClient.name}
          </Text>
          <Text style={[textStyles.body, styles.reviewText]}>
            {selectedClient.email}
          </Text>
          {/* contact_name not available in current API response */}
        </Card>

        {/* Line items */}
        <Card variant="outlined" style={styles.reviewCard}>
          <Text style={[textStyles.h3, styles.reviewCardTitle]}>
            Line Items
          </Text>
          {lineItems.map((item, index) => (
            <View key={index} style={styles.reviewLineItem}>
              <Text style={[textStyles.body, styles.reviewItemDescription]}>
                {item.description}
              </Text>
              <Text style={[textStyles.body, styles.reviewItemDetails]}>
                {item.quantity} × ${item.unit_price.toFixed(2)} = ${item.total.toFixed(2)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Totals */}
        <Card variant="elevated" style={styles.reviewCard}>
          <Text style={[textStyles.h3, styles.reviewCardTitle]}>
            Totals
          </Text>
          <View style={styles.totalsRow}>
            <Text style={[textStyles.body, styles.totalsLabel]}>Subtotal:</Text>
            <Text style={[textStyles.body, styles.totalsValue]}>
              ${subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={[textStyles.body, styles.totalsLabel]}>Tax (10%):</Text>
            <Text style={[textStyles.body, styles.totalsValue]}>
              ${taxAmount.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.totalsRow, styles.totalRow]}>
            <Text style={[textStyles.h3, styles.totalLabel]}>Total:</Text>
            <Text style={[textStyles.h3, styles.totalValue]}>
              ${total.toFixed(2)}
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Step actions */}
      <View style={styles.stepActions}>
        <Button
          variant="outline"
          size="lg"
          onPress={onBack}
          style={styles.backButton}
          title="Back"
        />
        <Button
          variant="outline"
          size="lg"
          onPress={handleSave}
          loading={createInvoiceMutation.isPending}
          style={styles.saveButton}
          leftIcon={<Save size={20} color={theme.colors.primary} />}
          title="Save Draft"
        />
        <Button
          variant="primary"
          size="lg"
          onPress={handleSend}
          loading={createInvoiceMutation.isPending}
          style={styles.sendButton}
          leftIcon={<Send size={20} color={theme.colors.text.inverse} />}
          title="Send Invoice"
        />
      </View>
    </View>
  );
};

// Main Invoice Creation Wizard
export default function InvoiceCreationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([]);

  const handleClientSelect = useCallback((client: Client) => {
    setSelectedClient(client);
  }, []);

  const handleLineItemsChange = useCallback((items: InvoiceItem[]) => {
    setLineItems(items);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep(currentStep + 1);
  }, [currentStep]);

  const handleBack = useCallback(() => {
    setCurrentStep(currentStep - 1);
  }, [currentStep]);

  const handleSave = useCallback(() => {
    // Handled in ReviewStep component
  }, []);

  const handleSend = useCallback(() => {
    // Handled in ReviewStep component
  }, []);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ClientSelectionStep
            selectedClient={selectedClient}
            onClientSelect={handleClientSelect}
            onNext={handleNext}
          />
        );
      case 2:
        return selectedClient ? (
          <LineItemsStep
            selectedClient={selectedClient}
            lineItems={lineItems}
            onLineItemsChange={handleLineItemsChange}
            onBack={handleBack}
            onNext={handleNext}
          />
        ) : null;
      case 3:
        return selectedClient ? (
          <ReviewStep
            selectedClient={selectedClient}
            lineItems={lineItems}
            onBack={handleBack}
            onSave={handleSave}
            onSend={handleSend}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
          style={styles.headerBackButton}
          title=""
          leftIcon={<ArrowLeft size={20} color={theme.colors.text.primary} />}
        />
        <View style={styles.headerContent}>
          <Text style={[textStyles.h2, styles.headerTitle]}>
            New Invoice
          </Text>
          <View style={styles.stepIndicator}>
            {[1, 2, 3].map((step) => (
              <View
                key={step}
                style={[
                  styles.stepDot,
                  step === currentStep && styles.activeStepDot,
                  step < currentStep && styles.completedStepDot,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Step content */}
      {renderCurrentStep()}
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
  headerBackButton: {
    marginRight: theme.spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  activeStepDot: {
    backgroundColor: theme.colors.primary,
  },
  completedStepDot: {
    backgroundColor: theme.colors.success,
  },
  stepContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  stepTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  stepSubtitle: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
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
  clientList: {
    flex: 1,
  },
  clientCard: {
    marginBottom: theme.spacing.md,
  },
  selectedClientCard: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  clientEmail: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  contactName: {
    color: theme.colors.text.secondary,
  },
  selectedBadge: {
    alignSelf: 'flex-start',
  },
  addItemCard: {
    marginBottom: theme.spacing.lg,
  },
  addItemTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  addItemForm: {
    gap: theme.spacing.md,
  },
  addItemInput: {
    marginBottom: 0,
  },
  quantityPriceRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  quantityInput: {
    flex: 1,
    marginBottom: 0,
  },
  priceInput: {
    flex: 2,
    marginBottom: 0,
  },
  addItemButton: {
    alignSelf: 'flex-start',
  },
  lineItemsList: {
    flex: 1,
  },
  lineItemCard: {
    marginBottom: theme.spacing.md,
  },
  lineItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  lineItemDescription: {
    color: theme.colors.text.primary,
    flex: 1,
  },
  removeItemButton: {
    paddingHorizontal: theme.spacing.sm,
  },
  lineItemDetails: {
    gap: theme.spacing.sm,
  },
  lineItemTotal: {
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  totalsCard: {
    marginTop: theme.spacing.lg,
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
  stepActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  sendButton: {
    flex: 1,
  },
  reviewContent: {
    flex: 1,
  },
  reviewCard: {
    marginBottom: theme.spacing.lg,
  },
  reviewCardTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  reviewText: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  reviewLineItem: {
    marginBottom: theme.spacing.md,
  },
  reviewItemDescription: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  reviewItemDetails: {
    color: theme.colors.text.secondary,
  },
});
