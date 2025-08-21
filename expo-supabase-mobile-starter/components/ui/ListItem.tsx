import React from 'react';
import { View, Text, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode; // Alias for leftIcon
  rightElement?: React.ReactNode; // Custom right element
  children?: React.ReactNode; // Custom children content
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
  showChevron?: boolean;
  chevronDirection?: 'right' | 'down' | 'up';
  titleClassName?: string; // Custom title styling
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  icon,
  rightElement,
  children,
  onPress,
  onLongPress,
  disabled = false,
  className = '',
  style,
  showChevron = false,
  chevronDirection = 'right',
  titleClassName,
}) => {
  const { isDark } = useTheme();

  // Use icon as leftIcon if provided
  const finalLeftIcon = leftIcon || icon;

  const getChevronIcon = () => {
    if (!showChevron) return null;
    
    // You can import specific chevron icons from lucide-react-native
    return (
      <Text className={`text-gray-400 ${chevronDirection === 'right' ? 'rotate-0' : chevronDirection === 'down' ? 'rotate-90' : '-rotate-90'}`}>
        ›
      </Text>
    );
  };

  const getBackgroundColor = () => {
    if (disabled) return isDark ? 'bg-gray-800' : 'bg-gray-50';
    return isDark ? 'bg-gray-800' : 'bg-white';
  };

  const getTextColor = () => {
    if (disabled) return isDark ? 'text-gray-500' : 'text-gray-400';
    return isDark ? 'text-white' : 'text-gray-900';
  };

  const getSubtitleColor = () => {
    if (disabled) return isDark ? 'text-gray-600' : 'text-gray-500';
    return isDark ? 'text-gray-400' : 'text-gray-500';
  };

  const getBorderColor = () => {
    return isDark ? 'border-gray-700' : 'border-gray-200';
  };

  const Container = onPress ? Pressable : View;

  return (
    <Container
      className={`
        ${getBackgroundColor()}
        border-b ${getBorderColor()}
        px-4 py-3
        ${onPress && !disabled ? 'active:bg-gray-100' : ''}
        ${isDark && onPress && !disabled ? 'active:bg-gray-700' : ''}
        ${className}
      `}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      style={style}
    >
      <View className="flex-row items-center">
        {finalLeftIcon && (
          <View className="mr-3">
            {finalLeftIcon}
          </View>
        )}
        
        <View className="flex-1">
          <Text className={`text-base font-medium ${getTextColor()} ${titleClassName || ''}`}>
            {title}
          </Text>
          {subtitle && (
            <Text className={`text-sm mt-1 ${getSubtitleColor()}`}>
              {subtitle}
            </Text>
          )}
          {children && (
            <View className="mt-2">
              {children}
            </View>
          )}
        </View>
        
        <View className="flex-row items-center">
          {rightElement && (
            <View className="mr-2">
              {rightElement}
            </View>
          )}
          {rightIcon && (
            <View className="mr-2">
              {rightIcon}
            </View>
          )}
          {getChevronIcon()}
        </View>
      </View>
    </Container>
  );
};
