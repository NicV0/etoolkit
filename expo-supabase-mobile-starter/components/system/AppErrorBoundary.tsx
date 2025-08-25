import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../ui';
import { theme } from '../../lib/theme/tokens';
import { textStyles } from '../../lib/theme/utils';

type Props = { children: React.ReactNode; onReset?: () => void };
type State = { hasError: boolean; error?: Error };

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.wrap}>
        <Text style={[textStyles.h2, { color: theme.colors.text.primary, marginBottom: theme.spacing.sm }]}>
          Something went wrong
        </Text>
        <Text style={[textStyles.body, { color: theme.colors.text.secondary, marginBottom: theme.spacing.lg }]}>
          {String(this.state.error?.message ?? 'Unexpected error')}
        </Text>
        <Button
          variant="primary"
          title="Reload"
          onPress={() => {
            this.setState({ hasError: false, error: undefined });
            this.props.onReset?.();
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
});
