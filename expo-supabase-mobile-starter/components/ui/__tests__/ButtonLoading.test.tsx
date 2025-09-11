import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';
import { theme } from '../../../lib/theme/tokens';

describe('Button loading behavior', () => {
  it('shows spinner and blocks press when loading', () => {
    const onPress = jest.fn();
    const { getByTestId, getByText } = render(
      <Button title="Load" onPress={onPress} loading variant="primary" />
    );
    expect(getByTestId('button.spinner')).toBeTruthy();
    fireEvent.press(getByText('Load'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('spinner color per variant mapping', () => {
    const { getByTestId, rerender } = render(
      <Button title="Load" onPress={() => {}} loading variant="primary" />
    );
    const spinner1 = getByTestId('button.spinner');
    expect(spinner1.props.color).toBe(theme.semantic.colors.text.onAccent);

    rerender(<Button title="Load" onPress={() => {}} loading variant="secondary" />);
    const spinner2 = getByTestId('button.spinner');
    expect(spinner2.props.color).toBe(theme.semantic.colors.accent.primary);

    rerender(<Button title="Load" onPress={() => {}} loading variant="outline" />);
    const spinner3 = getByTestId('button.spinner');
    expect(spinner3.props.color).toBe(theme.semantic.colors.accent.primary);

    rerender(<Button title="Load" onPress={() => {}} loading variant="ghost" />);
    const spinner4 = getByTestId('button.spinner');
    expect(spinner4.props.color).toBe(theme.semantic.colors.accent.primary);
  });

  it('width stability between normal and loading', () => {
    const { getByText, rerender, getByTestId } = render(
      <Button title="Stable" onPress={() => {}} variant="primary" testID="btn.stable" />
    );
    const normal = getByTestId('btn.stable');
    const normalWidth = normal.props.style[0]?.minWidth || normal.props.style.width;

    rerender(<Button title="Stable" onPress={() => {}} variant="primary" loading testID="btn.stable" />);
    const loadingBtn = getByTestId('btn.stable');
    const loadingWidth = loadingBtn.props.style[0]?.minWidth || loadingBtn.props.style.width;

    expect(Math.abs((normalWidth || 0) - (loadingWidth || 0)) < 1).toBeTruthy();
  });

  it('sets accessibilityState busy while loading', () => {
    const { getByTestId } = render(
      <Button title="A11y" onPress={() => {}} variant="primary" loading testID="btn.a11y" />
    );
    const btn = getByTestId('btn.a11y');
    expect(btn.props.accessibilityState.busy).toBe(true);
    expect(btn.props.accessibilityState.disabled).toBe(true);
  });
});

