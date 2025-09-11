import { useRef, useEffect, useMemo } from 'react';
import { Animated, Easing, AccessibilityInfo } from 'react-native';
import { theme } from '@theme/tokens';

/**
 * Motion tokens (semantic) → local config.
 * If you ever retune tokens, animations follow automatically.
 */
const motion = {
  duration: {
    fast: theme.semantic.motion?.duration?.fast ?? 150,
    medium: theme.semantic.motion?.duration?.medium ?? 180,
    slow: theme.semantic.motion?.duration?.slow ?? 240,
  },
  easing: {
    standard: theme.semantic.motion?.easing?.standard ?? Easing.bezier(0.25, 0.1, 0.25, 1),
    decelerate: theme.semantic.motion?.easing?.decelerate ?? Easing.out(Easing.cubic),
    accelerate: theme.semantic.motion?.easing?.accelerate ?? Easing.in(Easing.cubic),
  },
  scale: {
    pressed: 0.96,
    hover: 1.02,
  },
  opacity: {
    pressed: 0.8,
    disabled: 0.5,
  },
};

/** Global hook: detect OS Reduce Motion and subscribe to changes. */
export function useReducedMotion() {
  const flag = useRef(false);

  const [value, setValue] = React.useState<boolean>(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setValue(!!enabled);
    });
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (enabled: boolean) => {
      setValue(!!enabled);
    });
    return () => {
      mounted = false;
      // RN 0.73+: sub?.remove(); legacy: AccessibilityInfo.removeEventListener(...)
      (sub as any)?.remove?.();
    };
  }, []);
  return value;
}

/** Button press animation (scale + opacity). No visual change when disabled or reduce-motion on. */
export function usePressAnimation(disabled = false) {
  const reduceMotion = useReducedMotion();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const animatePress = (pressed: boolean) => {
    if (disabled) return;

    const scale = pressed ? motion.scale.pressed : 1;
    const opacity = pressed ? motion.opacity.pressed : 1;

    // Stop any in-flight animation to avoid stacking/jitter
    scaleAnim.stopAnimation();
    opacityAnim.stopAnimation();

    if (reduceMotion) {
      scaleAnim.setValue(scale);
      opacityAnim.setValue(opacity);
      return;
    }

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: scale,
        duration: motion.duration.fast,
        easing: motion.easing.standard,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: opacity,
        duration: motion.duration.fast,
        easing: motion.easing.standard,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { scaleAnim, opacityAnim, animatePress };
}

/**
 * Card press animation.
 * Note: RN can’t native-drive shadow/elevation; consider snapping a tokenized
 * shadow on press instead of animating it. We keep a tiny animated value here,
 * but keep durations short.
 */
export function useCardAnimation() {
  const reduceMotion = useReducedMotion();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current; // 0=rest, 1=pressed

  const animateCard = (pressed: boolean) => {
    const scale = pressed ? motion.scale.pressed : 1;
    const shadow = pressed ? 1 : 0;

    scaleAnim.stopAnimation();
    shadowAnim.stopAnimation();

    if (reduceMotion) {
      scaleAnim.setValue(scale);
      shadowAnim.setValue(shadow);
      return;
    }

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: scale,
        duration: motion.duration.fast,
        easing: motion.easing.standard,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: shadow,
        duration: motion.duration.fast,
        easing: motion.easing.standard,
        useNativeDriver: false, // elevation/shadow can’t be native-driven
      }),
    ]).start();
  };

  return { scaleAnim, shadowAnim, animateCard };
}

/** Staggered list item entrance (translate + fade). */
export function useListItemAnimation(index: number) {
  const reduceMotion = useReducedMotion();
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 50;

    translateY.stopAnimation();
    opacity.stopAnimation();

    if (reduceMotion) {
      translateY.setValue(0);
      opacity.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: motion.duration.medium,
        delay,
        easing: motion.easing.decelerate,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.duration.medium,
        delay,
        easing: motion.easing.decelerate,
        useNativeDriver: true,
      }),
    ]).start();

    // No cleanup needed; values are stable refs
  }, [index, reduceMotion, translateY, opacity]);

  return { translateY, opacity };
}

