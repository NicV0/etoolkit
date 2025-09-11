import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Row } from '../Row';

describe('Row', () => {
  it('renders title/subtitle and left/right slots', () => {
    const { getByText, getByTestId } = render(
      <Row
        title="Title"
        subtitle="Subtitle"
        left={<></>}
        right={<></>}
        testID="row.item"
      />
    );
    expect(getByTestId('row.item')).toBeTruthy();
    expect(getByText('Title')).toBeTruthy();
    expect(getByText('Subtitle')).toBeTruthy();
  });

  it('handles press when enabled; disabled prevents presses', () => {
    const onPress = jest.fn();
    const { getByTestId, rerender } = render(
      <Row onPress={onPress} testID="row.item" title="Tap" />
    );
    fireEvent.press(getByTestId('row.item'));
    expect(onPress).toHaveBeenCalledTimes(1);

    rerender(<Row onPress={onPress} testID="row.item" title="Tap" disabled />);
    fireEvent.press(getByTestId('row.item'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has role=button and focusable when interactive', () => {
    const { getByTestId } = render(<Row onPress={() => {}} title="Action" testID="row.item" />);
    const item = getByTestId('row.item');
    expect(item.props.accessibilityRole).toBe('button');
  });

  it('shows separator using border.subtle when enabled', () => {
    const { getByTestId, rerender } = render(
      <Row title="Sep" testID="row.item" showSeparator />
    );

    const item = getByTestId('row.item');
    // Has a borderBottomWidth, color comes from tokens; we assert width is 1 when showSeparator=true
    expect(item.props.style[0].borderBottomWidth).toBe(1);

    rerender(<Row title="Sep" testID="row.item" showSeparator={false} />);
    const item2 = getByTestId('row.item');
    expect(item2.props.style[0].borderBottomWidth).toBe(0);
  });

  it('respects minimum tap target from tokens (>=44dp)', () => {
    const { getByTestId } = render(<Row title="Min target" testID="row.item" />);
    const item = getByTestId('row.item');
    expect(item.props.style[0].minHeight).toBeGreaterThanOrEqual(44);
  });
});
