import { AccessibilityInfo, findNodeHandle } from 'react-native';

export async function announce(msg: string) {
  try {
    await AccessibilityInfo.announceForAccessibility?.(msg);
  } catch {
    // Intentionally empty - fallback handled
  }
}

export function focusOn(ref: React.RefObject<any>) {
  const node = findNodeHandle(ref.current);
  if (node) {
    AccessibilityInfo.setAccessibilityFocus?.(node);
  }
}

export const hitSlop4 = { top: 8, bottom: 8, left: 8, right: 8 };
