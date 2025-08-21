import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { 
  Plus, 
  Search, 
  FileText, 
  Image, 
  File, 
  Download,
  Trash2,
  Calendar,
  User
} from 'lucide-react-native';

// Mock document data - replace with real data from API
const mockDocuments = [
  {
    id: '1',
    title: 'Contract Agreement',
    type: 'pdf',
    size: '2.3 MB',
    uploadedBy: 'John Smith',
    uploadedAt: '2024-01-15',
    client: { id: '1', name: 'John Smith' },
    job: { id: '1', title: 'Kitchen Remodel' }
  },
  {
    id: '2',
    title: 'Site Photos',
    type: 'image',
    size: '5.1 MB',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: '2024-01-16',
    client: { id: '1', name: 'John Smith' },
    job: { id: '1', title: 'Kitchen Remodel' }
  },
  {
    id: '3',
    title: 'Invoice Template',
    type: 'pdf',
    size: '1.2 MB',
    uploadedBy: 'Mike Wilson',
    uploadedAt: '2024-01-17',
    client: null,
    job: null
  },
  {
    id: '4',
    title: 'Project Specifications',
    type: 'pdf',
    size: '3.8 MB',
    uploadedBy: 'John Smith',
    uploadedAt: '2024-01-18',
    client: { id: '2', name: 'Sarah Johnson' },
    job: { id: '2', title: 'Bathroom Update' }
  }
];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText size={20} className="text-red-500" />;
    case 'image':
      return <Image size={20} className="text-blue-500" />;
    default:
      return <File size={20} className="text-gray-500" />;
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

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [filteredDocuments, setFilteredDocuments] = useState(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Filter documents based on search query and type filter
    let filtered = documents;
    
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.job?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === typeFilter);
    }
    
    setFilteredDocuments(filtered);
  }, [searchQuery, typeFilter, documents]);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Implement refresh logic
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleDocumentPress = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  const handleUploadDocument = () => {
    router.push('/documents/upload');
  };

  const handleDeleteDocument = (documentId: string) => {
    // TODO: Implement delete logic
    setDocuments(documents.filter(doc => doc.id !== documentId));
  };

  const renderDocumentItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => handleDocumentPress(item.id)}>
      <Card className="mb-3">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-row items-start flex-1">
            <View className="mr-3 mt-1">
              {getFileIcon(item.type)}
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900 mb-1">{item.title}</Text>
              <View className="flex-row items-center space-x-4 mb-1">
                <Badge variant={getFileTypeColor(item.type)}>
                  {item.type.toUpperCase()}
                </Badge>
                <Text className="text-sm text-gray-600">{item.size}</Text>
              </View>
              <View className="flex-row items-center space-x-4">
                <View className="flex-row items-center">
                  <User size={14} className="text-gray-500 mr-1" />
                  <Text className="text-sm text-gray-600">{item.uploadedBy}</Text>
                </View>
                <View className="flex-row items-center">
                  <Calendar size={14} className="text-gray-500 mr-1" />
                  <Text className="text-sm text-gray-600">
                    {new Date(item.uploadedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View className="flex-row space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => handleDeleteDocument(item.id)}
            >
              <Trash2 size={16} />
            </Button>
          </View>
        </View>
        
        {/* Associated Client/Job */}
        {(item.client || item.job) && (
          <View className="pt-2 border-t border-gray-100">
            <Text className="text-xs text-gray-500 mb-1">Associated with:</Text>
            <View className="flex-row space-x-4">
              {item.client && (
                <Text className="text-sm text-gray-700">
                  Client: {item.client.name}
                </Text>
              )}
              {item.job && (
                <Text className="text-sm text-gray-700">
                  Job: {item.job.title}
                </Text>
              )}
            </View>
          </View>
        )}
      </Card>
    </Pressable>
  );

  const renderTypeFilter = () => (
    <View className="flex-row space-x-2 mb-4">
      {['all', 'pdf', 'image', 'other'].map((type) => (
        <Pressable
          key={type}
          onPress={() => setTypeFilter(type)}
          className={`px-3 py-1 rounded-full border ${
            typeFilter === type
              ? 'bg-blue-500 border-blue-500'
              : 'bg-white border-gray-300'
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              typeFilter === type ? 'text-white' : 'text-gray-700'
            }`}
          >
            {type === 'all' ? 'All' : type.toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <LoadingSpinner text="Loading documents..." />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-gray-900">Documents</Text>
          <Button onPress={handleUploadDocument} size="sm">
            <Plus size={16} className="mr-1" />
            Upload
          </Button>
        </View>
      </View>

      {/* Search and Filters */}
      <View className="p-4 bg-white border-b border-gray-200">
        <View className="relative mb-4">
          <Search size={20} className="absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="pl-10"
          />
        </View>
        {renderTypeFilter()}
      </View>

      {/* Documents List */}
      <View className="flex-1 p-4">
        {filteredDocuments.length > 0 ? (
          <FlatList
            data={filteredDocuments}
            renderItem={renderDocumentItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <EmptyState
            icon={<FileText size={48} className="text-gray-400" />}
            title="No documents found"
            subtitle={searchQuery || typeFilter !== 'all' 
              ? "No documents match your current filters" 
              : "You haven't uploaded any documents yet"}
            action={
              <Button onPress={handleUploadDocument} className="mt-4">
                Upload Your First Document
              </Button>
            }
          />
        )}
      </View>
    </View>
  );
}
