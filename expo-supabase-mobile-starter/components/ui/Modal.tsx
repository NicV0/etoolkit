import React from 'react';
import { Modal as RNModal, View, Text, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  className = '',
  style,
  showCloseButton = true,
  closeOnBackdropPress = true,
}) => {
  const { isDark } = useTheme();

  const getBackgroundColor = () => {
    return isDark ? 'bg-gray-900' : 'bg-white';
  };

  const getTextColor = () => {
    return isDark ? 'text-white' : 'text-gray-900';
  };

  const getBorderColor = () => {
    return isDark ? 'border-gray-700' : 'border-gray-200';
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-center items-center bg-black bg-opacity-50"
        onPress={closeOnBackdropPress ? onClose : undefined}
      >
        <Pressable
          className={`${getBackgroundColor()} rounded-lg shadow-lg border ${getBorderColor()} mx-4 max-w-sm w-full ${className}`}
          style={style}
          onPress={(e) => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              {title && (
                <Text className={`text-lg font-semibold ${getTextColor()}`}>
                  {title}
                </Text>
              )}
              {showCloseButton && (
                <Pressable
                  onPress={onClose}
                  className="p-1"
                >
                  <Text className="text-gray-400 text-xl">×</Text>
                </Pressable>
              )}
            </View>
          )}
          
          <View className="p-4">
            {children}
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
};
