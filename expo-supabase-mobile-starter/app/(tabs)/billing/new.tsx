import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  Pressable,
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
  Screen,
} from '../../../components/ui';

// Hooks
import { useClients, useInvoices } from '../../../lib/state/simpleStore';

// Theme
import { theme } from '../../../lib/theme/tokens';

// Define a simple InvoiceItem type for the form
interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// Step 1: Client Selection
const ClientSelectionStep: React.FC<{
  selectedClient: any | null;
  onClientSelect: (client: any) => void;
  onNext: () => void;
}> = ({ selectedClient, onClientSelect, onNext }) => {
  const { clients } = useClients();

  const handleClientSelect = useCallback((client: any) => {
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
      <Text style={[styles.stepTitle]}>
        Select Client
      </Text>
      <Text style={[styles.stepSubtitle]}>
        Choose the client for this invoice
      </Text>

      <ScrollView style={styles.clientList}>
        {clients.map((client) => (














          <React.Fragment key={client.id}>

            <Pressable accessibilityRole="button" accessibilityLabel={`Select ${client.name}`} onPress={() => handleClientSelect(client)}>
              <Card
                variant={selectedClient?.id === client.id ? 'elevated' : 'outlined'}
                style={styles.clientCard}
              >
                <View style={styles.clientInfo}>
                  <Text style={[styles.clientName]}>
                    {client.name}
                  </Text>
                  <Text style={[styles.clientEmail]}>
                    {client.email}
                  </Text>
                </View>
                {selectedClient?.id === client.id && (
                  <Badge label="Selected" variant="success" style={styles.selectedBadge} />
                )}
              </Card>

            </Pressable>




          </React.Fragment>
        ))}
      </ScrollView>

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
  selectedClient: any;
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
      description: newItem.description,
      quantity: parseFloat(newItem.quantity),
      unit_price: parseFloat(newItem.unit_price),
      total: parseFloat(newItem.quantity) * parseFloat(newItem.unit_price),
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
      <Text style={[styles.stepTitle]}>
        Line Items
      </Text>
      <Text style={[styles.stepSubtitle]}>
        Add items and services for {selectedClient.name}
      </Text>

      {/* Add new item form */}
      <Card variant="outlined" style={styles.addItemCard}>
        <Text style={[styles.addItemTitle]}>
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
              <Text style={[styles.lineItemDescription]}>
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
              <Text style={[styles.lineItemTotal]}>
                Total: ${item.total.toFixed(2)}
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Totals */}
      {lineItems.length > 0 && (
        <Card variant="elevated" style={styles.totalsCard}>
          <Text style={[styles.totalsTitle]}>
            Totals
          </Text>
          <View style={styles.totalsRow}>
            <Text style={[styles.totalsLabel]}>Subtotal:</Text>
            <Text style={[styles.totalsValue]}>
              ${subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={[styles.totalsLabel]}>Tax (10%):</Text>
            <Text style={[styles.totalsValue]}>
              ${taxAmount.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.totalsRow, styles.totalRow]}>
            <Text style={[styles.totalLabel]}>Total:</Text>
            <Text style={[styles.totalValue]}>
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
  selectedClient: any;
  lineItems: InvoiceItem[];
  onBack: () => void;
  onSave: () => void;
  onSend: () => void;
}> = ({ selectedClient, lineItems, onBack, onSave, onSend }) => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.1;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle]}>
        Review & Send
      </Text>
      <Text style={[styles.stepSubtitle]}>
        Review your invoice before sending
      </Text>

      <ScrollView style={styles.reviewContent}>
        {/* Client info */}
        <Card variant="outlined" style={styles.reviewCard}>
          <Text style={[styles.reviewCardTitle]}>
            Client Information
          </Text>
          <Text style={[styles.reviewText]}>
            {selectedClient.name}
          </Text>
          <Text style={[styles.reviewText]}>
            {selectedClient.email}
          </Text>
        </Card>

        {/* Line items */}
        <Card variant="outlined" style={styles.reviewCard}>
          <Text style={[styles.reviewCardTitle]}>
            Line Items
          </Text>
          {lineItems.map((item, index) => (
            <View key={index} style={styles.reviewLineItem}>
              <Text style={[styles.reviewItemDescription]}>
                {item.description}
              </Text>
              <Text style={[styles.reviewItemDetails]}>
                {item.quantity} × ${item.unit_price.toFixed(2)} = ${item.total.toFixed(2)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Totals */}
        <Card variant="elevated" style={styles.reviewCard}>
          <Text style={[styles.reviewCardTitle]}>
            Totals
          </Text>
          <View style={styles.totalsRow}>
            <Text style={[styles.totalsLabel]}>Subtotal:</Text>
            <Text style={[styles.totalsValue]}>
              ${subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={[styles.totalsLabel]}>Tax (10%):</Text>
            <Text style={[styles.totalsValue]}>
              ${taxAmount.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.totalsRow, styles.totalRow]}>
            <Text style={[styles.totalLabel]}>Total:</Text>
            <Text style={[styles.totalValue]}>
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
          onPress={onSave}
          style={styles.saveButton}
          leftIcon={<Save size={20} color={theme.colors.primary} />}
          title="Save Draft"
        />
        <Button
          variant="primary"
          size="lg"
          onPress={onSend}
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
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([]);
  const { createInvoice } = useInvoices();

  const handleClientSelect = useCallback((client: any) => {
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
    if (!selectedClient) return;
    
    const total = lineItems.reduce((sum, item) => sum + item.total, 0) * 1.1; // Include tax
    
    createInvoice({
      clientId: selectedClient.id,
      total,
      status: 'unpaid',
      dueDate: new Date(),
      items: lineItems.map(item => ({
        id: item.id.toString(),
        description: item.description,
        qty: item.quantity,
        price: item.unit_price,
      })),
    });

    Alert.alert('Success', 'Invoice saved as draft', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  }, [selectedClient, lineItems, createInvoice]);

  const handleSend = useCallback(() => {
    if (!selectedClient) return;
    
    const total = lineItems.reduce((sum, item) => sum + item.total, 0) * 1.1; // Include tax
    
    createInvoice({
      clientId: selectedClient.id,
      total,
      status: 'unpaid',
      dueDate: new Date(),
      items: lineItems.map(item => ({
        id: item.id.toString(),
        description: item.description,
        qty: item.quantity,
        price: item.unit_price,
      })),
    });

    Alert.alert('Success', 'Invoice sent successfully', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  }, [selectedClient, lineItems, createInvoice]);

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
    <Screen>
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
          <Text style={[styles.headerTitle]}>
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
    </Screen>
  );
}

// Styles
const styles = StyleSheet.create({
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
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
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
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
  },
  stepSubtitle: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    fontSize: theme.typography.fontSize.body,
  },
  clientList: {
    flex: 1,
  },
  clientCard: {
    marginBottom: theme.spacing.md,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  clientEmail: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.fontSize.body,
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
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semibold,
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
    fontSize: theme.typography.fontSize.body,
  },
  removeItemButton: {
    paddingHorizontal: theme.spacing.sm,
  },
  lineItemDetails: {
    gap: theme.spacing.sm,
  },
  lineItemTotal: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.body,
  },
  totalsCard: {
    marginTop: theme.spacing.lg,
  },
  totalsTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  totalsLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.body,
  },
  totalsValue: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.body,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  totalLabel: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  totalValue: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semibold,
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
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  reviewText: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.fontSize.body,
  },
  reviewLineItem: {
    marginBottom: theme.spacing.md,
  },
  reviewItemDescription: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.fontSize.body,
  },
  reviewItemDetails: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.body,
  },
});
