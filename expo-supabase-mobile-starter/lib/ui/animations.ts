import { useEffect, useRef } from 'react'
import { Animated, Easing, Dimensions } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Animation configurations
export const ANIMATION_CONFIGS = {
  // Timing configurations
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  
  // Easing functions
  EASE_OUT: Easing.out(Easing.cubic),
  EASE_IN: Easing.in(Easing.cubic),
  EASE_IN_OUT: Easing.inOut(Easing.cubic),
  SPRING: Easing.elastic(1.3),
  BOUNCE: Easing.bounce,
  
  // Scale values
  SCALE_PRESSED: 0.95,
  SCALE_NORMAL: 1.0,
  SCALE_HIGHLIGHTED: 1.05,
  
  // Opacity values
  OPACITY_DISABLED: 0.5,
  OPACITY_HIDDEN: 0,
  OPACITY_VISIBLE: 1,
  
  // Transform values
  TRANSLATE_SMALL: 10,
  TRANSLATE_MEDIUM: 20,
  TRANSLATE_LARGE: 50
}

// Preset animation sequences
export const ANIMATION_PRESETS = {
  // Fade animations
  fadeIn: (duration = ANIMATION_CONFIGS.NORMAL) => ({
    opacity: 1,
    duration,
    easing: ANIMATION_CONFIGS.EASE_OUT,
    useNativeDriver: true
  }),
  
  fadeOut: (duration = ANIMATION_CONFIGS.NORMAL) => ({
    opacity: 0,
    duration,
    easing: ANIMATION_CONFIGS.EASE_IN,
    useNativeDriver: true
  }),
  
  // Scale animations
  scaleIn: (duration = ANIMATION_CONFIGS.NORMAL) => ({
    transform: [{ scale: ANIMATION_CONFIGS.SCALE_NORMAL }],
    opacity: 1,
    duration,
    easing: ANIMATION_CONFIGS.SPRING,
    useNativeDriver: true
  }),
  
  scaleOut: (duration = ANIMATION_CONFIGS.NORMAL) => ({
    transform: [{ scale: 0 }],
    opacity: 0,
    duration,
    easing: ANIMATION_CONFIGS.EASE_IN,
    useNativeDriver: true
  }),
  
  // Slide animations
  slideInFromRight: (duration = ANIMATION_CONFIGS.NORMAL) => ({
    transform: [{ translateX: 0 }],
    opacity: 1,
    duration,
    easing: ANIMATION_CONFIGS.EASE_OUT,
    useNativeDriver: true
  }),
  
  slideInFromLeft: (duration = ANIMATION_CONFIGS.NORMAL) => ({
    transform: [{ translateX: 0 }],
    opacity: 1,
    duration,
    easing: ANIMATION_CONFIGS.EASE_OUT,
    useNativeDriver: true
  }),
  
  slideInFromBottom: (duration = ANIMATION_CONFIGS.NORMAL) => ({
    transform: [{ translateY: 0 }],
    opacity: 1,
    duration,
    easing: ANIMATION_CONFIGS.EASE_OUT,
    useNativeDriver: true
  }),
  
  slideInFromTop: (duration = ANIMATION_CONFIGS.NORMAL) => ({
    transform: [{ translateY: 0 }],
    opacity: 1,
    duration,
    easing: ANIMATION_CONFIGS.EASE_OUT,
    useNativeDriver: true
  }),
  
  // Button press animation
  buttonPress: {
    scale: ANIMATION_CONFIGS.SCALE_PRESSED,
    duration: ANIMATION_CONFIGS.FAST,
    easing: ANIMATION_CONFIGS.EASE_OUT,
    useNativeDriver: true
  },
  
  buttonRelease: {
    scale: ANIMATION_CONFIGS.SCALE_NORMAL,
    duration: ANIMATION_CONFIGS.FAST,
    easing: ANIMATION_CONFIGS.EASE_OUT,
    useNativeDriver: true
  },
  
  // List item animations
  listItemEnter: (delay = 0) => ({
    opacity: 1,
    transform: [{ translateY: 0 }, { scale: 1 }],
    duration: ANIMATION_CONFIGS.NORMAL,
    delay,
    easing: ANIMATION_CONFIGS.EASE_OUT,
    useNativeDriver: true
  })
}

/**
 * Hook for fade in animation
 */
export const useFadeIn = (duration = ANIMATION_CONFIGS.NORMAL, delay = 0) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  
  useEffect(() => {
    const animation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      easing: ANIMATION_CONFIGS.EASE_OUT,
      useNativeDriver: true
    })
    
    animation.start()
    
    return () => animation.stop()
  }, [fadeAnim, duration, delay])
  
  return fadeAnim
}

/**
 * Hook for scale in animation
 */
export const useScaleIn = (duration = ANIMATION_CONFIGS.NORMAL, delay = 0) => {
  const scaleAnim = useRef(new Animated.Value(0)).current
  
  useEffect(() => {
    const animation = Animated.timing(scaleAnim, {
      toValue: 1,
      duration,
      delay,
      easing: ANIMATION_CONFIGS.SPRING,
      useNativeDriver: true
    })
    
    animation.start()
    
    return () => animation.stop()
  }, [scaleAnim, duration, delay])
  
  return scaleAnim
}

/**
 * Hook for slide in animation
 */
