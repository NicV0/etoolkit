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
  Download, 
  Share, 
  FileText, 
  Image, 
  File,
  Calendar,
  User,
  Eye
} from 'lucide-react-native';

// Mock document data - replace with real data from API
const mockDocument = {
  id: '1',
  title: 'Contract Agreement',
  description: 'Standard contract agreement for kitchen remodel project',
  type: 'pdf',
  size: '2.3 MB',
  uploadedBy: 'John Smith',
  uploadedAt: '2024-01-15',
  lastModified: '2024-01-15',
  client: { id: '1', name: 'John Smith', company: 'Smith Construction' },
  job: { id: '1', title: 'Kitchen Remodel' },
  url: 'https://example.com/document.pdf'
};

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText size={24} className="text-red-500" />;
    case 'image':
      return <Image size={24} className="text-blue-500" />;
    default:
      return <File size={24} className="text-gray-500" />;
  }
};

const getFileTypeColor = (type: string) => {
  switch (type) {
    case 'pdf':
      return 'error';
    case 'image':
      return 'primary';
    default:
      return 'secondary';
  }
};

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [document, setDocument] = useState(mockDocument);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // TODO: Load document data from API
    console.log('Loading document:', id);
  }, [id]);

  const handleEditDocument = () => {
    // TODO: Implement edit functionality
    Alert.alert('Edit Document', 'Edit functionality coming soon');
  };

  const handleDeleteDocument = () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete logic
            Alert.alert('Document Deleted', 'The document has been deleted successfully.');
            router.back();
          }
        }
      ]
    );
  };

  const handleDownloadDocument = () => {
    // TODO: Implement download functionality
    Alert.alert('Download', 'Download functionality coming soon');
  };

  const handleShareDocument = () => {
    // TODO: Implement share functionality
    Alert.alert('Share', 'Share functionality coming soon');
  };

  const handleViewDocument = () => {
    // TODO: Implement view functionality
    Alert.alert('View Document', 'Document viewer coming soon');
  };

  const handleClientPress = () => {
    if (document.client) {
      router.push(`/clients/${document.client.id}`);
    }
  };

  const handleJobPress = () => {
    if (document.job) {
      router.push(`/jobs/${document.job.id}`);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <LoadingSpinner text="Loading document..." />
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
            <Text className="text-lg font-semibold text-gray-900">Document Details</Text>
          </View>
          <View className="flex-row space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onPress={handleEditDocument}
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={handleDeleteDocument}
            >
              <Trash2 size={16} />
            </Button>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Document Header */}
        <Card className="mb-4">
          <View className="flex-row items-start mb-4">
            <View className="mr-4">
              {getFileIcon(document.type)}
            </View>
            <View className="flex-1">
              <Text className="text-xl font-semibold text-gray-900 mb-2">{document.title}</Text>
              <Badge variant={getFileTypeColor(document.type)}>
                {document.type.toUpperCase()}
              </Badge>
            </View>
          </View>

          {document.description && (
            <Text className="text-gray-700 leading-6 mb-4">{document.description}</Text>
          )}

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            <Button
              onPress={handleViewDocument}
              variant="secondary"
              className="flex-1"
            >
              <Eye size={16} className="mr-2" />
              View
            </Button>
            <Button
              onPress={handleDownloadDocument}
              variant="secondary"
              className="flex-1"
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
            <Button
              onPress={handleShareDocument}
              variant="secondary"
              className="flex-1"
            >
              <Share size={16} className="mr-2" />
              Share
            </Button>
          </View>
        </Card>

        {/* Document Information */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Document Information</Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">File Size</Text>
              <Text className="text-gray-900">{document.size}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">File Type</Text>
              <Text className="text-gray-900">{document.type.toUpperCase()}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Uploaded By</Text>
              <Text className="text-gray-900">{document.uploadedBy}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Upload Date</Text>
              <Text className="text-gray-900">
                {new Date(document.uploadedAt).toLocaleDateString()}
              </Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Last Modified</Text>
              <Text className="text-gray-900">
                {new Date(document.lastModified).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Associations */}
        {(document.client || document.job) && (
          <Card className="mb-4">
            <Text className="text-lg font-semibold mb-4">Associations</Text>
            
            {document.client && (
              <Pressable onPress={handleClientPress} className="mb-3">
                <View className="flex-row items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <View>
                    <Text className="text-gray-900 font-medium">Client</Text>
                    <Text className="text-sm text-gray-600">{document.client.name}</Text>
                    {document.client.company && (
                      <Text className="text-sm text-gray-600">{document.client.company}</Text>
                    )}
                  </View>
                  <User size={16} className="text-gray-400" />
                </View>
              </Pressable>
            )}
            
            {document.job && (
              <Pressable onPress={handleJobPress}>
                <View className="flex-row items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <View>
                    <Text className="text-gray-900 font-medium">Job</Text>
                    <Text className="text-sm text-gray-600">{document.job.title}</Text>
                  </View>
                  <Calendar size={16} className="text-gray-400" />
                </View>
              </Pressable>
            )}
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Quick Actions</Text>
          
          <View className="space-y-3">
            {document.client && (
              <Button
                variant="secondary"
                onPress={handleClientPress}
                className="justify-start"
              >
                <User size={16} className="mr-2" />
                View Client Details
              </Button>
            )}
            
            {document.job && (
              <Button
                variant="secondary"
                onPress={handleJobPress}
                className="justify-start"
              >
                <Calendar size={16} className="mr-2" />
                View Job Details
              </Button>
            )}
            
            <Button
              variant="secondary"
              onPress={() => router.push('/billing/quotes/new')}
              className="justify-start"
            >
              <FileText size={16} className="mr-2" />
              Create Quote from Document
            </Button>
            
            <Button
              variant="secondary"
              onPress={() => router.push('/billing/invoices/new')}
              className="justify-start"
            >
              <FileText size={16} className="mr-2" />
              Create Invoice from Document
            </Button>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
