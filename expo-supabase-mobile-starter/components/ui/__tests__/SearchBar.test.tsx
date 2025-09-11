import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from '../SearchBar';
import { theme } from '../../../lib/theme/tokens';

describe('SearchBar', () => {
  const ids = {
    wrapper: 'searchbar',
    input: 'searchbar.input',
    clear: 'searchbar.clear',
  };

  it('renders with tokens and testIDs', () => {
    const { getByTestId } = render(
      <SearchBar
        value=""
        onChangeText={jest.fn()}
        placeholder="Search"
        testID={ids.wrapper}
        inputTestID={ids.input}
      />
    );

    const wrapper = getByTestId(ids.wrapper);
    const input = getByTestId(ids.input);

    expect(wrapper).toBeTruthy();
    expect(input).toBeTruthy();

    // Style/token checks
    const styleArray = Array.isArray(wrapper.props.style)
      ? wrapper.props.style
      : [wrapper.props.style];
    const merged = Object.assign({}, ...styleArray);

    expect(merged.backgroundColor).toBe(theme.colors.input);
    expect(merged.borderColor).toBe(theme.semantic.colors.border.subtle);
  });

  it('has A11y labels set on input', () => {
    const { getByTestId } = render(
      <SearchBar
        value=""
        onChangeText={jest.fn()}
        placeholder="Search"
        accessibilityLabel="Search"
        testID={ids.wrapper}
        inputTestID={ids.input}
      />
    );

    const input = getByTestId(ids.input);
    expect(input.props.accessibilityLabel).toBe('Search');
  });

  it('typing calls onChange with entered text', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <SearchBar
        value=""
        onChangeText={onChange}
        placeholder="Search"
        inputTestID={ids.input}
      />
    );

    const input = getByTestId(ids.input);
    fireEvent.changeText(input, 'abc');
    expect(onChange).toHaveBeenCalledWith('abc');
  });

  it('submit calls onSubmit with trimmed text', () => {
    const onSubmit = jest.fn();
    const { getByTestId, rerender } = render(
      <SearchBar
        value=" roof "
        onChangeText={jest.fn()}
        onSubmit={onSubmit}
        placeholder="Search"
        inputTestID={ids.input}
      />
    );

    const input = getByTestId(ids.input);
    fireEvent(input, 'submitEditing');

    expect(onSubmit).toHaveBeenCalledWith('roof');

    // Ensure returnKeyType is set
    expect(input.props.returnKeyType).toBe('search');
  });

  it('clear resets value and calls onClear', () => {
    const onClear = jest.fn();
    const { getByTestId, queryByTestId, rerender } = render(
      <SearchBar
        value="plumbing"
        onChangeText={jest.fn()}
        onClear={onClear}
        placeholder="Search"
        testID={ids.wrapper}
        inputTestID={ids.input}
        clearButtonTestID={ids.clear}
      />
    );

    const clearBtn = getByTestId(ids.clear);
    fireEvent.press(clearBtn);
    expect(onClear).toHaveBeenCalledTimes(1);

    // Parent sets value to empty after onClear
    rerender(
      <SearchBar
        value=""
        onChangeText={jest.fn()}
        onClear={onClear}
        placeholder="Search"
        testID={ids.wrapper}
        inputTestID={ids.input}
        clearButtonTestID={ids.clear}
      />
    );

    const input = getByTestId(ids.input);
    expect(input.props.value).toBe('');

    // Clear button hidden when empty
    expect(queryByTestId(ids.clear)).toBeNull();
  });

  it('shows/hides clear button based on value and allowClear', () => {
    const { queryByTestId, rerender } = render(
      <SearchBar
        value=""
        onChangeText={jest.fn()}
        placeholder="Search"
        allowClear={true}
        clearButtonTestID={ids.clear}
      />
    );

    expect(queryByTestId(ids.clear)).toBeNull();

    rerender(
      <SearchBar
        value="has text"
        onChangeText={jest.fn()}
        placeholder="Search"
        allowClear={true}
        clearButtonTestID={ids.clear}
      />
    );
    expect(queryByTestId(ids.clear)).toBeTruthy();

    // When allowClear is false, never show
    rerender(
      <SearchBar
        value="has text"
        onChangeText={jest.fn()}
        placeholder="Search"
        allowClear={false}
        clearButtonTestID={ids.clear}
      />
    );
    expect(queryByTestId(ids.clear)).toBeNull();
  });

  it('enforces maxLength by truncating emitted text', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <SearchBar
        value=""
        onChangeText={onChange}
        placeholder="Search"
        inputTestID={ids.input}
        maxLength={20}
      />
    );

    const long = 'abcdefghijklmnopqrstuvwxyz';
    const expected = long.slice(0, 20);
    const input = getByTestId(ids.input);
    fireEvent.changeText(input, long);

    expect(onChange).toHaveBeenCalledWith(expected);
  });

  it('disabled state prevents change, submit, and clear', () => {
    const onChange = jest.fn();
    const onSubmit = jest.fn();
    const onClear = jest.fn();

    const { getByTestId, queryByTestId, rerender } = render(
      <SearchBar
        value="text"
        onChangeText={onChange}
        onSubmit={onSubmit}
        onClear={onClear}
        placeholder="Search"
        inputTestID={ids.input}
        clearButtonTestID={ids.clear}
        disabled
      />
    );

    const input = getByTestId(ids.input);
    fireEvent.changeText(input, 'abc');
    expect(onChange).not.toHaveBeenCalled();

    fireEvent(input, 'submitEditing');
    expect(onSubmit).not.toHaveBeenCalled();

    const clearBtn = queryByTestId(ids.clear);
    if (clearBtn) {
      fireEvent.press(clearBtn);
    }
    expect(onClear).not.toHaveBeenCalled();

    // Clear button should be hidden when disabled
    expect(clearBtn).toBeNull();
  });
});
