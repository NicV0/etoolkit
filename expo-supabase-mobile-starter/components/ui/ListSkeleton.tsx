import React from 'react';

import { View } from 'react-native';
import { theme } from '../../lib/theme/tokens';
import { Skeleton } from './Skeleton';

export type ListSkeletonProps = {
  count?: number;
  showAvatar?: boolean;
  lineWidths?: [number, number]; // percentages 0..1
  itemSpacing?: keyof typeof theme.semantic.spacing;
  avatarSize?: number;
  testID?: string;
};

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  count = 5,
  showAvatar = true,
  lineWidths = [0.7, 0.4],
  itemSpacing = 'md',
  avatarSize,
  testID = 'listSkeleton.container',
}) => {
  const lineHeight = theme.semantic.component.skeleton.lineHeight;
  const avatar = avatarSize ?? theme.semantic.component.skeleton.avatarSize;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ gap: theme.semantic.spacing[itemSpacing] }}
      testID={testID}
    >
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            minHeight: theme.hitTargets.minimum,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.semantic.spacing.sm,
          }}
          testID={`listSkeleton.item.${i}`}
        >
          {showAvatar && (
            <View
              style={{ width: avatar, height: avatar, borderRadius: avatar / 2, overflow: 'hidden' }}
              testID={`listSkeleton.item.${i}.avatar`}
            >
              <Skeleton variant="avatar" width={avatar} height={avatar} style={{ borderRadius: avatar / 2 }} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View testID={`listSkeleton.item.${i}.line1`}>
              <Skeleton width={`${lineWidths[0] * 100}%`} height={lineHeight} style={{ borderRadius: theme.semantic.radii.md }} />
            </View>
            <View style={{ height: theme.semantic.spacing.xs }} />
            <View testID={`listSkeleton.item.${i}.line2`}>
              <Skeleton width={`${lineWidths[1] * 100}%`} height={lineHeight} style={{ borderRadius: theme.semantic.radii.md }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default ListSkeleton;
