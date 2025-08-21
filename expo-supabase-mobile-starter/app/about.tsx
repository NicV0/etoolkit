import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { router } from 'expo-router';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ListItem } from '../components/ui/ListItem';
import { 
  ArrowLeft, 
  Info, 
  ExternalLink, 
  Mail, 
  Globe, 
  Heart,
  Shield,
  Zap,
  Users,
  FileText
} from 'lucide-react-native';

const appInfo = {
  name: 'eToolkit',
  version: '1.0.0',
  buildNumber: '1',
  description: 'The complete mobile CRM solution for trade professionals',
  features: [
    'Client Management',
    'Job Tracking',
    'Quote & Invoice Generation',
    'Document Management',
    'KitAI Assistant',
    'Mobile-First Design'
  ]
};

const teamInfo = [
  {
    name: 'Development Team',
    role: 'Core Development',
    email: 'dev@etoolkit.com'
  },
  {
    name: 'Support Team',
    role: 'Customer Support',
    email: 'support@etoolkit.com'
  }
];

const links = [
  {
    title: 'Privacy Policy',
    url: 'https://etoolkit.com/privacy',
    icon: <Shield size={16} />
  },
  {
    title: 'Terms of Service',
    url: 'https://etoolkit.com/terms',
    icon: <FileText size={16} />
  },
  {
    title: 'Website',
    url: 'https://etoolkit.com',
    icon: <Globe size={16} />
  }
];

export default function AboutScreen() {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open URL:', err);
    });
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch((err) => {
      console.error('Failed to open email:', err);
    });
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
          <Text className="text-lg font-semibold text-gray-900">About eToolkit</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* App Header */}
        <Card className="mb-4">
          <View className="items-center mb-4">
            <View className="w-20 h-20 bg-blue-500 rounded-2xl items-center justify-center mb-4">
              <Zap size={32} className="text-white" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">{appInfo.name}</Text>
            <Text className="text-gray-600 text-center mb-3">{appInfo.description}</Text>
            <View className="bg-gray-100 px-3 py-1 rounded-full">
              <Text className="text-sm text-gray-700">Version {appInfo.version}</Text>
            </View>
          </View>
        </Card>

        {/* Features */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Features</Text>
          
          <View className="space-y-3">
            {appInfo.features.map((feature, index) => (
              <View key={index} className="flex-row items-center">
                <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                <Text className="text-gray-700">{feature}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Team Information */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Our Team</Text>
          
          <View className="space-y-3">
            {teamInfo.map((member, index) => (
              <View key={index} className="p-3 border border-gray-200 rounded-lg">
                <Text className="text-gray-900 font-medium">{member.name}</Text>
                <Text className="text-sm text-gray-600 mb-2">{member.role}</Text>
                <Pressable
                  onPress={() => handleEmailPress(member.email)}
                  className="flex-row items-center"
                >
                  <Mail size={14} className="text-gray-500 mr-1" />
                  <Text className="text-sm text-blue-600">{member.email}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </Card>

        {/* Legal Links */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Legal & Links</Text>
          
          <View className="space-y-3">
            {links.map((link, index) => (
              <ListItem
                key={index}
                icon={link.icon}
                title={link.title}
                onPress={() => handleLinkPress(link.url)}
                rightIcon={<ExternalLink size={16} className="text-gray-400" />}
              />
            ))}
          </View>
        </Card>

        {/* Technical Information */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Technical Information</Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">App Version</Text>
              <Text className="text-gray-900">{appInfo.version}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Build Number</Text>
              <Text className="text-gray-900">{appInfo.buildNumber}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Platform</Text>
              <Text className="text-gray-900">React Native / Expo</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Backend</Text>
              <Text className="text-gray-900">Supabase</Text>
            </View>
          </View>
        </Card>

        {/* Credits */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Credits</Text>
          
          <View className="space-y-3">
            <View>
              <Text className="text-gray-900 font-medium mb-1">Icons</Text>
              <Text className="text-sm text-gray-600">Lucide React Native</Text>
            </View>
            
            <View>
              <Text className="text-gray-900 font-medium mb-1">UI Framework</Text>
              <Text className="text-sm text-gray-600">NativeWind (Tailwind CSS)</Text>
            </View>
            
            <View>
              <Text className="text-gray-900 font-medium mb-1">State Management</Text>
              <Text className="text-sm text-gray-600">Zustand & React Query</Text>
            </View>
            
            <View>
              <Text className="text-gray-900 font-medium mb-1">Forms</Text>
              <Text className="text-sm text-gray-600">React Hook Form with Zod</Text>
            </View>
          </View>
        </Card>

        {/* Footer */}
        <Card className="mb-4">
          <View className="items-center py-6">
            <View className="flex-row items-center mb-2">
              <Text className="text-gray-600">Made with</Text>
              <Heart size={16} className="text-red-500 mx-1" />
              <Text className="text-gray-600">for trade professionals</Text>
            </View>
            <Text className="text-sm text-gray-500 text-center">
              © 2024 eToolkit. All rights reserved.
            </Text>
            <Text className="text-xs text-gray-400 text-center mt-1">
              Empowering tradespeople with modern tools
            </Text>
          </View>
        </Card>

        {/* Update Check */}
        <Card className="mb-4">
          <View className="items-center py-4">
            <Text className="text-gray-600 mb-2">Check for updates</Text>
            <Button
              variant="secondary"
              onPress={() => {
                // TODO: Implement update check
                console.log('Check for updates');
              }}
            >
              Check for Updates
            </Button>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
