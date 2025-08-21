import React from 'react';
import { Text, View } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#000' }) => {
  // Simple fallback icons using text symbols
  const getIconSymbol = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'home':
        return '🏠';
      case 'users':
        return '👥';
      case 'calendar':
        return '📅';
      case 'sparkles':
        return '✨';
      case 'receipt':
        return '🧾';
      case 'settings':
        return '⚙️';
      case 'plus':
        return '➕';
      case 'search':
        return '🔍';
      case 'phone':
        return '📞';
      case 'mail':
        return '📧';
      case 'trendingup':
        return '📈';
      case 'trendingdown':
        return '📉';
      case 'dollarsign':
        return '💰';
      case 'filetext':
        return '📄';
      default:
        return '●';
    }
  };

  return (
    <Text style={{ fontSize: size, color }}>
      {getIconSymbol(name)}
    </Text>
  );
};
