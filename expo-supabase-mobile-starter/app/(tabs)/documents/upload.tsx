import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ArrowLeft, Upload, FileText, User, Calendar, X } from 'lucide-react-native';

const uploadSchema = z.object({
  title: z.string().min(1, 'Document title is required'),
  description: z.string().optional(),
  clientId: z.string().optional(),
  jobId: z.string().optional()
});

type UploadFormData = z.infer<typeof uploadSchema>;

export default function DocumentUploadScreen() {
  const { jobId, clientId } = useLocalSearchParams<{ jobId?: string; clientId?: string }>();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      description: '',
      clientId: clientId || '',
      jobId: jobId || ''
    }
  });

  const handleFileSelect = async () => {
    try {
      // TODO: Implement file picker using expo-document-picker
      // const result = await DocumentPicker.getDocumentAsync({
      //   type: ['application/pdf', 'image/*'],
      //   copyToCacheDirectory: true
      // });
      
      // Mock file selection for now
      const mockFile = {
        name: 'sample-document.pdf',
        size: '2.3 MB',
        type: 'application/pdf',
        uri: 'file://mock-uri'
      };
      
      setSelectedFile(mockFile);
      Alert.alert('File Selected', `Selected: ${mockFile.name}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  const handleClientSelect = () => {
    router.push({
      pathname: '/clients/select' as any,
      params: { returnTo: '/documents/upload' }
    });
  };

  const handleJobSelect = () => {
    router.push({
      pathname: '/jobs/select' as any,
      params: { returnTo: '/documents/upload' }
    });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmitUpload = async (data: UploadFormData) => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file to upload.');
      return;
    }

    try {
      setIsLoading(true);
      
      // TODO: Implement file upload logic
      console.log('Upload document:', { ...data, file: selectedFile });
      
      Alert.alert(
        'Success',
        'Document uploaded successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document. Please try again.');
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
          <Text className="text-lg font-semibold text-gray-900">Upload Document</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* File Selection */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Select File</Text>
          
          {selectedFile ? (
            <View className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <FileText size={20} className="text-gray-500 mr-3" />
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium">{selectedFile.name}</Text>
                    <Text className="text-sm text-gray-600">{selectedFile.size}</Text>
                  </View>
                </View>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleRemoveFile}
                >
                  <X size={16} />
                </Button>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={handleFileSelect}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50"
            >
              <View className="items-center">
                <Upload size={48} className="text-gray-400 mb-4" />
                <Text className="text-lg font-medium text-gray-900 mb-2">Select a file</Text>
                <Text className="text-sm text-gray-600 text-center">
                  Choose a PDF, image, or other document to upload
                </Text>
              </View>
            </Pressable>
          )}
          
          {!selectedFile && (
            <Button
              onPress={handleFileSelect}
              variant="secondary"
              className="mt-4"
            >
              <Upload size={16} className="mr-2" />
              Browse Files
            </Button>
          )}
        </Card>

        {/* Document Details */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Document Details</Text>
          
          {/* Document Title */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Document Title *"
                value={value}
                onChangeText={onChange}
                error={errors.title?.message}
                className="mb-4"
                placeholder="e.g., Contract Agreement, Site Photos"
              />
            )}
          />

          {/* Description */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Description"
                value={value}
                onChangeText={onChange}
                error={errors.description?.message}
                className="mb-4"
                multiline
                numberOfLines={3}
                placeholder="Optional description of the document..."
              />
            )}
          />
        </Card>

        {/* Associations */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Associations (Optional)</Text>
          
          {/* Client Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Associated Client</Text>
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
                  <Text className="text-gray-500">Select a client (optional)</Text>
                  <User size={16} className="text-gray-400" />
                </View>
              )}
            </Pressable>
          </View>

          {/* Job Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Associated Job</Text>
            <Pressable
              onPress={handleJobSelect}
              className="border border-gray-300 rounded-lg p-3 bg-white"
            >
              {selectedJob ? (
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-gray-900 font-medium">{selectedJob.title}</Text>
                    <Text className="text-sm text-gray-600">{selectedJob.client?.name}</Text>
                  </View>
                  <Calendar size={16} className="text-gray-400" />
                </View>
              ) : (
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-500">Select a job (optional)</Text>
                  <Calendar size={16} className="text-gray-400" />
                </View>
              )}
            </Pressable>
          </View>
        </Card>

        {/* Upload Info */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Upload Information</Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">File Type</Text>
              <Text className="text-gray-900">
                {selectedFile ? selectedFile.type : 'Not selected'}
              </Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">File Size</Text>
              <Text className="text-gray-900">
                {selectedFile ? selectedFile.size : 'Not selected'}
              </Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Upload Date</Text>
              <Text className="text-gray-900">
                {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Submit Button */}
      <View className="p-4 bg-white border-t border-gray-200">
        <Button
          onPress={handleSubmit(handleSubmitUpload)}
          disabled={isSubmitting || isLoading || !selectedFile}
          className="w-full"
        >
          {isSubmitting || isLoading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </View>
    </View>
  );
}
