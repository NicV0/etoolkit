import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ArrowLeft, Search, Calendar, User, Clock, CheckCircle, AlertCircle, XCircle, Plus } from 'lucide-react-native';

// Mock job data - replace with real data from API
const mockJobs = [
  {
    id: '1',
    title: 'Kitchen Remodel',
    client: {
      id: '1',
      name: 'John Smith',
      company: 'Smith Construction'
    },
    status: 'in_progress',
    dueDate: '2024-02-15',
    location: '123 Main St, Anytown, ST',
    progress: 65
  },
  {
    id: '2',
    title: 'Bathroom Update',
    client: {
      id: '2',
      name: 'Sarah Johnson',
      company: 'Johnson Plumbing'
    },
    status: 'completed',
    dueDate: '2024-01-30',
    location: '456 Oak Ave, Somewhere, ST',
    progress: 100
  },
  {
    id: '3',
    title: 'Deck Construction',
    client: {
      id: '3',
      name: 'Mike Wilson',
      company: 'Wilson Electric'
    },
    status: 'pending',
    dueDate: '2024-03-01',
    location: '789 Pine Rd, Elsewhere, ST',
    progress: 0
  }
];

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

export default function JobSelectionScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [jobs, setJobs] = useState(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState(mockJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Filter jobs based on search query
    if (searchQuery.trim() === '') {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.client.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchQuery, jobs]);

  const handleJobSelect = (job: any) => {
    // Return the selected job to the previous screen
    if (returnTo) {
      router.push({
        pathname: returnTo as any,
        params: { selectedJob: JSON.stringify(job) }
      });
    } else {
      // Default behavior - go back
      router.back();
    }
  };

  const handleCreateNewJob = () => {
    router.push({
      pathname: '/jobs/new' as any,
      params: { returnTo: returnTo || '/jobs/select' }
    });
  };

  const renderJobItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => handleJobSelect(item)}>
      <Card className="mb-2">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">{item.title}</Text>
            <View className="flex-row items-center mb-1">
              <User size={14} className="text-gray-500 mr-1" />
              <Text className="text-sm text-gray-600">{item.client.name}</Text>
              {item.client.company && (
                <Text className="text-sm text-gray-500 ml-1">• {item.client.company}</Text>
              )}
            </View>
          </View>
          <Badge variant={getStatusColor(item.status)}>
            <View className="flex-row items-center">
              {getStatusIcon(item.status)}
              <Text className="ml-1 capitalize">{item.status.replace('_', ' ')}</Text>
            </View>
          </Badge>
        </View>
        
        <View className="flex-row items-center space-x-4">
          <View className="flex-row items-center">
            <Calendar size={14} className="text-gray-500 mr-1" />
            <Text className="text-sm text-gray-600">Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
          </View>
        </View>
        
        <Text className="text-sm text-gray-600 mt-2" numberOfLines={1}>{item.location}</Text>
        
        {item.status === 'in_progress' && (
          <View className="mt-2">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-xs text-gray-600">Progress</Text>
              <Text className="text-xs text-gray-600">{item.progress}%</Text>
            </View>
            <View className="w-full bg-gray-200 rounded-full h-1">
              <View 
                className="bg-blue-500 h-1 rounded-full" 
                style={{ width: `${item.progress}%` }}
              />
            </View>
          </View>
        )}
      </Card>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <LoadingSpinner text="Loading jobs..." />
      </View>
    );
  }

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
          <Text className="text-lg font-semibold text-gray-900">Select Job</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="p-4 bg-white border-b border-gray-200">
        <View className="relative">
          <Search size={20} className="absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="pl-10"
          />
        </View>
      </View>

      {/* Jobs List */}
      <View className="flex-1 p-4">
        {filteredJobs.length > 0 ? (
          <FlatList
            data={filteredJobs}
            renderItem={renderJobItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <EmptyState
            icon={<Calendar size={48} className="text-gray-400" />}
            title="No jobs found"
            subtitle={searchQuery ? `No jobs match "${searchQuery}"` : "You haven't created any jobs yet"}
            action={
              <Button onPress={handleCreateNewJob} className="mt-4">
                Create New Job
              </Button>
            }
          />
        )}
      </View>

      {/* Create New Job Button */}
      <View className="p-4 bg-white border-t border-gray-200">
        <Button onPress={handleCreateNewJob} variant="secondary">
          Create New Job
        </Button>
      </View>
    </View>
  );
}
