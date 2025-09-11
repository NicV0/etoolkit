import React from 'react';
import { AccessibilityInfo, Platform, Text } from 'react-native';

export type LiveRegionProgressProps = {
  percent?: number; // 0-100
  label: string; // e.g., 'Storage used'
  thresholds?: number[]; // e.g., [80, 90]
  minDelta?: number; // e.g., 5
  testID?: string;
};

// A11y-only progress announcer. Renders an offscreen polite live region for Android;
// on iOS announces via announceForAccessibility when thresholds/deltas trigger.
export const LiveRegionProgress: React.FC<LiveRegionProgressProps> = ({
  percent,
  label,
  thresholds = [80, 90],
  minDelta = 5,
  testID,
}) => {
  const lastPercentRef = React.useRef<number | undefined>(undefined);
  const lastAnnouncedRef = React.useRef<string>('');
  const announceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const makeMessage = (p: number) => `${label} ${p}%`;

  React.useEffect(() => {
    if (typeof percent !== 'number') return;
    const prev = lastPercentRef.current;
    const crossedThreshold = thresholds.some((t) => (prev ?? -1) < t && percent >= t) || thresholds.some((t) => (prev ?? 101) > t && percent <= t);
    const delta = typeof prev === 'number' ? Math.abs(percent - prev) : Infinity;

    if (crossedThreshold || delta >= minDelta) {
      const msg = makeMessage(percent);
      if (msg === lastAnnouncedRef.current) return;

      if (announceTimer.current) clearTimeout(announceTimer.current);
      announceTimer.current = setTimeout(() => {
        AccessibilityInfo.isScreenReaderEnabled?.().then((enabled) => {
          if (!enabled) return;
          if (Platform.OS === 'ios') {
            AccessibilityInfo.announceForAccessibility?.(msg);
          }
          lastAnnouncedRef.current = msg;
        }).catch(() => {});
      }, 300);
    }

    lastPercentRef.current = percent;

    return () => {
      if (announceTimer.current) {
        clearTimeout(announceTimer.current);
        announceTimer.current = null;
      }
    };
  }, [percent, label, thresholds.join(','), minDelta]);

  // Android polite live region; visually hidden text pattern
  if (Platform.OS === 'android') {
    const text = typeof percent === 'number' ? makeMessage(percent) : '';
    return (
      <Text
        testID={testID}
        accessibilityLiveRegion="polite"
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
      >
        {text}
      </Text>
    );
  }

  // iOS announces via announceForAccessibility; nothing to render
  return null;
};

export default LiveRegionProgress;
