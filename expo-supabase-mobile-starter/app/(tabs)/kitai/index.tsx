import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { Send } from 'lucide-react-native';

// UI components (kept generic to match your design system)
import { Card, Button, LoadingSpinner } from '../../../components/ui';

// Hooks (assumed exist; adjust paths/names if yours differ)
import {
  useKitAIMessages,
  useCreateKitAIMessage,
  useKitAIThreads,
} from '../../../lib/query/hooks';

// Theme & typography
import { theme } from '../../../lib/theme/tokens';
import { textStyles } from '../../../lib/theme/utils';

// Types (optional)
import type { KitAIMessage } from '../../../lib/database/types';

const QUICK_CHIPS = [
  { id: 'client_summary', label: 'Client summary', template: 'Show me a summary of ACME Corp.' },
  { id: 'draft_quote', label: 'Draft quote', template: 'Draft a quote for ACME Corp for 3 hours labor at $120/hr.' },
  { id: 'balance_due', label: 'Balance due', template: 'What is the balance due for ACME Corp?' },
];

function normalizeMessages(messagesData: unknown): KitAIMessage[] {
  // Supports either PaginatedResult<T> or raw T[]
  if (!messagesData) return [];
  if (Array.isArray(messagesData)) return messagesData as KitAIMessage[];
  if (typeof messagesData === 'object' && messagesData !== null && 'data' in messagesData) {
    const data = (messagesData as { data: unknown }).data;
    if (Array.isArray(data)) {
      return data as KitAIMessage[];
    }
  }
  return [];
}

// Simple chat bubble
function MessageBubble({ msg }: { msg: KitAIMessage }) {
  const isUser = msg.role === 'user';
  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.aiMessageContainer,
      ]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${isUser ? 'You' : 'KitAI'}: ${msg.content}`}
    >
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[
            textStyles.body,
            isUser ? styles.userText : styles.aiText,
          ]}
        >
          {msg.content}
        </Text>
      </View>
      {!!msg.created_at && (
        <Text style={[textStyles.caption, styles.timestamp]}>
          {new Date(msg.created_at).toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
}

function WelcomeMessage() {
  return (
    <Card variant="outlined" style={styles.welcomeContainer}>
      <Text style={[textStyles.h3, styles.welcomeTitle]}>Welcome to KitAI</Text>
      <Text style={[textStyles.body, styles.welcomeBody]}>
        Ask about clients, draft quotes, or create invoices. Try a quick action below.
      </Text>
    </Card>
  );
}

export default function KitAIScreen() {
  // State
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Data
  const { data: rawMessages, isLoading, isError, error, refetch } = useKitAIMessages('org-id', 'default');
  const createMessage = useCreateKitAIMessage();
  const { data: threadsData } = useKitAIThreads('org-id');

  // Get the first thread or use default
  const threadId = threadsData?.[0]?.id ?? 'default';
  const messages = normalizeMessages(rawMessages);
  const hasMessages = messages.length > 0;

  // Auto-scroll on new content or typing state changes
  useEffect(() => {
    const t = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(t);
  }, [messages.length, isTyping]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    setInput('');
    setIsTyping(true);

    try {
      // 1) Save user message
      await createMessage.mutateAsync({
        threadId: threadId, // Use camelCase to match API interface
        // role: 'user', // Role is handled internally
        content: trimmed,
      });

      // 2) Simulate AI response (replace with real service call)
      setTimeout(async () => {
        const aiContent = `You said: "${trimmed}". How can I help next?`;
        await createMessage.mutateAsync({
          threadId: threadId,
          // role: 'assistant', // Role is handled internally
          content: aiContent,
        });
        setIsTyping(false);
      }, 900);
    } catch (e) {
      setIsTyping(false);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  }, [input, isTyping, createMessage, threadId]);

  const handleChip = useCallback((template: string) => {
    setInput(template);
  }, []);

  // Error state
  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[textStyles.h2, styles.errorTitle]}>Something went wrong</Text>
        <Text style={[textStyles.body, styles.errorMessage]}>
          {error?.message || 'Failed to load chat'}
        </Text>
        <Button
          variant="primary"
          size="lg"
          onPress={() => refetch()}
          style={styles.errorButton}
          title="Try Again"
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* Header (no Settings here by spec) */}
      <View style={styles.header}>
        <View>
          <Text style={[textStyles.h2, styles.screenTitle]}>KitAI</Text>
          <Text style={[textStyles.caption, styles.subtitle]}>Your AI Assistant</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="large" />
            <Text style={[textStyles.body, styles.loadingText]}>Loading chat...</Text>
          </View>
        ) : !hasMessages ? (
          <WelcomeMessage />
        ) : (
          <>
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
            {isTyping && (
              <View style={[styles.messageContainer, styles.aiMessageContainer]}>
                <View style={[styles.messageBubble, styles.aiBubble]}>
                  <View style={styles.typingRow}>
                    <LoadingSpinner size="small" />
                    <Text style={[textStyles.caption, styles.typingText]}>KitAI is typing…</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Quick chips */}
      <View style={styles.chipsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
          {QUICK_CHIPS.map((c) => (
            <Button
              key={c.id}
              variant="outline"
              size="sm"
              onPress={() => handleChip(c.template)}
              style={styles.chip}
              title={c.label}
            />
          ))}
        </ScrollView>
      </View>

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={[styles.input, textStyles.body]}
          placeholder="Ask KitAI…"
          placeholderTextColor={theme.colors.text.muted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={2000}
          editable={!isTyping}
          numberOfLines={1}
        />
        <Button
          variant="primary"
          size="md"
          onPress={handleSend}
          disabled={!input.trim() || isTyping}
          style={styles.sendButton}
          leftIcon={<Send size={18} color="#fff" />}
          title="Send"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

/* --------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  screenTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.text.secondary,
  },

  messagesContainer: { flex: 1 },
  messagesContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },

  messageContainer: {
    marginBottom: theme.spacing.sm,
    maxWidth: '82%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
  },

  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  userBubble: {
    backgroundColor: theme.colors.primary, // #2563EB
  },
  aiBubble: {
    backgroundColor: theme.colors.card, // dark card bubble (#111827)
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#E5E7EB',
  },
  timestamp: {
    marginTop: 4,
    color: theme.colors.text.secondary,
    alignSelf: 'flex-end',
  },

  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  typingText: {
    color: theme.colors.text.secondary,
  },

  chipsRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipsContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  chip: {
    marginRight: theme.spacing.xs,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 112, // ~4 lines
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    color: theme.colors.text.primary,
  },
  sendButton: {
    alignSelf: 'flex-end',
  },

  // Loading / Error
  loadingContainer: { alignItems: 'center', padding: theme.spacing.lg },
  loadingText: { color: theme.colors.text.secondary, marginTop: theme.spacing.sm },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: { color: theme.colors.text.primary, marginBottom: theme.spacing.sm, textAlign: 'center' },
  errorMessage: { color: theme.colors.text.secondary, marginBottom: theme.spacing.xl, textAlign: 'center' },
  errorButton: { minWidth: 120 },
  
  // Welcome message styles
  welcomeContainer: {
    marginBottom: theme.spacing.lg,
  },
  welcomeTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  welcomeBody: {
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
});
