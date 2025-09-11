import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Select from '../Select';

describe('Select', () => {
  const options = [
    { label: 'One', value: '1' },
    { label: 'Two', value: '2' },
    { label: 'Three', value: '3' },
  ];

  it('renders label and selected value', () => {
    const { getByText, getByTestId } = render(
      <Select
        label="Choose"
        value={'2'}
        onChange={jest.fn()}
        options={options}
        testID="select.wrapper"
        inputTestID="select.value"
        triggerTestID="select.trigger"
      />
    );

    expect(getByText('Choose')).toBeTruthy();
    const value = getByTestId('select.value');
    expect(value.props.children).toBe('Two');
  });

  it('cycles options on press and calls onChange; wraps at end', () => {
    const onChange = jest.fn();
    const { getByTestId, rerender } = render(
      <Select
        label="Picker"
        value={'1'}
        onChange={onChange}
        options={options}
        triggerTestID="select.trigger"
      />
    );

    const trigger = getByTestId('select.trigger');
    fireEvent.press(trigger);
    expect(onChange).toHaveBeenCalledWith('2');

    // simulate parent updates value to '2' and cycle again
    onChange.mockClear();
    rerender(
      <Select
        label="Picker"
        value={'2'}
        onChange={onChange}
        options={options}
        triggerTestID="select.trigger"
      />
    );
    fireEvent.press(getByTestId('select.trigger'));
    expect(onChange).toHaveBeenCalledWith('3');

    // wrap at end
    onChange.mockClear();
    rerender(
      <Select
        label="Picker"
        value={'3'}
        onChange={onChange}
        options={options}
        triggerTestID="select.trigger"
      />
    );
    fireEvent.press(getByTestId('select.trigger'));
    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('shows placeholder when no value selected', () => {
    const { getByTestId } = render(
      <Select
        value={undefined}
        onChange={jest.fn()}
        options={options}
        placeholder="Select…"
        inputTestID="select.value"
        triggerTestID="select.trigger"
      />
    );

    const value = getByTestId('select.value');
    expect(value.props.children).toBe('Select…');
  });

  it('disabled prevents cycling and sets accessibilityState', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <Select
        label="Disabled"
        value={'1'}
        onChange={onChange}
        options={options}
        disabled
        triggerTestID="select.trigger"
      />
    );

    const trigger = getByTestId('select.trigger');
    fireEvent.press(trigger);
    expect(onChange).not.toHaveBeenCalled();
    expect(trigger.props.accessibilityState.disabled).toBe(true);
  });
});
