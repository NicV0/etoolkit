import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ListItem } from '../../../components/ui/ListItem';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit, Phone, Mail, MapPin, Calendar, FileText, Trash2 } from 'lucide-react-native';

// Mock data - replace with real data fetching
const mockClient = {
  id: '1',
  name: 'John Smith',
  phone: '+1 (555) 123-4567',
  email: 'john.smith@example.com',
  address: '123 Main St, Anytown, ST 12345',
  notes: 'Prefers morning appointments. Has a dog.',
  status: 'active',
  createdAt: '2024-01-15',
  jobs: [
    { id: '1', title: 'Kitchen Remodel', status: 'in-progress', dueDate: '2024-02-15' },
    { id: '2', title: 'Bathroom Update', status: 'completed', dueDate: '2024-01-30' }
  ],
  documents: [
    { id: '1', title: 'Contract.pdf', size: '2.3 MB', uploadedAt: '2024-01-20' },
    { id: '2', title: 'Permit.pdf', size: '1.1 MB', uploadedAt: '2024-01-18' }
  ]
};

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional()
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [client] = useState(mockClient); // Replace with real data fetching

  const { control, handleSubmit, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      notes: client.notes
    }
  });

  const onSubmit = (data: ClientFormData) => {
    // TODO: Implement update logic
    console.log('Update client:', data);
    setIsEditing(false);
    Alert.alert('Success', 'Client updated successfully');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Client',
      'Are you sure you want to delete this client? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete logic
            router.back();
          }
        }
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">{client.name}</Text>
          <View className="flex-row gap-2">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setIsEditing(true)}
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={handleDelete}
            >
              <Trash2 size={16} />
            </Button>
          </View>
        </View>

        {/* Status Badge */}
        <View className="mb-4">
          <Badge variant={client.status === 'active' ? 'success' : 'secondary'}>
            {client.status}
          </Badge>
        </View>

        {/* Client Information */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-3">Contact Information</Text>
          
          <ListItem
            icon={<Phone size={16} />}
            title="Phone"
            subtitle={client.phone}
          />
          
          <ListItem
            icon={<Mail size={16} />}
            title="Email"
            subtitle={client.email}
          />
          
          <ListItem
            icon={<MapPin size={16} />}
            title="Address"
            subtitle={client.address}
          />
          
          <ListItem
            icon={<Calendar size={16} />}
            title="Member Since"
            subtitle={new Date(client.createdAt).toLocaleDateString()}
          />
        </Card>

        {/* Notes */}
        {client.notes && (
          <Card className="mb-4">
            <Text className="text-lg font-semibold mb-3">Notes</Text>
            <Text className="text-gray-600">{client.notes}</Text>
          </Card>
        )}

        {/* Jobs */}
        <Card className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold">Jobs</Text>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.push(`/jobs/new?clientId=${client.id}`)}
            >
              Add Job
            </Button>
          </View>
          
          {client.jobs.map((job) => (
            <ListItem
              key={job.id}
              title={job.title}
              subtitle={`Due: ${new Date(job.dueDate).toLocaleDateString()}`}
              rightElement={
                <Badge variant={job.status === 'completed' ? 'success' : 'warning'}>
                  {job.status}
                </Badge>
              }
              onPress={() => router.push(`/jobs/${job.id}`)}
            />
          ))}
        </Card>

        {/* Documents */}
        <Card className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold">Documents</Text>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.push(`/documents/upload?clientId=${client.id}`)}
            >
              Upload
            </Button>
          </View>
          
          {client.documents.map((doc) => (
            <ListItem
              key={doc.id}
              icon={<FileText size={16} />}
              title={doc.title}
              subtitle={`${doc.size} • ${new Date(doc.uploadedAt).toLocaleDateString()}`}
              onPress={() => router.push(`/documents/${doc.id}`)}
            />
          ))}
        </Card>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Client"
      >
        <View className="p-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Name"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
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
                keyboardType="email-address"
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
                multiline
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
                multiline
                className="mb-4"
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