/** Loading loop (rotate + gentle pulse). Respects reduce-motion. */
export function useLoadingAnimation() {
  const reduceMotion = useReducedMotion();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let rotateLoop: Animated.CompositeAnimation | null = null;
    let scaleLoop: Animated.CompositeAnimation | null = null;

    if (!reduceMotion) {
      rotateLoop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      scaleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.06,
            duration: 500,
            easing: motion.easing.decelerate,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            easing: motion.easing.accelerate,
            useNativeDriver: true,
          }),
        ])
      );
      rotateLoop.start();
      scaleLoop.start();
    } else {
      // Snap to base when reduced motion is on
      rotateAnim.setValue(0);
      scaleAnim.setValue(1);
    }

    return () => {
      rotateLoop?.stop();
      scaleLoop?.stop();
    };
  }, [reduceMotion, rotateAnim, scaleAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return { rotate, scaleAnim };
}

/** Fade in/out helper. */
export function useFadeAnimation(visible: boolean, duration = motion.duration.medium) {
  const reduceMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    opacity.stopAnimation();
    if (reduceMotion) {
      opacity.setValue(visible ? 1 : 0);
      return;
    }
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration,
      easing: motion.easing.standard,
      useNativeDriver: true,
    }).start();
  }, [visible, duration, reduceMotion, opacity]);

  return opacity;
}

/** Slide + fade from a direction. Correct offsets per direction. */
export function useSlideAnimation(
  visible: boolean,
  direction: 'up' | 'down' | 'left' | 'right' = 'up'
) {
  const reduceMotion = useReducedMotion();

  const initialOffset = useMemo(() => {
    switch (direction) {
      case 'up': return 50;      // starts below, slides up to 0
      case 'down': return -50;   // starts above, slides down to 0
      case 'left': return 50;    // starts right, slides left to 0
      case 'right': return -50;  // starts left, slides right to 0
      default: return 50;
    }
  }, [direction]);

  const translateAnim = useRef(new Animated.Value(visible ? 0 : initialOffset)).current;
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    translateAnim.stopAnimation();
    opacity.stopAnimation();

    if (reduceMotion) {
      translateAnim.setValue(visible ? 0 : initialOffset);
      opacity.setValue(visible ? 1 : 0);
      return;
    }

    Animated.parallel([
      Animated.timing(translateAnim, {
        toValue: visible ? 0 : initialOffset,
        duration: motion.duration.medium,
        easing: motion.easing.decelerate,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: motion.duration.medium,
        easing: motion.easing.standard,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, initialOffset, reduceMotion, translateAnim, opacity]);

  const transform =
    direction === 'up' || direction === 'down'
      ? [{ translateY: translateAnim }]
      : [{ translateX: translateAnim }];

  return { opacity, transform };
}

/** Gentle pulse (used for attention). Disabled when reduce-motion is ON. */
export function usePulseAnimation(active = true) {
  const reduceMotion = useReducedMotion();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) return;
    scaleAnim.stopAnimation();

    if (reduceMotion) {
      scaleAnim.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: motion.easing.decelerate,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: motion.easing.accelerate,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [active, reduceMotion, scaleAnim]);

  return scaleAnim;
}

/** Shake for errors. Cancels prior motion to avoid stacking. */
export function useShakeAnimation(trigger: boolean) {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!trigger) return;

    translateX.stopAnimation();

    const sequence = Animated.sequence([
      Animated.timing(translateX, { toValue: 10, duration: 90, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -10, duration: 90, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 8, duration: 80, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -8, duration: 80, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]);
    sequence.start();
  }, [trigger, translateX]);

  return { transform: [{ translateX }] };
}
