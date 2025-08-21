import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { ListItem } from '../../../../components/ui/ListItem';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit, Send, FileText, Download, DollarSign, Calendar, User, CreditCard } from 'lucide-react-native';

// Mock data - replace with real data fetching
const mockInvoice = {
  id: '1',
  number: 'INV-2024-001',
  client: {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com'
  },
  status: 'sent',
  issueDate: '2024-01-15',
  dueDate: '2024-02-14',
  currency: 'USD',
  taxRate: 8.5,
  discount: 0,
  subtotal: 2500,
  taxTotal: 212.5,
  total: 2712.5,
  balanceDue: 2712.5,
  terms: 'Net 30 days',
  items: [
    {
      id: '1',
      description: 'Kitchen Cabinet Installation',
      quantity: 1,
      unitPrice: 1500,
      taxable: true,
      lineTotal: 1500
    },
    {
      id: '2',
      description: 'Granite Countertop',
      quantity: 25,
      unitPrice: 40,
      taxable: true,
      lineTotal: 1000
    }
  ],
  payments: [
    {
      id: '1',
      amount: 500,
      method: 'credit_card',
      receivedAt: '2024-01-20',
      note: 'Partial payment'
    }
  ]
};

const paymentSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  method: z.string().min(1, 'Payment method is required'),
  note: z.string().optional()
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [invoice] = useState(mockInvoice); // Replace with real data fetching

  const { control, handleSubmit, formState: { errors }, reset } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: '',
      method: 'credit_card',
      note: ''
    }
  });

  const onSubmitPayment = (data: PaymentFormData) => {
    // TODO: Implement payment recording logic
    console.log('Record payment:', data);
    setIsRecordingPayment(false);
    reset();
    Alert.alert('Success', 'Payment recorded successfully');
  };

  const handleSend = () => {
    Alert.alert(
      'Send Invoice',
      'Send this invoice to the client?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: () => {
            // TODO: Implement send logic
            Alert.alert('Success', 'Invoice sent successfully');
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'warning';
      case 'paid': return 'success';
      case 'overdue': return 'error';
      default: return 'secondary';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Credit Card';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash';
      case 'check': return 'Check';
      default: return method;
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">{invoice.number}</Text>
            <Text className="text-gray-600">Invoice</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View className="mb-4">
          <Badge variant={getStatusColor(invoice.status)}>
            {invoice.status}
          </Badge>
        </View>

        {/* Invoice Information */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-3">Invoice Details</Text>
          
          <ListItem
            icon={<User size={16} />}
            title="Client"
            subtitle={invoice.client.name}
            onPress={() => router.push(`/clients/${invoice.client.id}`)}
          />
          
          <ListItem
            icon={<Calendar size={16} />}
            title="Issue Date"
            subtitle={new Date(invoice.issueDate).toLocaleDateString()}
          />
          
          <ListItem
            icon={<Calendar size={16} />}
            title="Due Date"
            subtitle={new Date(invoice.dueDate).toLocaleDateString()}
          />
          
          <ListItem
            icon={<DollarSign size={16} />}
            title="Currency"
            subtitle={invoice.currency}
          />
        </Card>

        {/* Line Items */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-3">Items</Text>
          
          {invoice.items.map((item) => (
            <View key={item.id} className="border-b border-gray-100 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
              <View className="flex-row justify-between items-start mb-1">
                <Text className="font-medium text-gray-900 flex-1">{item.description}</Text>
                <Text className="font-semibold text-gray-900">${item.lineTotal.toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between text-sm text-gray-600">
                <Text>{item.quantity} × ${item.unitPrice.toFixed(2)}</Text>
                <Text>{item.taxable ? 'Taxable' : 'Non-taxable'}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Totals */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-3">Summary</Text>
          
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="font-medium">${invoice.subtotal.toFixed(2)}</Text>
            </View>
            
            {invoice.taxTotal > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Tax ({invoice.taxRate}%)</Text>
                <Text className="font-medium">${invoice.taxTotal.toFixed(2)}</Text>
              </View>
            )}
            
            {invoice.discount > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Discount</Text>
                <Text className="font-medium">-${invoice.discount.toFixed(2)}</Text>
              </View>
            )}
            
            <View className="flex-row justify-between pt-2 border-t border-gray-200">
              <Text className="text-lg font-semibold">Total</Text>
              <Text className="text-lg font-bold">${invoice.total.toFixed(2)}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Balance Due</Text>
              <Text className="text-lg font-bold text-red-600">${invoice.balanceDue.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        {/* Payments */}
        {invoice.payments.length > 0 && (
          <Card className="mb-4">
            <Text className="text-lg font-semibold mb-3">Payments</Text>
            
            {invoice.payments.map((payment) => (
              <ListItem
                key={payment.id}
                icon={<CreditCard size={16} />}
                title={`$${payment.amount.toFixed(2)} - ${getPaymentMethodLabel(payment.method)}`}
                subtitle={`${new Date(payment.receivedAt).toLocaleDateString()}${payment.note ? ` • ${payment.note}` : ''}`}
              />
            ))}
          </Card>
        )}

        {/* Terms */}
        {invoice.terms && (
          <Card className="mb-4">
            <Text className="text-lg font-semibold mb-3">Terms</Text>
            <Text className="text-gray-600">{invoice.terms}</Text>
          </Card>
        )}

        {/* Actions */}
        <View className="space-y-3">
          <Button
            onPress={handleSend}
            className="w-full"
          >
            <Send size={16} className="mr-2" />
            Send Invoice
          </Button>
          
          <Button
            variant="secondary"
            onPress={() => setIsRecordingPayment(true)}
            className="w-full"
          >
            <DollarSign size={16} className="mr-2" />
            Record Payment
          </Button>
          
          <Button
            variant="ghost"
            onPress={() => {
              // TODO: Implement PDF generation
              Alert.alert('PDF', 'Generate PDF functionality coming soon');
            }}
            className="w-full"
          >
            <Download size={16} className="mr-2" />
            Download PDF
          </Button>
        </View>
      </View>

      {/* Record Payment Modal */}
      <Modal
        visible={isRecordingPayment}
        onClose={() => setIsRecordingPayment(false)}
        title="Record Payment"
      >
        <View className="p-4">
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Amount *"
                value={value}
                onChangeText={onChange}
                error={errors.amount?.message}
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="mb-4"
              />
            )}
          />

          <Controller
            control={control}
            name="method"
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Payment Method *</Text>
                <View className="space-y-2">
                  {[
                    { value: 'credit_card', label: 'Credit Card' },
                    { value: 'bank_transfer', label: 'Bank Transfer' },
                    { value: 'cash', label: 'Cash' },
                    { value: 'check', label: 'Check' }
                  ].map((method) => (
                    <Button
                      key={method.value}
                      variant={value === method.value ? 'primary' : 'ghost'}
                      onPress={() => onChange(method.value)}
                      className="justify-start"
                    >
                      {method.label}
                    </Button>
                  ))}
                </View>
                {errors.method?.message && (
                  <Text className="text-sm text-red-600 mt-1">{errors.method.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Note"
                value={value}
                onChangeText={onChange}
                error={errors.note?.message}
                placeholder="Optional payment note"
                multiline
                numberOfLines={2}
                className="mb-6"
              />
            )}
          />

          <View className="flex-row gap-3">
            <Button
              variant="secondary"
              onPress={() => setIsRecordingPayment(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onPress={handleSubmit(onSubmitPayment)}
              className="flex-1"
            >
              Record Payment
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
