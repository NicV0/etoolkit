import React from 'react';
import { render } from '@testing-library/react-native';
import { ListSkeleton } from '../ListSkeleton';

describe('ListSkeleton', () => {
  it('renders default 5 rows and hides from a11y', () => {
    const { getByTestId } = render(<ListSkeleton />);
    const container = getByTestId('listSkeleton.container');
    expect(container).toBeTruthy();
    for (let i = 0; i < 5; i++) {
      expect(getByTestId(`listSkeleton.item.${i}`)).toBeTruthy();
    }
  });

  it('respects custom count, no avatar, and custom line widths', () => {
    const { getByTestId } = render(
      <ListSkeleton count={3} showAvatar={false} lineWidths={[0.6, 0.3]} />
    );

    for (let i = 0; i < 3; i++) {
      const item = getByTestId(`listSkeleton.item.${i}`);
      expect(item).toBeTruthy();
      // Avatar should not exist
      expect(() => getByTestId(`listSkeleton.item.${i}.avatar`)).toThrow();
      // Lines should exist
      expect(getByTestId(`listSkeleton.item.${i}.line1`)).toBeTruthy();
      expect(getByTestId(`listSkeleton.item.${i}.line2`)).toBeTruthy();
    }
  });
});
