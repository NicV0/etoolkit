import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { designSystem } from '../../theme/design-system';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry?: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  retry?: () => void;
}

export const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, retry }) => {
  return (
    <View style={{
      flex: 1,
      backgroundColor: '#f5f7fb',
      justifyContent: 'center',
      alignItems: 'center',
      padding: designSystem.spacing.xl,
    }}>
      <View style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: designSystem.borderRadius.xl,
        padding: designSystem.spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 8,
        maxWidth: 300,
      }}>
        <View style={{
          width: 64,
          height: 64,
          borderRadius: designSystem.borderRadius.xl,
          backgroundColor: designSystem.colors.error[50],
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: designSystem.spacing.lg,
        }}>
          <AlertTriangle size={32} color={designSystem.colors.error[500]} />
        </View>
        
        <Text style={{
          fontSize: designSystem.typography.fontSize.xl,
          fontWeight: designSystem.typography.fontWeight.bold,
          color: designSystem.colors.text.primary,
          marginBottom: designSystem.spacing.sm,
          textAlign: 'center',
        }}>
          Something went wrong
        </Text>
        
        <Text style={{
          fontSize: designSystem.typography.fontSize.sm,
          color: designSystem.colors.text.secondary,
          textAlign: 'center',
          marginBottom: designSystem.spacing.lg,
          lineHeight: 20,
        }}>
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </Text>
        
        {retry && (
          <Pressable
            onPress={retry}
            style={{
              backgroundColor: designSystem.colors.primary[500],
              borderRadius: designSystem.borderRadius.lg,
              paddingHorizontal: designSystem.spacing.lg,
              paddingVertical: designSystem.spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: designSystem.colors.primary[500],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <RefreshCw size={16} color="#ffffff" />
            <Text style={{
              fontSize: designSystem.typography.fontSize.sm,
              fontWeight: designSystem.typography.fontWeight.semibold,
              color: '#ffffff',
              marginLeft: designSystem.spacing.sm,
            }}>
              Try Again
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title = 'Error', 
  message = 'Something went wrong', 
  onRetry, 
  showRetry = true 
}) => {
  return (
    <View style={{
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: designSystem.borderRadius.xl,
      padding: designSystem.spacing.lg,
      marginBottom: designSystem.spacing.sm,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.6)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      alignItems: 'center',
    }}>
      <View style={{
        width: 48,
        height: 48,
        borderRadius: designSystem.borderRadius.lg,
        backgroundColor: designSystem.colors.error[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: designSystem.spacing.md,
      }}>
        <AlertTriangle size={24} color={designSystem.colors.error[500]} />
      </View>
      
      <Text style={{
        fontSize: designSystem.typography.fontSize.lg,
        fontWeight: designSystem.typography.fontWeight.semibold,
        color: designSystem.colors.text.primary,
        marginBottom: designSystem.spacing.xs,
        textAlign: 'center',
      }}>
        {title}
      </Text>
      
      <Text style={{
        fontSize: designSystem.typography.fontSize.sm,
        color: designSystem.colors.text.secondary,
        textAlign: 'center',
        marginBottom: showRetry && onRetry ? designSystem.spacing.md : 0,
        lineHeight: 18,
      }}>
        {message}
      </Text>
      
      {showRetry && onRetry && (
        <Pressable
          onPress={onRetry}
          style={{
            backgroundColor: designSystem.colors.primary[500],
            borderRadius: designSystem.borderRadius.md,
            paddingHorizontal: designSystem.spacing.md,
            paddingVertical: designSystem.spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <RefreshCw size={14} color="#ffffff" />
          <Text style={{
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.medium,
            color: '#ffffff',
            marginLeft: designSystem.spacing.xs,
          }}>
            Retry
          </Text>
        </Pressable>
      )}
    </View>
  );
};
