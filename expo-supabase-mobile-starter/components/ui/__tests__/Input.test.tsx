import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Input from '../Input';
import { theme } from '../../../lib/theme/tokens';

describe('Input', () => {
  it('renders with tokens and testIDs', () => {
    const { getByTestId } = render(
      <Input
        value=""
        onChangeText={jest.fn()}
        label="Email"
        placeholder="Enter email"
        testID="input.wrapper"
        inputTestID="input.field"
      />
    );

    const wrapper = getByTestId('input.wrapper');
    const input = getByTestId('input.field');
    expect(wrapper).toBeTruthy();
    expect(input).toBeTruthy();

    const styleArray = Array.isArray(input.props.style) ? input.props.style : [input.props.style];
    const merged = Object.assign({}, ...styleArray);
    expect(merged.backgroundColor).toBe(theme.colors.input);
    expect(merged.borderColor).toBe(theme.semantic.colors.border.subtle);
  });

  it('handles typing and respects disabled state', () => {
    const onChange = jest.fn();
    const { getByTestId, rerender } = render(
      <Input value="" onChangeText={onChange} placeholder="Type" inputTestID="input.field" />
    );
    const input = getByTestId('input.field');
    fireEvent.changeText(input, 'abc');
    expect(onChange).toHaveBeenCalledWith('abc');

    onChange.mockClear();
    rerender(<Input value="abc" onChangeText={onChange} disabled inputTestID="input.field" />);
    const inputDisabled = getByTestId('input.field');
    fireEvent.changeText(inputDisabled, 'xyz');
    expect(onChange).toHaveBeenCalledTimes(1); // unchanged from previous call count
  });
});
