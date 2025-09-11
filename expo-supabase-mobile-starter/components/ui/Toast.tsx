import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import { theme } from '../../lib/theme/tokens';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  visible: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

let lastAnnounce = 0;
let lastMessage = '';


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

      // SR announcement (debounced, deduped, message-only)
      const now = Date.now();
      if (now - lastAnnounce > 500 && message !== lastMessage) {
        AccessibilityInfo.isScreenReaderEnabled?.().then((enabled) => {
          if (enabled) {
            AccessibilityInfo.announceForAccessibility?.(message);
            lastAnnounce = Date.now();
            lastMessage = message;
          }
        }).catch(() => {});
      }

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration, message]);

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
          backgroundColor: theme.semantic.colors.overlay.card,
          borderColor: theme.semantic.colors.state.success,
        };
      case 'error':
        return {
          backgroundColor: theme.semantic.colors.overlay.card,
          borderColor: theme.semantic.colors.state.danger,
        };
      case 'warning':
        return {
          backgroundColor: theme.semantic.colors.overlay.card,
          borderColor: theme.semantic.colors.state.warning,
        };
      case 'info':
      default:
        return {
          backgroundColor: theme.semantic.colors.overlay.card,
          borderColor: theme.semantic.colors.state.info,
        };
    }
  };

  const getTextColor = (): string => {
    switch (type) {
      case 'success':
        return theme.semantic.colors.text.primary;
      case 'error':
        return theme.semantic.colors.text.primary;
      case 'warning':
        return theme.semantic.colors.text.primary;
      case 'info':
      default:
        return theme.semantic.colors.text.primary;
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
      testID="toast.container"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Notification: ${message}`}
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
        <Text testID="toast.message" style={[styles.message, { color: getTextColor() }]}>
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
    top: theme.semantic.spacing.lg,
    left: theme.semantic.spacing.md,
    right: theme.semantic.spacing.md,
    zIndex: theme.zIndex.toast,
    borderRadius: theme.semantic.radii.md,
    borderWidth: 1,
    ...theme.semantic.shadows.popover,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.semantic.spacing.md,
  },
  icon: {
    fontSize: theme.typography.fontSize.body,
    marginRight: theme.semantic.spacing.sm,
    fontWeight: theme.typography.fontWeight.bold as any,
  },
  message: {
    flex: 1,
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  closeButton: {
    marginLeft: theme.semantic.spacing.sm,
    padding: theme.semantic.spacing.xs,
  },
  closeText: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold as any,
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
