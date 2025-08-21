import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ListItem } from '../components/ui/ListItem';
import { 
  ArrowLeft, 
  HelpCircle, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Mail,
  ExternalLink,
  FileText,
  Users,
  Receipt,
  Calendar,
  File
} from 'lucide-react-native';

const helpTopics = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <HelpCircle size={20} className="text-blue-500" />,
    description: 'Learn the basics of eToolkit'
  },
  {
    id: 'clients',
    title: 'Managing Clients',
    icon: <Users size={20} className="text-green-500" />,
    description: 'Add, edit, and organize your clients'
  },
  {
    id: 'jobs',
    title: 'Job Management',
    icon: <Calendar size={20} className="text-purple-500" />,
    description: 'Create and track your projects'
  },
  {
    id: 'billing',
    title: 'Billing & Invoicing',
    icon: <Receipt size={20} className="text-orange-500" />,
    description: 'Create quotes and invoices'
  },
  {
    id: 'documents',
    title: 'Document Management',
    icon: <File size={20} className="text-red-500" />,
    description: 'Upload and organize documents'
  },
  {
    id: 'kitai',
    title: 'KitAI Assistant',
    icon: <MessageCircle size={20} className="text-indigo-500" />,
    description: 'Get help from your AI assistant'
  }
];

const quickActions = [
  {
    title: 'Video Tutorials',
    subtitle: 'Watch step-by-step guides',
    icon: <Video size={16} />,
    onPress: () => {
      // TODO: Open video tutorials
    }
  },
  {
    title: 'User Guide',
    subtitle: 'Comprehensive documentation',
    icon: <BookOpen size={16} />,
    onPress: () => {
      // TODO: Open user guide
    }
  },
  {
    title: 'Contact Support',
    subtitle: 'Get help from our team',
    icon: <Mail size={16} />,
    onPress: () => {
      // TODO: Open support contact
    }
  }
];

export default function HelpScreen() {
  const handleTopicPress = (topicId: string) => {
    // TODO: Navigate to specific help topic
    console.log('Navigate to topic:', topicId);
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
          <Text className="text-lg font-semibold text-gray-900">Help & Documentation</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Welcome Section */}
        <Card className="mb-4">
          <View className="items-center mb-4">
            <HelpCircle size={48} className="text-blue-500 mb-3" />
            <Text className="text-xl font-semibold text-gray-900 mb-2">How can we help?</Text>
            <Text className="text-gray-600 text-center">
              Find answers to common questions and learn how to use eToolkit effectively
            </Text>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Quick Actions</Text>
          
          <View className="space-y-3">
            {quickActions.map((action, index) => (
              <ListItem
                key={index}
                icon={action.icon}
                title={action.title}
                subtitle={action.subtitle}
                onPress={action.onPress}
                rightIcon={<ExternalLink size={16} className="text-gray-400" />}
              />
            ))}
          </View>
        </Card>

        {/* Help Topics */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Help Topics</Text>
          
          <View className="space-y-3">
            {helpTopics.map((topic) => (
              <Pressable
                key={topic.id}
                onPress={() => handleTopicPress(topic.id)}
              >
                <View className="flex-row items-center p-3 border border-gray-200 rounded-lg">
                  <View className="mr-3">
                    {topic.icon}
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium">{topic.title}</Text>
                    <Text className="text-sm text-gray-600">{topic.description}</Text>
                  </View>
                  <ExternalLink size={16} className="text-gray-400" />
                </View>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Frequently Asked Questions</Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-gray-900 font-medium mb-1">
                How do I create my first client?
              </Text>
              <Text className="text-sm text-gray-600">
                Go to the Clients tab and tap the "+" button to add a new client. Fill in their information and save.
              </Text>
            </View>
            
            <View>
              <Text className="text-gray-900 font-medium mb-1">
                How do I create a quote or invoice?
              </Text>
              <Text className="text-sm text-gray-600">
                Navigate to the Billing tab, select "Quotes" or "Invoices", and tap the "+" button to create a new one.
              </Text>
            </View>
            
            <View>
              <Text className="text-gray-900 font-medium mb-1">
                Can I upload documents to eToolkit?
              </Text>
              <Text className="text-sm text-gray-600">
                Yes! Go to the Documents tab and tap "Upload" to add files. You can associate them with clients or jobs.
              </Text>
            </View>
            
            <View>
              <Text className="text-gray-900 font-medium mb-1">
                How do I use KitAI?
              </Text>
              <Text className="text-sm text-gray-600">
                Tap the KitAI tab and start typing your questions. KitAI can help with client search, pricebook lookups, and more.
              </Text>
            </View>
          </View>
        </Card>

        {/* Contact Support */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Still Need Help?</Text>
          
          <View className="space-y-3">
            <ListItem
              icon={<Mail size={16} />}
              title="Email Support"
              subtitle="support@etoolkit.com"
              onPress={() => {
                // TODO: Open email client
              }}
            />
            
            <ListItem
              icon={<MessageCircle size={16} />}
              title="Live Chat"
              subtitle="Available during business hours"
              onPress={() => {
                // TODO: Open live chat
              }}
            />
            
            <ListItem
              icon={<FileText size={16} />}
              title="Submit Feedback"
              subtitle="Help us improve eToolkit"
              onPress={() => {
                // TODO: Open feedback form
              }}
            />
          </View>
        </Card>

        {/* Version Info */}
        <Card className="mb-4">
          <View className="items-center py-4">
            <Text className="text-sm text-gray-600">eToolkit v1.0.0</Text>
            <Text className="text-xs text-gray-500 mt-1">© 2024 eToolkit. All rights reserved.</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