export const useSlideIn = (
  direction: 'left' | 'right' | 'top' | 'bottom' = 'left',
  duration = ANIMATION_CONFIGS.NORMAL,
  delay = 0
) => {
  const translateAnim = useRef(new Animated.Value(getInitialTranslateValue(direction))).current
  
  useEffect(() => {
    const animation = Animated.timing(translateAnim, {
      toValue: 0,
      duration,
      delay,
      easing: ANIMATION_CONFIGS.EASE_OUT,
      useNativeDriver: true
    })
    
    animation.start()
    
    return () => animation.stop()
  }, [translateAnim, duration, delay])
  
  return {
    transform: [getTransformConfig(direction, translateAnim)]
  }
}

/**
 * Hook for staggered list animations
 */
export const useStaggeredAnimation = (itemCount: number, staggerDelay = 50) => {
  const animations = useRef(
    Array.from({ length: itemCount }, () => new Animated.Value(0))
  ).current
  
  useEffect(() => {
    const staggeredAnimations = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: ANIMATION_CONFIGS.NORMAL,
        delay: index * staggerDelay,
        easing: ANIMATION_CONFIGS.EASE_OUT,
        useNativeDriver: true
      })
    )
    
    Animated.stagger(staggerDelay, staggeredAnimations).start()
    
    return () => {
      staggeredAnimations.forEach(anim => anim.stop())
    }
  }, [animations, staggerDelay])
  
  return animations
}

/**
 * Hook for button press animation
 */
export const useButtonPress = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current
  
  const pressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: ANIMATION_CONFIGS.SCALE_PRESSED,
      duration: ANIMATION_CONFIGS.FAST,
      easing: ANIMATION_CONFIGS.EASE_OUT,
      useNativeDriver: true
    }).start()
  }
  
  const pressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: ANIMATION_CONFIGS.SCALE_NORMAL,
      duration: ANIMATION_CONFIGS.FAST,
      easing: ANIMATION_CONFIGS.EASE_OUT,
      useNativeDriver: true
    }).start()
  }
  
  return {
    transform: [{ scale: scaleAnim }],
    pressIn,
    pressOut
  }
}

/**
 * Hook for loading shimmer animation
 */
export const useShimmerAnimation = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          easing: ANIMATION_CONFIGS.EASE_IN_OUT,
          useNativeDriver: true
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          easing: ANIMATION_CONFIGS.EASE_IN_OUT,
          useNativeDriver: true
        })
      ])
    )
    
    animation.start()
    
    return () => animation.stop()
  }, [shimmerAnim])
  
  return shimmerAnim
}

/**
 * Hook for pulse animation
 */
export const usePulseAnimation = (duration = 1000) => {
  const pulseAnim = useRef(new Animated.Value(1)).current
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: duration / 2,
          easing: ANIMATION_CONFIGS.EASE_IN_OUT,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: duration / 2,
          easing: ANIMATION_CONFIGS.EASE_IN_OUT,
          useNativeDriver: true
        })
      ])
    )
    
    animation.start()
    
    return () => animation.stop()
  }, [pulseAnim, duration])
  
  return {
    transform: [{ scale: pulseAnim }]
  }
}

/**
 * Hook for rotation animation
 */
export const useRotationAnimation = (duration = 1000) => {
  const rotationAnim = useRef(new Animated.Value(0)).current
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true
      })
    )
    
    animation.start()
    
    return () => animation.stop()
  }, [rotationAnim, duration])
  
  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  })
  
  return {
    transform: [{ rotate: rotation }]
  }
}

// Helper functions
function getInitialTranslateValue(direction: 'left' | 'right' | 'top' | 'bottom'): number {
  switch (direction) {
    case 'left':
      return -SCREEN_WIDTH
    case 'right':
      return SCREEN_WIDTH
    case 'top':
      return -SCREEN_HEIGHT
    case 'bottom':
      return SCREEN_HEIGHT
    default:
      return -SCREEN_WIDTH
  }
}

function getTransformConfig(
  direction: 'left' | 'right' | 'top' | 'bottom',
  animatedValue: Animated.Value
) {
  switch (direction) {
    case 'left':
    case 'right':
      return { translateX: animatedValue }
    case 'top':
    case 'bottom':
      return { translateY: animatedValue }
    default:
      return { translateX: animatedValue }
  }
}

// Utility functions for creating custom animations
export const createFadeInOut = (
  value: Animated.Value,
  toValue: number,
  duration = ANIMATION_CONFIGS.NORMAL
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: ANIMATION_CONFIGS.EASE_IN_OUT,
    useNativeDriver: true
  })
}

export const createScaleAnimation = (
  value: Animated.Value,
  toValue: number,
  duration = ANIMATION_CONFIGS.NORMAL
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: ANIMATION_CONFIGS.SPRING,
    useNativeDriver: true
  })
}

export const createSlideAnimation = (
  value: Animated.Value,
  toValue: number,
  duration = ANIMATION_CONFIGS.NORMAL
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: ANIMATION_CONFIGS.EASE_OUT,
    useNativeDriver: true
  })
}

export const createSequence = (animations: Animated.CompositeAnimation[]) => {
  return Animated.sequence(animations)
}

export const createParallel = (animations: Animated.CompositeAnimation[]) => {
  return Animated.parallel(animations)
}

export const createStagger = (delay: number, animations: Animated.CompositeAnimation[]) => {
  return Animated.stagger(delay, animations)
}
