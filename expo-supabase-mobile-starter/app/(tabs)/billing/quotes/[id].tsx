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
import { Edit, Send, FileText, Download, Copy, ArrowLeft, DollarSign, Calendar, User } from 'lucide-react-native';

// Mock data - replace with real data fetching
const mockQuote = {
  id: '1',
  number: 'Q-2024-001',
  client: {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com'
  },
  status: 'draft',
  issueDate: '2024-01-15',
  validUntil: '2024-02-15',
  currency: 'USD',
  taxRate: 8.5,
  discount: 0,
  subtotal: 2500,
  taxTotal: 212.5,
  total: 2712.5,
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
  ]
};

const quoteSchema = z.object({
  terms: z.string().optional(),
  validUntil: z.string().optional()
});

type QuoteFormData = z.infer<typeof quoteSchema>;

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [quote] = useState(mockQuote); // Replace with real data fetching

  const { control, handleSubmit, formState: { errors } } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      terms: quote.terms,
      validUntil: quote.validUntil
    }
  });

  const onSubmit = (data: QuoteFormData) => {
    // TODO: Implement update logic
    console.log('Update quote:', data);
    setIsEditing(false);
    Alert.alert('Success', 'Quote updated successfully');
  };

  const handleSend = () => {
    Alert.alert(
      'Send Quote',
      'Send this quote to the client?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: () => {
            // TODO: Implement send logic
            Alert.alert('Success', 'Quote sent successfully');
          }
        }
      ]
    );
  };

  const handleConvertToInvoice = () => {
    Alert.alert(
      'Convert to Invoice',
      'Convert this quote to an invoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Convert', 
          onPress: () => {
            // TODO: Implement conversion logic
            router.push(`/billing/invoices/new?quoteId=${quote.id}`);
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'secondary';
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">{quote.number}</Text>
            <Text className="text-gray-600">Quote</Text>
          </View>
          <View className="flex-row gap-2">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setIsEditing(true)}
            >
              <Edit size={16} />
            </Button>
          </View>
        </View>

        {/* Status Badge */}
        <View className="mb-4">
          <Badge variant={getStatusColor(quote.status)}>
            {quote.status}
          </Badge>
        </View>

        {/* Quote Information */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-3">Quote Details</Text>
          
          <ListItem
            icon={<User size={16} />}
            title="Client"
            subtitle={quote.client.name}
            onPress={() => router.push(`/clients/${quote.client.id}`)}
          />
          
          <ListItem
            icon={<Calendar size={16} />}
            title="Issue Date"
            subtitle={new Date(quote.issueDate).toLocaleDateString()}
          />
          
          <ListItem
            icon={<Calendar size={16} />}
            title="Valid Until"
            subtitle={new Date(quote.validUntil).toLocaleDateString()}
          />
          
          <ListItem
            icon={<DollarSign size={16} />}
            title="Currency"
            subtitle={quote.currency}
          />
        </Card>

        {/* Line Items */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-3">Items</Text>
          
          {quote.items.map((item) => (
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
              <Text className="font-medium">${quote.subtotal.toFixed(2)}</Text>
            </View>
            
            {quote.taxTotal > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Tax ({quote.taxRate}%)</Text>
                <Text className="font-medium">${quote.taxTotal.toFixed(2)}</Text>
              </View>
            )}
            
            {quote.discount > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Discount</Text>
                <Text className="font-medium">-${quote.discount.toFixed(2)}</Text>
              </View>
            )}
            
            <View className="flex-row justify-between pt-2 border-t border-gray-200">
              <Text className="text-lg font-semibold">Total</Text>
              <Text className="text-lg font-bold">${quote.total.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        {/* Terms */}
        {quote.terms && (
          <Card className="mb-4">
            <Text className="text-lg font-semibold mb-3">Terms</Text>
            <Text className="text-gray-600">{quote.terms}</Text>
          </Card>
        )}

        {/* Actions */}
        <View className="space-y-3">
          <Button
            onPress={handleSend}
            className="w-full"
          >
            <Send size={16} className="mr-2" />
            Send Quote
          </Button>
          
          <Button
            variant="secondary"
            onPress={handleConvertToInvoice}
            className="w-full"
          >
            <Copy size={16} className="mr-2" />
            Convert to Invoice
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

      {/* Edit Modal */}
      <Modal
        visible={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Quote"
      >
        <View className="p-4">
          <Controller
            control={control}
            name="terms"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Terms"
                value={value}
                onChangeText={onChange}
                error={errors.terms?.message}
                multiline
                numberOfLines={3}
                className="mb-4"
              />
            )}
          />

          <Controller
            control={control}
            name="validUntil"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Valid Until"
                value={value}
                onChangeText={onChange}
                error={errors.validUntil?.message}
                placeholder="YYYY-MM-DD"
                className="mb-6"
              />
            )}
          />

          <View className="flex-row gap-3">
            <Button
              variant="secondary"
              onPress={() => setIsEditing(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onPress={handleSubmit(onSubmit)}
              className="flex-1"
            >
              Save Changes
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
