import { AccessibilityInfo, Platform, AccessibilityRole } from 'react-native'
import { useState, useEffect } from 'react'

export interface AccessibilitySettings {
  isScreenReaderEnabled: boolean
  isReduceMotionEnabled: boolean
  isHighContrastEnabled: boolean
  preferredFontScale: number
  isVoiceOverRunning: boolean
  isTalkBackRunning: boolean
}

export interface AccessibilityAnnouncement {
  message: string
  priority?: 'low' | 'medium' | 'high'
  delay?: number
}

export interface AccessibilityHint {
  role: string
  hint: string
  label: string
  value?: string
  state?: 'disabled' | 'selected' | 'checked' | 'expanded'
}

/**
 * Hook to get current accessibility settings
 */
export const useAccessibilitySettings = (): AccessibilitySettings => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isHighContrastEnabled: false,
    preferredFontScale: 1.0,
    isVoiceOverRunning: false,
    isTalkBackRunning: false
  })
  
  useEffect(() => {
    const updateAccessibilitySettings = async () => {
      try {
        const [
          screenReaderEnabled,
          reduceMotionEnabled,
          voiceOverRunning,
          talkBackRunning
        ] = await Promise.all([
          AccessibilityInfo.isScreenReaderEnabled(),
          AccessibilityInfo.isReduceMotionEnabled(),
          Platform.OS === 'ios' ? AccessibilityInfo.isScreenReaderEnabled() : Promise.resolve(false),
          Platform.OS === 'android' ? AccessibilityInfo.isScreenReaderEnabled() : Promise.resolve(false)
        ])
        
        setSettings({
          isScreenReaderEnabled: screenReaderEnabled,
          isReduceMotionEnabled: reduceMotionEnabled,
          isHighContrastEnabled: false, // Would need native module for this
          preferredFontScale: 1.0, // Would need native module for this
          isVoiceOverRunning: Platform.OS === 'ios' && voiceOverRunning,
          isTalkBackRunning: Platform.OS === 'android' && talkBackRunning
        })
      } catch (error) {
        console.warn('Failed to get accessibility settings:', error)
      }
    }
    
    updateAccessibilitySettings()
    
    // Listen for changes
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (isEnabled) => {
        setSettings(prev => ({
          ...prev,
          isScreenReaderEnabled: isEnabled,
          isVoiceOverRunning: Platform.OS === 'ios' && isEnabled,
          isTalkBackRunning: Platform.OS === 'android' && isEnabled
        }))
      }
    )
    
    const reduceMotionListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled) => {
        setSettings(prev => ({ ...prev, isReduceMotionEnabled: isEnabled }))
      }
    )
    
    return () => {
      screenReaderListener?.remove()
      reduceMotionListener?.remove()
    }
  }, [])
  
  return settings
}

/**
 * Announce a message to screen readers
 */
export const announceForAccessibility = (
  message: string
): void => {
  try {
    if (Platform.OS === 'ios') {
      // iOS VoiceOver announcement
      AccessibilityInfo.announceForAccessibility(message)
    } else if (Platform.OS === 'android') {
      // Android TalkBack announcement
      AccessibilityInfo.announceForAccessibility(message)
    }
  } catch (error) {
    console.warn('Failed to announce for accessibility:', error)
  }
}

/**
 * Generate accessibility props for common UI elements
 */
export const getAccessibilityProps = (config: AccessibilityHint) => {
  const baseProps = {
    accessible: true,
    accessibilityRole: config.role as AccessibilityRole,
    accessibilityLabel: config.label,
    accessibilityHint: config.hint
  }
  
  // Add value if provided
  if (config.value !== undefined) {
    (baseProps as Record<string, unknown>).accessibilityValue = { text: config.value }
  }
  
  // Add state if provided
  if (config.state) {
    switch (config.state) {
      case 'disabled':
        (baseProps as Record<string, unknown>).accessibilityState = { disabled: true }
        break
      case 'selected':
        (baseProps as Record<string, unknown>).accessibilityState = { selected: true }
        break
      case 'checked':
        (baseProps as Record<string, unknown>).accessibilityState = { checked: true }
        break
      case 'expanded':
        (baseProps as Record<string, unknown>).accessibilityState = { expanded: true }
        break
    }
  }
  
  return baseProps
}

/**
 * Button accessibility props
 */
export const getButtonAccessibilityProps = (
  label: string,
  hint?: string,
  disabled = false
) => {
  return getAccessibilityProps({
    role: 'button',
    label,
    hint: hint || `Tap to ${label.toLowerCase()}`,
    state: disabled ? 'disabled' : undefined
  })
}

/**
 * Input field accessibility props
 */
export const getInputAccessibilityProps = (
  label: string,
  value?: string,
  placeholder?: string,
  required = false
) => {
  const hint = placeholder ? `Placeholder: ${placeholder}` : undefined
  const fullLabel = required ? `${label}, required` : label
  
  return getAccessibilityProps({
    role: 'textbox',
    label: fullLabel,
    hint: hint || `Enter ${label.toLowerCase()}`,
    value
  })
}

/**
 * List item accessibility props
 */
