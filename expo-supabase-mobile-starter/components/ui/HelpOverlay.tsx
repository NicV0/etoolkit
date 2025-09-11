import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../../lib/theme/tokens';

export type HelpOverlayProps = {
  slides: Array<{ title: string; body: string }>;
  visible: boolean;
  onClose: () => void;
  testID?: string;
};

export const HelpOverlay: React.FC<HelpOverlayProps> = ({ slides, visible, onClose, testID }) => {
  if (!visible) return null;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme.colors.overlay.backdrop, padding: theme.semantic.spacing.lg }} testID={testID}>
      <View style={{ backgroundColor: theme.semantic.colors.background.surface, borderRadius: theme.semantic.radii.lg, padding: theme.semantic.spacing.lg }}>
        {slides.map((s, i) => (
          <View key={i} style={{ marginBottom: theme.semantic.spacing.md }}>
            <Text style={{ color: theme.semantic.colors.text.primary, fontSize: theme.semantic.type.section, fontWeight: theme.semantic.type.weight.semibold }}>{s.title}</Text>
            <Text style={{ color: theme.semantic.colors.text.secondary, marginTop: theme.semantic.spacing.xs }}>{s.body}</Text>
          </View>
        ))}
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close help" onPress={onClose} style={{ alignSelf: 'flex-end', paddingVertical: theme.semantic.spacing.sm, paddingHorizontal: theme.semantic.spacing.md, backgroundColor: theme.semantic.colors.accent.primary, borderRadius: theme.semantic.radii.md }}>
          <Text style={{ color: theme.semantic.colors.text.inverse }}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HelpOverlay;
