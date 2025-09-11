 import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal as RNModal,
  TouchableWithoutFeedback,
  ViewStyle,
  AccessibilityRole,
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { theme } from '../../lib/theme/tokens';
import IconButton from './IconButton';
import { X } from 'lucide-react-native';

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
  modalTitle?: string;
  focusReturnRef?: React.RefObject<any>;
  
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
  modalTitle,
  focusReturnRef,
  fullScreen = false,
}) => {
  // Animation values
  const backdropOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

  // A11y
  const [srEnabled, setSrEnabled] = useState(false);
  const contentRef = useRef<View>(null);
  const announceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle modal open
  const handleOpen = () => {
    backdropOpacity.value = withTiming(1, { duration: theme.animation.duration.normal });
    contentScale.value = withTiming(1, { duration: theme.animation.duration.normal });
    contentOpacity.value = withTiming(1, { duration: theme.animation.duration.normal });

    // Announce politely after layout tick if SR enabled
    if (announceTimer.current) clearTimeout(announceTimer.current);
    announceTimer.current = setTimeout(async () => {
      try {
        const enabled = await AccessibilityInfo.isScreenReaderEnabled();
        setSrEnabled(enabled);
        if (enabled) {
          const title = modalTitle || 'Dialog opened';
          AccessibilityInfo.announceForAccessibility?.(title);
          const node = findNodeHandle(contentRef.current);
          if (node) AccessibilityInfo.setAccessibilityFocus?.(node);
        }
      } catch {}
    }, 50);
  };

  // Handle modal close
  const handleClose = () => {
    backdropOpacity.value = withTiming(0, { duration: theme.animation.duration.normal });
    contentScale.value = withTiming(0.8, { duration: theme.animation.duration.normal });
    contentOpacity.value = withTiming(0, { duration: theme.animation.duration.normal }, () => {
      runOnJS(() => {
        if (srEnabled) AccessibilityInfo.announceForAccessibility?.('Dialog closed');
        // return focus
        const node = focusReturnRef ? findNodeHandle(focusReturnRef.current) : null;
        if (node) AccessibilityInfo.setAccessibilityFocus?.(node);
        onClose();
      })();
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
      if (announceTimer.current) {
        clearTimeout(announceTimer.current);
        announceTimer.current = null;
      }
      handleClose();
    }
    return () => {
      if (announceTimer.current) {
        clearTimeout(announceTimer.current);
        announceTimer.current = null;
      }
    };
  }, [visible]);

  // Get modal content styles
  const getModalContentStyle = (): ViewStyle => {
    const baseStyle = {
      backgroundColor: theme.semantic.colors.background.surface,
      borderRadius: theme.semantic.radii.lg,
      padding: theme.semantic.spacing.md,
      margin: theme.semantic.spacing.lg,
      ...theme.semantic.shadows.modal,
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
      <View style={styles.container} testID="modal.container">
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View
            style={[styles.backdrop, backdropStyle]}
            importantForAccessibility="no-hide-descendants"
            pointerEvents="auto"
            testID="modal.backdrop"
          />        </TouchableWithoutFeedback>

        {/* Content with focus sentinels */}
        <View style={[styles.contentContainer, fullScreen && styles.fullScreenContainer]}>
          {/* Focus start sentinel */}
          <Pressable
            accessible
            accessibilityLabel=""
            onFocus={() => {
              const node = findNodeHandle(contentRef.current);
              if (node) AccessibilityInfo.setAccessibilityFocus?.(node);
            }}
            style={styles.focusSentinel}
            importantForAccessibility="yes"
          />
          <Animated.View
            ref={contentRef}
            style={[
              getModalContentStyle(),
              contentAnimatedStyle,
              contentStyle,
            ]}
            accessibilityRole={getAccessibilityRole()}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityViewIsModal={Platform.OS === 'ios'}
            onAccessibilityEscape={dismissible ? handleClose : undefined}
            testID="modal.content"
          >
            {children}
          </Animated.View>

          {/* Focus end sentinel */}
          <Pressable
            accessible
            accessibilityLabel=""
            onFocus={() => {
              const node = findNodeHandle(contentRef.current);
              if (node) AccessibilityInfo.setAccessibilityFocus?.(node);
            }}
            style={styles.focusSentinel}
            importantForAccessibility="yes"
          />
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
  const closeRef = React.useRef<any>(null);
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerContent}>
        <View testID="modal.title">{children}</View>
      </View>
      {onClose && (
        <IconButton
          ref={closeRef}
          accessibilityLabel="Close dialog"
          onPress={onClose}
          icon={<X color={theme.semantic.colors.text.primary} size={theme.iconSizes.md} />}
          size="md"
          variant="ghost"
          testID="modal.closeButton"
        />      )}
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
    backgroundColor: theme.semantic.colors.overlay.backdrop,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  fullScreenContainer: {
    justifyContent: 'flex-start',
    paddingTop: theme.semantic.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.semantic.spacing.lg,
    paddingBottom: theme.semantic.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.semantic.colors.border.subtle,
  },
  headerContent: {
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.semantic.colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 16,
    height: 16,
    backgroundColor: theme.semantic.colors.text.secondary,
    borderRadius: 1,
  },
  modalContent: {
    flex: 1,
  },
  footer: {
    marginTop: theme.semantic.spacing.lg,
    paddingTop: theme.semantic.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.semantic.colors.border.subtle,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.semantic.spacing.md,
  },
  focusSentinel: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});

// Export with display name for debugging
Modal.displayName = 'Modal';
ModalHeader.displayName = 'ModalHeader';
ModalContent.displayName = 'ModalContent';
ModalFooter.displayName = 'ModalFooter';
