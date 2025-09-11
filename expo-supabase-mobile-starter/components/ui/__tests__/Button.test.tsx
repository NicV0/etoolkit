import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPress} />);
    
    const button = getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Press Me" onPress={onPress} />
    );
    
    const button = getByText('Press Me');
    fireEvent.press(button);
    
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not trigger press when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Disabled Button" onPress={onPress} disabled />
    );
    
    const button = getByText('Disabled Button');
    fireEvent.press(button);
    
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not trigger press when loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Loading Button" onPress={onPress} loading />
    );
    
    const button = getByText('Loading Button');
    fireEvent.press(button);
    
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with different variants', () => {
    const onPress = jest.fn();
    const { getByText, rerender } = render(
      <Button title="Primary" onPress={onPress} variant="primary" />
    );
    expect(getByText('Primary')).toBeTruthy();

    rerender(<Button title="Secondary" onPress={onPress} variant="secondary" />);
    expect(getByText('Secondary')).toBeTruthy();

    rerender(<Button title="Outline" onPress={onPress} variant="outline" />);
    expect(getByText('Outline')).toBeTruthy();

    rerender(<Button title="Ghost" onPress={onPress} variant="ghost" />);
    expect(getByText('Ghost')).toBeTruthy();
  });

  it('renders with different sizes', () => {
    const onPress = jest.fn();
    const { getByText, rerender } = render(
      <Button title="Small" onPress={onPress} size="sm" />
    );
    expect(getByText('Small')).toBeTruthy();

    rerender(<Button title="Medium" onPress={onPress} size="md" />);
    expect(getByText('Medium')).toBeTruthy();

    rerender(<Button title="Large" onPress={onPress} size="lg" />);
    expect(getByText('Large')).toBeTruthy();
  });

  it('renders with icon when provided', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="With Icon" onPress={onPress} leftIcon="plus" />
    );
    
    expect(getByText('With Icon')).toBeTruthy();
  });

  it('renders with right icon when provided', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="With Right Icon" onPress={onPress} rightIcon="arrow-right" />
    );
    
    expect(getByText('With Right Icon')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const onPress = jest.fn();
    const customStyle = { backgroundColor: 'red' };
    const { getByText } = render(
      <Button title="Custom Style" onPress={onPress} style={customStyle} />
    );
    
    expect(getByText('Custom Style')).toBeTruthy();
  });

  it('renders with accessibility props', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button 
        title="Accessible Button"
        onPress={onPress}
        accessibilityLabel="Test button"
      />
    );
    
    expect(getByText('Accessible Button')).toBeTruthy();
  });
});
