import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ListItem } from '../../../components/ui/ListItem';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  User, 
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus
} from 'lucide-react-native';

// Mock job data - replace with real data from API
const mockJob = {
  id: '1',
  title: 'Kitchen Remodel',
  client: {
    id: '1',
    name: 'John Smith',
    company: 'Smith Construction',
    phone: '+1 (555) 123-4567',
    email: 'john@example.com'
  },
  status: 'in_progress',
  dueDate: '2024-02-15',
  location: '123 Main St, Anytown, ST 12345',
  description: 'Complete kitchen renovation including cabinets, countertops, and appliances. This project involves removing existing kitchen fixtures and installing new custom cabinets, granite countertops, and stainless steel appliances.',
  progress: 65,
  createdAt: '2024-01-15',
  updatedAt: '2024-01-20',
  quotes: [
    { id: '1', number: 'Q-2024-001', status: 'sent', total: 25000 },
    { id: '2', number: 'Q-2024-002', status: 'accepted', total: 28000 }
  ],
  invoices: [
    { id: '1', number: 'INV-2024-001', status: 'paid', total: 15000, balanceDue: 0 },
    { id: '2', number: 'INV-2024-002', status: 'pending', total: 13000, balanceDue: 13000 }
  ],
  documents: [
    { id: '1', title: 'Contract Agreement', type: 'pdf', size: '2.3 MB' },
    { id: '2', title: 'Site Photos', type: 'image', size: '5.1 MB' }
  ]
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'warning';
    case 'pending':
      return 'secondary';
    case 'cancelled':
      return 'error';
    default:
      return 'secondary';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle size={16} className="text-green-600" />;
    case 'in_progress':
      return <Clock size={16} className="text-yellow-600" />;
    case 'pending':
      return <AlertCircle size={16} className="text-gray-600" />;
    case 'cancelled':
      return <XCircle size={16} className="text-red-600" />;
    default:
      return <AlertCircle size={16} className="text-gray-600" />;
  }
};

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState(mockJob);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // TODO: Load job data from API
    console.log('Loading job:', id);
  }, [id]);

  const handleEditJob = () => {
    router.push(`/jobs/new?jobId=${id}`);
  };

  const handleDeleteJob = () => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete logic
            Alert.alert('Job Deleted', 'The job has been deleted successfully.');
            router.back();
          }
        }
      ]
    );
  };

  const handleClientPress = () => {
    router.push(`/clients/${job.client.id}`);
  };

  const handleCreateQuote = () => {
    router.push(`/billing/quotes/new?jobId=${id}`);
  };

  const handleCreateInvoice = () => {
    router.push(`/billing/invoices/new?jobId=${id}`);
  };

  const handleUploadDocument = () => {
    router.push(`/documents/upload?jobId=${id}`);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <LoadingSpinner text="Loading job..." />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
              className="mr-3"
            >
              <ArrowLeft size={20} />
            </Button>
            <Text className="text-lg font-semibold text-gray-900">Job Details</Text>
          </View>
          <View className="flex-row space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onPress={handleEditJob}
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={handleDeleteJob}
            >
              <Trash2 size={16} />
            </Button>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Job Header */}
        <Card className="mb-4">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <Text className="text-xl font-semibold text-gray-900 mb-2">{job.title}</Text>
              <Badge variant={getStatusColor(job.status)}>
                <View className="flex-row items-center">
                  {getStatusIcon(job.status)}
                  <Text className="ml-1 capitalize">{job.status.replace('_', ' ')}</Text>
                </View>
              </Badge>
            </View>
          </View>

          {/* Progress Bar */}
          {job.status === 'in_progress' && (
            <View className="mb-3">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-sm text-gray-600">Progress</Text>
                <Text className="text-sm text-gray-600">{job.progress}%</Text>
              </View>
              <View className="w-full bg-gray-200 rounded-full h-2">
                <View 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${job.progress}%` }}
                />
              </View>
            </View>
          )}

          {/* Job Info */}
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Calendar size={16} className="text-gray-500 mr-2" />
              <Text className="text-sm text-gray-600">Due: {new Date(job.dueDate).toLocaleDateString()}</Text>
            </View>
            <View className="flex-row items-center">
              <MapPin size={16} className="text-gray-500 mr-2" />
              <Text className="text-sm text-gray-600">{job.location}</Text>
            </View>
          </View>
        </Card>

        {/* Client Information */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-3">Client</Text>
          <Pressable onPress={handleClientPress}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-gray-900 font-medium">{job.client.name}</Text>
                {job.client.company && (
                  <Text className="text-sm text-gray-600">{job.client.company}</Text>
                )}
                <Text className="text-sm text-gray-600">{job.client.phone}</Text>
                <Text className="text-sm text-gray-600">{job.client.email}</Text>
              </View>
              <User size={16} className="text-gray-400" />
            </View>
          </Pressable>
        </Card>

        {/* Description */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-3">Description</Text>
          <Text className="text-gray-700 leading-6">{job.description}</Text>
        </Card>

        {/* Quotes */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold">Quotes</Text>
            <Button onPress={handleCreateQuote} size="sm">
              <Plus size={14} className="mr-1" />
              New Quote
            </Button>
          </View>
          {job.quotes.length > 0 ? (
            <View className="space-y-2">
              {job.quotes.map((quote) => (
                <ListItem
                  key={quote.id}
                  title={`Quote ${quote.number}`}
                  subtitle={`$${quote.total.toLocaleString()}`}
                  onPress={() => router.push(`/billing/quotes/${quote.id}`)}
                  rightIcon={<DollarSign size={16} className="text-gray-400" />}
                />
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 text-center py-4">No quotes created yet</Text>
          )}
        </Card>

        {/* Invoices */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold">Invoices</Text>
            <Button onPress={handleCreateInvoice} size="sm">
              <Plus size={14} className="mr-1" />
              New Invoice
            </Button>
          </View>
          {job.invoices.length > 0 ? (
            <View className="space-y-2">
              {job.invoices.map((invoice) => (
                <ListItem
                  key={invoice.id}
                  title={`Invoice ${invoice.number}`}
                  subtitle={`$${invoice.total.toLocaleString()} • Balance: $${invoice.balanceDue.toLocaleString()}`}
                  onPress={() => router.push(`/billing/invoices/${invoice.id}`)}
                  rightIcon={<DollarSign size={16} className="text-gray-400" />}
                />
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 text-center py-4">No invoices created yet</Text>
          )}
        </Card>

        {/* Documents */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold">Documents</Text>
            <Button onPress={handleUploadDocument} size="sm">
              <Plus size={14} className="mr-1" />
              Upload
            </Button>
          </View>
          {job.documents.length > 0 ? (
            <View className="space-y-2">
              {job.documents.map((doc) => (
                <ListItem
                  key={doc.id}
                  title={doc.title}
                  subtitle={doc.size}
                  onPress={() => router.push(`/documents/${doc.id}`)}
                  rightIcon={<FileText size={16} className="text-gray-400" />}
                />
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 text-center py-4">No documents uploaded yet</Text>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}
