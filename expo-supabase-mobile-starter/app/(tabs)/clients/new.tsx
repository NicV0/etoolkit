import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ArrowLeft } from 'lucide-react-native';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional()
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function NewClientScreen() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    }
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      // TODO: Implement create client logic
      console.log('Create client:', data);
      
      Alert.alert(
        'Success',
        'Client created successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create client. Please try again.');
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
          <Text className="text-lg font-semibold text-gray-900">New Client</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <Card>
          <Text className="text-lg font-semibold mb-4">Client Information</Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Name *"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                placeholder="Enter client name"
                className="mb-4"
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Phone"
                value={value}
                onChangeText={onChange}
                error={errors.phone?.message}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                className="mb-4"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                className="mb-4"
              />
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Address"
                value={value}
                onChangeText={onChange}
                error={errors.address?.message}
                placeholder="Enter address"
                multiline
                numberOfLines={3}
                className="mb-4"
              />
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Notes"
                value={value}
                onChangeText={onChange}
                error={errors.notes?.message}
                placeholder="Add any notes about this client"
                multiline
                numberOfLines={4}
                className="mb-6"
              />
            )}
          />

          <View className="flex-row gap-3">
            <Button
              variant="secondary"
              onPress={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              className="flex-1"
            >
              Create Client
            </Button>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