export const getListItemAccessibilityProps = (
  label: string,
  index: number,
  total: number,
  actionHint?: string
) => {
  const positionInfo = `Item ${index + 1} of ${total}`
  const fullLabel = `${label}. ${positionInfo}`
  const hint = actionHint || 'Tap to view details'
  
  return getAccessibilityProps({
    role: 'button',
    label: fullLabel,
    hint
  })
}

/**
 * Tab accessibility props
 */
export const getTabAccessibilityProps = (
  label: string,
  selected = false,
  index: number,
  total: number
) => {
  const positionInfo = `Tab ${index + 1} of ${total}`
  const selectionState = selected ? 'Selected' : 'Not selected'
  const fullLabel = `${label}. ${positionInfo}. ${selectionState}`
  
  return getAccessibilityProps({
    role: 'tab',
    label: fullLabel,
    hint: selected ? 'Already selected' : 'Tap to select',
    state: selected ? 'selected' : undefined
  })
}

/**
 * Modal accessibility props
 */
export const getModalAccessibilityProps = (title: string) => {
  return {
    accessible: true,
    accessibilityRole: 'dialog' as AccessibilityRole,
    accessibilityLabel: title,
    accessibilityModal: true,
    accessibilityViewIsModal: true
  }
}

/**
 * Image accessibility props
 */
export const getImageAccessibilityProps = (description: string, decorative = false) => {
  if (decorative) {
    return {
      accessible: false,
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants' as 'auto' | 'yes' | 'no' | 'no-hide-descendants'
    }
  }
  
  return getAccessibilityProps({
    role: 'image',
    label: description,
    hint: 'Image'
  })
}

/**
 * Switch/Toggle accessibility props
 */
export const getSwitchAccessibilityProps = (
  label: string,
  value: boolean,
  hint?: string
) => {
  return {
    ...getAccessibilityProps({
      role: 'switch',
      label,
      hint: hint || `Tap to ${value ? 'disable' : 'enable'} ${label.toLowerCase()}`
    }),
    accessibilityState: { checked: value }
  }
}

/**
 * Progress indicator accessibility props
 */
export const getProgressAccessibilityProps = (
  label: string,
  progress: number,
  maxValue = 100
) => {
  const percentage = Math.round((progress / maxValue) * 100)
  const valueText = `${percentage}% complete`
  
  return {
    ...getAccessibilityProps({
      role: 'progressbar',
      label,
      hint: 'Progress indicator',
      value: valueText
    }),
    accessibilityValue: {
      min: 0,
      max: maxValue,
      now: progress,
      text: valueText
    }
  }
}

/**
 * Alert accessibility props
 */
export const getAlertAccessibilityProps = (
  message: string,
  type: 'info' | 'warning' | 'error' | 'success' = 'info'
) => {
  const roleText = type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Alert'
  const fullLabel = `${roleText}: ${message}`
  
  return getAccessibilityProps({
    role: 'alert',
    label: fullLabel,
    hint: 'Alert message'
  })
}

/**
 * Check if animations should be reduced
 */
export const shouldReduceMotion = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled()
  } catch (error) {
    console.warn('Failed to check reduce motion setting:', error)
    return false
  }
}

/**
 * Get accessible animation duration
 */
export const getAccessibleAnimationDuration = (
  originalDuration: number,
  respectReduceMotion = true
): Promise<number> => {
  return shouldReduceMotion().then(reduceMotion => {
    if (respectReduceMotion && reduceMotion) {
      return 0 // Disable animations
    }
    return originalDuration
  })
}

/**
 * Create accessible loading message
 */
export const createLoadingMessage = (
  action: string,
  includeProgress = false,
  progress?: number
): string => {
  let message = `Loading ${action}`
  
  if (includeProgress && typeof progress === 'number') {
    const percentage = Math.round(progress * 100)
    message += `. ${percentage}% complete`
  }
  
  return message
}

/**
 * Create accessible error message
 */
export const createErrorMessage = (
  action: string,
  error: string,
  canRetry = false
): string => {
  let message = `Error ${action}: ${error}`
  
  if (canRetry) {
    message += '. Tap to retry.'
  }
  
  return message
}

/**
 * Create accessible success message
 */
export const createSuccessMessage = (action: string): string => {
  return `Successfully ${action}`
}

/**
 * Utility to focus an element for screen readers
 */
export const focusForAccessibility = (ref: { current?: { focus?: () => void } }, delay = 100): void => {
  if (ref?.current?.focus) {
    setTimeout(() => {
      try {
        if (ref.current?.focus) {
          ref.current.focus()
        }
      } catch (error) {
        console.warn('Failed to focus element for accessibility:', error)
      }
    }, delay)
  }
}

/**
 * Generate readable list description
 */
export const createListDescription = (
  items: unknown[],
  itemName: string,
  emptyMessage?: string
): string => {
  if (items.length === 0) {
    return emptyMessage || `No ${itemName}s available`
  }
  
  if (items.length === 1) {
    return `1 ${itemName}`
  }
  
  return `${items.length} ${itemName}s`
}

/**
 * Create accessible navigation description
 */
export const createNavigationDescription = (
  currentScreen: string,
  totalScreens?: number,
  screenIndex?: number
): string => {
  let description = `Currently on ${currentScreen}`
  
  if (totalScreens && screenIndex !== undefined) {
    description += `. Screen ${screenIndex + 1} of ${totalScreens}`
  }
  
  return description
}
