import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

// Animation configuration
export const animationConfig = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: Easing.bezier(0.25, 0.1, 0.25, 1),
    bounce: Easing.bounce,
    elastic: Easing.elastic(1),
  },
  scale: {
    pressed: 0.95,
    hover: 1.02,
  },
  opacity: {
    pressed: 0.8,
    disabled: 0.5,
  },
};

// Hook for button press animations
export const usePressAnimation = (disabled = false) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const animatePress = (pressed: boolean) => {
    if (disabled) return;

    const scale = pressed ? animationConfig.scale.pressed : 1;
    const opacity = pressed ? animationConfig.opacity.pressed : 1;

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: scale,
        duration: animationConfig.duration.fast,
        easing: animationConfig.easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: opacity,
        duration: animationConfig.duration.fast,
        easing: animationConfig.easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    scaleAnim,
    opacityAnim,
    animatePress,
  };
};

// Hook for card hover/press animations
export const useCardAnimation = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  const animateCard = (pressed: boolean) => {
    const scale = pressed ? animationConfig.scale.pressed : 1;
    const shadow = pressed ? 1 : 0;

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: scale,
        duration: animationConfig.duration.fast,
        easing: animationConfig.easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: shadow,
        duration: animationConfig.duration.fast,
        easing: animationConfig.easing.ease,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return {
    scaleAnim,
    shadowAnim,
    animateCard,
  };
};

// Hook for list item animations (staggered)
export const useListItemAnimation = (index: number) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 50; // Stagger by 50ms per item

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: animationConfig.duration.normal,
        delay,
        easing: animationConfig.easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: animationConfig.duration.normal,
        delay,
        easing: animationConfig.easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, translateY, opacity]);

  return {
    translateY,
    opacity,
  };
};

// Hook for loading animations
export const useLoadingAnimation = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 500,
          easing: animationConfig.easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: animationConfig.easing.ease,
          useNativeDriver: true,
        }),
      ])
    );

    rotateAnimation.start();
    scaleAnimation.start();

    return () => {
      rotateAnimation.stop();
      scaleAnimation.stop();
    };
  }, [rotateAnim, scaleAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return {
    rotate,
    scaleAnim,
  };
};

// Hook for fade in/out animations
export const useFadeAnimation = (visible: boolean, duration = animationConfig.duration.normal) => {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration,
      easing: animationConfig.easing.ease,
      useNativeDriver: true,
    }).start();
  }, [visible, duration, opacity]);

  return opacity;
};

// Hook for slide animations
export const useSlideAnimation = (visible: boolean, direction: 'up' | 'down' | 'left' | 'right' = 'up') => {
  const translateAnim = useRef(new Animated.Value(visible ? 0 : 50)).current;
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    const translateValue = visible ? 0 : 50;
    // const translateKey = direction === 'up' || direction === 'down' ? 'translateY' : 'translateX';

    Animated.parallel([
      Animated.timing(translateAnim, {
        toValue: translateValue,
        duration: animationConfig.duration.normal,
        easing: animationConfig.easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: animationConfig.duration.normal,
        easing: animationConfig.easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, direction, translateAnim, opacity]);

  const transform = direction === 'up' || direction === 'down' 
    ? { translateY: translateAnim }
    : { translateX: translateAnim };

  return {
    opacity,
    transform: [transform],
  };
};

// Hook for pulse animations
export const usePulseAnimation = (active = true) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) return;

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: animationConfig.easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: animationConfig.easing.ease,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [active, scaleAnim]);

  return scaleAnim;
};

// Hook for shake animations (for error states)
export const useShakeAnimation = (trigger: boolean) => {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!trigger) return;

    const shakeAnimation = Animated.sequence([
      Animated.timing(translateX, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]);

    shakeAnimation.start();
  }, [trigger, translateX]);

  return {
    transform: [{ translateX }],
  };
};
