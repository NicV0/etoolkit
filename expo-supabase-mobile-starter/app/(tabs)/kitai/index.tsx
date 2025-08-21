import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Send, Sparkles, User, Bot, Search, FileText, Users, DollarSign } from 'lucide-react-native';
import { kitAI } from '../../../lib/kitai';
import { useSession } from '../../../state/useSession';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
}

export default function KitAIScreen() {
  const { isDark } = useTheme();
  const { organization } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m KitAI, your business assistant. I can help you search for clients, find pricebook items, create quotes, and more. What would you like to do?',
      sender: 'ai',
      timestamp: new Date(),
      suggestions: [
        'Search for a client',
        'Find pricebook items',
        'Create a new quote',
        'View recent invoices'
      ]
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize KitAI when component mounts
    kitAI.initialize().catch(error => {
      console.error('Failed to initialize KitAI:', error);
    });
  }, []);

  const getBackgroundColor = () => {
    return isDark ? 'bg-gray-900' : 'bg-gray-50';
  };

  const getTextColor = () => {
    return isDark ? 'text-white' : 'text-gray-900';
  };

  const getSubtextColor = () => {
    return isDark ? 'text-gray-400' : 'text-gray-600';
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !organization) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Process query with KitAI
      const response = await kitAI.processQuery(text, organization.id);
      
      let aiResponse = '';
      let suggestions: string[] = [];

      if (Array.isArray(response) && response.length > 0) {
        // Search results
        aiResponse = `I found ${response.length} result(s):\n\n`;
        response.slice(0, 5).forEach((item, index) => {
          aiResponse += `${index + 1}. ${item.title}\n${item.description}\n\n`;
        });
        
        if (response.length > 5) {
          aiResponse += `... and ${response.length - 5} more results.`;
        }
        
        suggestions = ['Show more results', 'Refine search', 'Create new item'];
      } else {
        // No results or other response
        aiResponse = `I couldn't find any results for "${text}". Try searching for something else or ask me to help you create a new item.`;
        suggestions = ['Search for clients', 'Browse pricebook', 'Create new quote'];
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        suggestions,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('KitAI query failed:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error while processing your request. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        suggestions: ['Try again', 'Search for clients', 'Browse pricebook'],
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    sendMessage(suggestion);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View className={`mb-4 ${item.sender === 'user' ? 'items-end' : 'items-start'}`}>
      <View className={`flex-row items-start max-w-xs ${item.sender === 'user' ? 'flex-row-reverse' : ''}`}>
        <View className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${item.sender === 'user' ? 'ml-2 mr-0' : ''}`}>
          {item.sender === 'user' ? (
            <User size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
          ) : (
            <Bot size={16} color={isDark ? '#fb923c' : '#f97316'} />
          )}
        </View>
        <Card
          className={`${item.sender === 'user' ? 'bg-primary-500' : ''} ${isDark && item.sender === 'user' ? 'bg-primary-600' : ''}`}
          padding="sm"
        >
          <Text
            className={`text-sm ${item.sender === 'user' ? 'text-white' : getTextColor()}`}
          >
            {item.text}
          </Text>
        </Card>
      </View>
      
      {/* Suggestions */}
      {item.suggestions && item.suggestions.length > 0 && (
        <View className="mt-2 flex-row flex-wrap">
          {item.suggestions.map((suggestion, index) => (
            <Pressable
              key={index}
              onPress={() => handleSuggestion(suggestion)}
              className="mr-2 mb-2"
            >
              <Card className="bg-primary-100 border border-primary-200" padding="sm">
                <Text className="text-xs text-primary-700">{suggestion}</Text>
              </Card>
            </Pressable>
          ))}
        </View>
      )}
      
      <Text className={`text-xs mt-1 ${getSubtextColor()}`}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const renderQuickActions = () => (
    <View className="p-4 border-b border-gray-200">
      <Text className={`text-sm font-medium mb-3 ${getTextColor()}`}>Quick Actions</Text>
      <View className="flex-row flex-wrap gap-2">
        <Pressable onPress={() => sendMessage('Search for clients')}>
          <Card className="bg-white border border-gray-200" padding="sm">
            <View className="flex-row items-center">
              <Users size={16} color="#f97316" />
              <Text className="text-xs ml-2 text-gray-700">Clients</Text>
            </View>
          </Card>
        </Pressable>
        
        <Pressable onPress={() => sendMessage('Find pricebook items')}>
          <Card className="bg-white border border-gray-200" padding="sm">
            <View className="flex-row items-center">
              <Search size={16} color="#f97316" />
              <Text className="text-xs ml-2 text-gray-700">Pricebook</Text>
            </View>
          </Card>
        </Pressable>
        
        <Pressable onPress={() => sendMessage('Create a new quote')}>
          <Card className="bg-white border border-gray-200" padding="sm">
            <View className="flex-row items-center">
              <FileText size={16} color="#f97316" />
              <Text className="text-xs ml-2 text-gray-700">Quotes</Text>
            </View>
          </Card>
        </Pressable>
        
        <Pressable onPress={() => sendMessage('View recent invoices')}>
          <Card className="bg-white border border-gray-200" padding="sm">
            <View className="flex-row items-center">
              <DollarSign size={16} color="#f97316" />
              <Text className="text-xs ml-2 text-gray-700">Invoices</Text>
            </View>
          </Card>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${getBackgroundColor()}`}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="p-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <Sparkles size={24} color="#f97316" />
            <Text className={`text-xl font-bold ml-2 ${getTextColor()}`}>
              KitAI
            </Text>
          </View>
          <Text className={`text-sm ${getSubtextColor()}`}>
            Your intelligent business assistant
          </Text>
        </View>

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Messages */}
        <FlatList
          className="flex-1 px-4"
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
        />

        {/* Loading Indicator */}
        {loading && (
          <View className="p-4 items-center">
            <LoadingSpinner text="Thinking..." />
          </View>
        )}

        {/* Input */}
        <View className="p-4 border-t border-gray-200">
          <View className="flex-row items-center">
            <TextInput
              className={`flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-2 ${getTextColor()}`}
              placeholder="Ask KitAI anything..."
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className={`w-10 h-10 rounded-lg items-center justify-center ${
                input.trim() && !loading ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <Send size={20} color={input.trim() && !loading ? 'white' : '#9ca3af'} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
