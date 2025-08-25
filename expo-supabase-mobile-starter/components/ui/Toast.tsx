import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors } from '../../lib/theme/tokens';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  visible: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  visible,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  const getToastStyle = (): { backgroundColor: string; borderColor: string } => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#d1fae5',
          borderColor: '#10b981',
        };
      case 'error':
        return {
          backgroundColor: '#fee2e2',
          borderColor: '#ef4444',
        };
      case 'warning':
        return {
          backgroundColor: '#fef3c7',
          borderColor: '#f59e0b',
        };
      case 'info':
      default:
        return {
          backgroundColor: '#dbeafe',
          borderColor: '#3b82f6',
        };
    }
  };

  const getTextColor = (): string => {
    switch (type) {
      case 'success':
        return '#065f46';
      case 'error':
        return '#991b1b';
      case 'warning':
        return '#92400e';
      case 'info':
      default:
        return '#1e40af';
    }
  };

  const getIcon = (): string => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          ...getToastStyle(),
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.icon, { color: getTextColor() }]}>
          {getIcon()}
        </Text>
        <Text style={[styles.message, { color: getTextColor() }]}>
          {message}
        </Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Text style={[styles.closeText, { color: getTextColor() }]}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Toast manager hook
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    message: string;
    type: ToastType;
    visible: boolean;
  }>>([]);

  const showToast = React.useCallback((
    message: string,
    type: ToastType = 'info',
    duration: number = 3000
  ) => {
    const id = Date.now().toString();
    const newToast = { id, message, type, visible: true };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration + 300); // Add animation duration
  }, []);

  const hideToast = React.useCallback((id: string) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, visible: false } : toast
    ));
  }, []);

  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    hideToast,
    clearToasts,
  };
};
