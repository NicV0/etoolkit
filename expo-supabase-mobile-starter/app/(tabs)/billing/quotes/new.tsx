import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { ArrowLeft, Plus, Trash2, User } from 'lucide-react-native';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  unitPrice: z.string().min(1, 'Unit price is required'),
  taxable: z.boolean().default(true)
});

const quoteSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  validUntil: z.string().min(1, 'Valid until date is required'),
  terms: z.string().optional(),
  items: z.array(lineItemSchema).min(1, 'At least one item is required')
});

type QuoteFormData = z.infer<typeof quoteSchema>;
type LineItem = z.infer<typeof lineItemSchema>;

export default function NewQuoteScreen() {
  const { quoteId } = useLocalSearchParams<{ quoteId?: string }>();
  const [items, setItems] = useState<LineItem[]>([
    { description: '', quantity: '1', unitPrice: '', taxable: true }
  ]);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const { control, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      clientId: '',
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      terms: 'Net 30 days',
      items: [{ description: '', quantity: '1', unitPrice: '', taxable: true }]
    }
  });

  const addItem = () => {
    const newItem = { description: '', quantity: '1', unitPrice: '', taxable: true };
    setItems([...items, newItem]);
    setValue('items', [...items, newItem]);
  };

  const handleClientSelect = () => {
    router.push({
      pathname: '/clients/select' as any,
      params: { returnTo: '/billing/quotes/new' }
    });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setValue('items', newItems);
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | boolean) => {
    const newItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setItems(newItems);
    setValue('items', newItems);
  };

  const onSubmit = async (data: QuoteFormData) => {
    try {
      // TODO: Implement create quote logic
      console.log('Create quote:', data);
      
      Alert.alert(
        'Success',
        'Quote created successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create quote. Please try again.');
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
            className="mr-3"
          >
            <ArrowLeft size={20} />
          </Button>
          <Text className="text-lg font-semibold text-gray-900">
            {quoteId ? 'Edit Quote' : 'New Quote'}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <Card>
          <Text className="text-lg font-semibold mb-4">Quote Information</Text>

          {/* Client Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Client *</Text>
            <Pressable
              onPress={handleClientSelect}
              className="border border-gray-300 rounded-lg p-3 bg-white"
            >
              {selectedClient ? (
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-gray-900 font-medium">{selectedClient.name}</Text>
                    {selectedClient.company && (
                      <Text className="text-sm text-gray-600">{selectedClient.company}</Text>
                    )}
                  </View>
                  <User size={16} className="text-gray-400" />
                </View>
              ) : (
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-500">Select a client</Text>
                  <User size={16} className="text-gray-400" />
                </View>
              )}
            </Pressable>
            {errors.clientId && (
              <Text className="text-red-500 text-sm mt-1">{errors.clientId.message}</Text>
            )}
          </View>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Controller
                control={control}
                name="issueDate"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Issue Date *"
                    value={value}
                    onChangeText={onChange}
                    error={errors.issueDate?.message}
                    placeholder="YYYY-MM-DD"
                    className="mb-4"
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={control}
                name="validUntil"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Valid Until *"
                    value={value}
                    onChangeText={onChange}
                    error={errors.validUntil?.message}
                    placeholder="YYYY-MM-DD"
                    className="mb-4"
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="terms"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Terms"
                value={value}
                onChangeText={onChange}
                error={errors.terms?.message}
                placeholder="Payment terms"
                multiline
                numberOfLines={2}
                className="mb-6"
              />
            )}
          />
        </Card>

        {/* Line Items */}
        <Card className="mt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold">Items</Text>
            <Button
              variant="ghost"
              size="sm"
              onPress={addItem}
            >
              <Plus size={16} />
            </Button>
          </View>

          {items.map((item, index) => (
            <View key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-sm font-medium text-gray-700">Item {index + 1}</Text>
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => removeItem(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </View>

              <Input
                label="Description *"
                value={item.description}
                onChangeText={(value) => updateItem(index, 'description', value)}
                placeholder="Item description"
                className="mb-3"
              />

              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <Input
                    label="Quantity *"
                    value={item.quantity}
                    onChangeText={(value) => updateItem(index, 'quantity', value)}
                    placeholder="1"
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Unit Price *"
                    value={item.unitPrice}
                    onChangeText={(value) => updateItem(index, 'unitPrice', value)}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <Button
                variant={item.taxable ? 'primary' : 'ghost'}
                onPress={() => updateItem(index, 'taxable', !item.taxable)}
                className="justify-start"
              >
                {item.taxable ? '✓ Taxable' : 'Taxable'}
              </Button>
            </View>
          ))}

          {errors.items?.message && (
            <Text className="text-sm text-red-600 mb-4">{errors.items.message}</Text>
          )}
        </Card>

        {/* Actions */}
        <View className="mt-6 space-y-3">
          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            className="w-full"
          >
            {quoteId ? 'Update Quote' : 'Create Quote'}
          </Button>
          
          <Button
            variant="secondary"
            onPress={() => router.back()}
            className="w-full"
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
