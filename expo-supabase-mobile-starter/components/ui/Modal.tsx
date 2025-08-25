import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal as RNModal,
  TouchableWithoutFeedback,
  ViewStyle,
  AccessibilityRole,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { theme } from '../../lib/theme/tokens';

// Modal props interface
export interface ModalProps {
  // Content
  children: React.ReactNode;
  
  // State
  visible: boolean;
  onClose: () => void;
  
  // Styling
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  
  // Behavior
  dismissible?: boolean;
  closeOnBackdropPress?: boolean;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Other
  fullScreen?: boolean;
}

// Modal component
export const Modal: React.FC<ModalProps> = React.memo(({
  children,
  visible,
  onClose,
  contentStyle,
  dismissible = true,
  closeOnBackdropPress = true,
  accessibilityLabel,
  accessibilityHint,
  fullScreen = false,
}) => {
  // Animation values
  const backdropOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

  // Handle modal open
  const handleOpen = () => {
    backdropOpacity.value = withTiming(1, { duration: theme.animation.duration.normal });
    contentScale.value = withTiming(1, { duration: theme.animation.duration.normal });
    contentOpacity.value = withTiming(1, { duration: theme.animation.duration.normal });
  };

  // Handle modal close
  const handleClose = () => {
    backdropOpacity.value = withTiming(0, { duration: theme.animation.duration.normal });
    contentScale.value = withTiming(0.8, { duration: theme.animation.duration.normal });
    contentOpacity.value = withTiming(0, { duration: theme.animation.duration.normal }, () => {
      runOnJS(onClose)();
    });
  };

  // Handle backdrop press
  const handleBackdropPress = () => {
    if (closeOnBackdropPress && dismissible) {
      handleClose();
    }
  };

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  // Effect to handle visibility changes
  useEffect(() => {
    if (visible) {
      handleOpen();
    } else {
      handleClose();
    }
  }, [visible]);

  // Get modal content styles
  const getModalContentStyle = (): ViewStyle => {
    const baseStyle = {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.component.padding,
      margin: theme.spacing.lg,
      ...theme.shadows.lg,
    };

    if (fullScreen) {
      return {
        ...baseStyle,
        flex: 1,
        margin: 0,
        borderRadius: 0,
      };
    }

    return baseStyle;
  };

  // Determine accessibility role
  const getAccessibilityRole = (): AccessibilityRole | undefined => {
    return undefined; // Remove accessibilityRole as 'dialog' is not a valid AccessibilityRole
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={dismissible ? handleClose : undefined}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>

        {/* Content */}
        <View style={[styles.contentContainer, fullScreen && styles.fullScreenContainer]}>
          <Animated.View
            style={[
              getModalContentStyle(),
              contentAnimatedStyle,
              contentStyle,
            ]}
            accessibilityRole={getAccessibilityRole()}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
          >
            {children}
          </Animated.View>
        </View>
      </View>
    </RNModal>
  );
});

// Modal header component
export const ModalHeader: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  onClose?: () => void;
}> = ({ children, style, onClose }) => {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerContent}>
        {children}
      </View>
      {onClose && (
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.closeButton}>
            {/* Close icon would go here */}
            <View style={styles.closeIcon} />
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

// Modal content component
export const ModalContent: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => {
  return (
    <View style={[styles.modalContent, style]}>
      {children}
    </View>
  );
};

// Modal footer component
export const ModalFooter: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => {
  return (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay.backdrop,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  fullScreenContainer: {
    justifyContent: 'flex-start',
    paddingTop: 50, // Account for status bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 16,
    height: 16,
    backgroundColor: theme.colors.text.secondary,
    borderRadius: 1,
  },
  modalContent: {
    flex: 1,
  },
  footer: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
  },
});

// Export with display name for debugging
Modal.displayName = 'Modal';
ModalHeader.displayName = 'ModalHeader';
ModalContent.displayName = 'ModalContent';
ModalFooter.displayName = 'ModalFooter';
