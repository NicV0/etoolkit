import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface Invoice {
  id: string;
  client_id: string;
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  total_amount: number;
  tax_rate: number;
  due_date: string;
  created_at: string;
  client_name?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const COMMON_SERVICES = [
  { name: 'Plumbing Repair', rate: 85 },
  { name: 'Electrical Installation', rate: 95 },
  { name: 'HVAC Maintenance', rate: 120 },
  { name: 'Carpentry Work', rate: 75 },
  { name: 'Painting (per room)', rate: 300 },
  { name: 'Flooring Installation', rate: 8 }, // per sq ft
  { name: 'Roofing Repair', rate: 150 },
  { name: 'General Labor', rate: 65 },
];

export default function Billing() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Invoice creation state
  const [selectedClient, setSelectedClient] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(8.5);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    try {
      const [invoicesResult, clientsResult] = await Promise.all([
        supabase
          .from('invoices')
          .select(`
            *,
            clients!inner(name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('clients')
          .select('id, name, email')
          .eq('user_id', user.id)
      ]);

      if (invoicesResult.data) {
        const invoicesWithClientNames = invoicesResult.data.map(invoice => ({
          ...invoice,
          client_name: invoice.clients?.name || 'Unknown Client'
        }));
        setInvoices(invoicesWithClientNames);
      }

      if (clientsResult.data) {
        setClients(clientsResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(items => 
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(items => items.filter(item => item.id !== id));
    }
  };

  const addCommonService = (service: typeof COMMON_SERVICES[0]) => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: service.name,
      quantity: 1,
      rate: service.rate,
      amount: service.rate,
    };
    setLineItems([...lineItems, newItem]);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const createInvoice = async () => {
    if (!selectedClient || lineItems.every(item => !item.description)) {
      Alert.alert('Error', 'Please select a client and add at least one line item');
      return;
    }

    try {
      const invoiceNumber = `INV-${Date.now()}`;
      const { error } = await supabase.from('invoices').insert({
        user_id: user!.id,
        client_id: selectedClient,
        invoice_number: invoiceNumber,
        status: 'draft',
        total_amount: calculateTotal(),
        tax_rate: taxRate,
        due_date: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });

      if (error) throw error;

      // Reset form
      setSelectedClient('');
      setLineItems([{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }]);
      setTaxRate(8.5);
      setDueDate('');
      setShowCreateModal(false);
      
      loadData();
      Alert.alert('Success', 'Invoice created successfully');
    } catch (error) {
      console.error('Error creating invoice:', error);
      Alert.alert('Error', 'Failed to create invoice');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#34C759';
      case 'sent': return '#007AFF';
      case 'overdue': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const renderInvoice = (invoice: Invoice) => (
    <Card key={invoice.id} style={styles.invoiceCard}>
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
          <Text style={styles.clientName}>{invoice.client_name}</Text>
        </View>
        <View style={styles.invoiceStatus}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(invoice.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(invoice.status) }]}>
            {invoice.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.invoiceDetails}>
        <Text style={styles.invoiceAmount}>${invoice.total_amount.toFixed(2)}</Text>
        <Text style={styles.invoiceDate}>
          Due: {new Date(invoice.due_date).toLocaleDateString()}
        </Text>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading billing data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Billing & Invoices</Text>
        <Pressable
          onPress={() => setShowCreateModal(true)}
          style={styles.createButton}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {invoices.filter(i => i.status === 'sent').length}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: '#FF3B30' }]}>
              {invoices.filter(i => i.status === 'overdue').length}
            </Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
          </Card>
        </View>

        {/* Recent Invoices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Invoices</Text>
          {invoices.length > 0 ? (
            invoices.map(renderInvoice)
          ) : (
            <Card>
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#8E8E93" />
                <Text style={styles.emptyTitle}>No Invoices Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Create your first invoice to get started
                </Text>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Create Invoice Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Create Invoice</Text>
            <Pressable onPress={createInvoice}>
              <Text style={styles.saveButton}>Create</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Client Selection */}
            <Card>
              <Text style={styles.sectionTitle}>Client</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedClient}
                  onValueChange={setSelectedClient}
                >
                  <Picker.Item label="Select a client..." value="" />
                  {clients.map(client => (
                    <Picker.Item key={client.id} label={client.name} value={client.id} />
                  ))}
                </Picker>
              </View>
            </Card>

            {/* Line Items */}
            <Card>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Line Items</Text>
                <Pressable onPress={addLineItem} style={styles.addItemButton}>
                  <Ionicons name="add" size={20} color="#007AFF" />
                </Pressable>
              </View>

              {lineItems.map((item, index) => (
                <View key={item.id} style={styles.lineItem}>
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChangeText={(text) => updateLineItem(item.id, 'description', text)}
                  />
                  <View style={styles.lineItemRow}>
                    <Input
                      placeholder="Qty"
                      value={item.quantity.toString()}
                      onChangeText={(text) => updateLineItem(item.id, 'quantity', parseFloat(text) || 0)}
                      keyboardType="numeric"
                      style={styles.quantityInput}
                    />
                    <Input
                      placeholder="Rate"
                      value={item.rate.toString()}
                      onChangeText={(text) => updateLineItem(item.id, 'rate', parseFloat(text) || 0)}
                      keyboardType="numeric"
                      style={styles.rateInput}
                    />
                    <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
                    {lineItems.length > 1 && (
                      <Pressable onPress={() => removeLineItem(item.id)}>
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </Card>

            {/* Common Services */}
            <Card>
              <Text style={styles.sectionTitle}>Quick Add Services</Text>
              <View style={styles.servicesGrid}>
                {COMMON_SERVICES.map((service, index) => (
                  <Pressable
                    key={index}
                    style={styles.serviceButton}
                    onPress={() => addCommonService(service)}
                  >
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceRate}>${service.rate}</Text>
                  </Pressable>
                ))}
              </View>
            </Card>

            {/* Tax and Total */}
            <Card>
              <Text style={styles.sectionTitle}>Tax & Total</Text>
              <Input
                label="Tax Rate (%)"
                value={taxRate.toString()}
                onChangeText={(text) => setTaxRate(parseFloat(text) || 0)}
                keyboardType="numeric"
              />
              
              <View style={styles.totalsContainer}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal:</Text>
                  <Text style={styles.totalValue}>${calculateSubtotal().toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tax ({taxRate}%):</Text>
                  <Text style={styles.totalValue}>${calculateTax().toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, styles.grandTotalRow]}>
                  <Text style={styles.grandTotalLabel}>Total:</Text>
                  <Text style={styles.grandTotalValue}>${calculateTotal().toFixed(2)}</Text>
                </View>
              </View>
            </Card>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  summaryCard: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addItemButton: {
    padding: 4,
  },
  invoiceCard: {
    marginBottom: 12,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  clientName: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  invoiceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  cancelButton: {
    fontSize: 16,
    color: '#8E8E93',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  lineItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  lineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityInput: {
    flex: 1,
    marginBottom: 0,
  },
  rateInput: {
    flex: 1,
    marginBottom: 0,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    minWidth: 80,
    textAlign: 'right',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  serviceRate: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  totalsContainer: {
    marginTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  totalValue: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 8,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
});