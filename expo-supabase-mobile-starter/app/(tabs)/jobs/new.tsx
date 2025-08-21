import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ArrowLeft, User, MapPin, Calendar, FileText } from 'lucide-react-native';

const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  clientId: z.string().min(1, 'Client is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending')
});

type JobFormData = z.infer<typeof jobSchema>;

// Mock client data - replace with real data from API
const mockClients = [
  { id: '1', name: 'John Smith', company: 'Smith Construction' },
  { id: '2', name: 'Sarah Johnson', company: 'Johnson Plumbing' },
  { id: '3', name: 'Mike Wilson', company: 'Wilson Electric' }
];

export default function NewJobScreen() {
  const { jobId } = useLocalSearchParams<{ jobId?: string }>();
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      clientId: '',
      description: '',
      location: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
      status: 'pending'
    }
  });

  const handleClientSelect = () => {
    router.push({
      pathname: '/clients/select' as any,
      params: { returnTo: '/jobs/new' }
    });
  };

  const handleSubmitJob = async (data: JobFormData) => {
    try {
      setIsLoading(true);
      
      // TODO: Implement create job logic
      console.log('Create job:', data);
      
      Alert.alert(
        'Success',
        'Job created successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create job. Please try again.');
    } finally {
      setIsLoading(false);
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
            {jobId ? 'Edit Job' : 'New Job'}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Job Details</Text>
          
          {/* Job Title */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Job Title *"
                value={value}
                onChangeText={onChange}
                error={errors.title?.message}
                className="mb-4"
                placeholder="e.g., Kitchen Remodel, Bathroom Update"
              />
            )}
          />

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

          {/* Description */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Description *"
                value={value}
                onChangeText={onChange}
                error={errors.description?.message}
                className="mb-4"
                multiline
                numberOfLines={4}
                placeholder="Describe the work to be done..."
              />
            )}
          />

          {/* Location */}
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Location *"
                value={value}
                onChangeText={onChange}
                error={errors.location?.message}
                className="mb-4"
                placeholder="e.g., 123 Main St, Anytown, ST 12345"
              />
            )}
          />

          {/* Due Date */}
          <Controller
            control={control}
            name="dueDate"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Due Date *"
                value={value}
                onChangeText={onChange}
                error={errors.dueDate?.message}
                className="mb-4"
                placeholder="YYYY-MM-DD"
              />
            )}
          />
        </Card>

        {/* Quick Actions */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Quick Actions</Text>
          
          <View className="space-y-3">
            <Button
              variant="secondary"
              onPress={() => router.push('/billing/quotes/new')}
              className="justify-start"
            >
              <FileText size={16} className="mr-2" />
              Create Quote for This Job
            </Button>
            
            <Button
              variant="secondary"
              onPress={() => router.push('/documents/upload')}
              className="justify-start"
            >
              <FileText size={16} className="mr-2" />
              Upload Job Documents
            </Button>
          </View>
        </Card>
      </ScrollView>

      {/* Submit Button */}
      <View className="p-4 bg-white border-t border-gray-200">
        <Button
          onPress={handleSubmit(handleSubmitJob)}
          disabled={isSubmitting || isLoading}
          className="w-full"
        >
          {isSubmitting || isLoading ? 'Creating...' : 'Create Job'}
        </Button>
      </View>
    </View>
  );
}
