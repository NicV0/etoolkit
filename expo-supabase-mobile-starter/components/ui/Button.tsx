import React from 'react'
import { Pressable, Text, ViewStyle, TextStyle, GestureResponderEvent, ActivityIndicator, View } from 'react-native'
import { semantic, theme } from '../../lib/theme/tokens'

export type ButtonProps = {
  title: string
  onPress?: (e: GestureResponderEvent) => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  accessibilityLabel?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
  style?: ViewStyle
  testID?: string
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  accessibilityLabel,
  leftIcon,
  rightIcon,
  loading = false,
  style,
  testID,
}: ButtonProps) {
  const minHeight = 44
  const isLoading = !!loading && !disabled

  const base: ViewStyle = {
    minHeight,
    borderRadius: semantic.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: size === 'lg' ? semantic.spacing.xl : size === 'sm' ? semantic.spacing.md : semantic.spacing.lg,
    paddingVertical: size === 'lg' ? semantic.spacing.lg : size === 'sm' ? semantic.spacing.sm : semantic.spacing.md,
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: variant === 'outline' ? (disabled ? semantic.colors.interactive.disabled : semantic.colors.accent.primary) : 'transparent',
    opacity: disabled || loading || !onPress ? 0.6 : 1,
  }

  const backgroundColor = (() => {
    if (variant === 'primary') return semantic.colors.accent.primary
    if (variant === 'secondary') return semantic.colors.background.surface
    return 'transparent'
  })()

  const textColor = (() => {
    if (variant === 'primary') return semantic.colors.text.inverse
    if (variant === 'outline') return semantic.colors.accent.primary
    return semantic.colors.text.primary
  })()

  const textStyle: TextStyle = {
    color: textColor as any,
    fontFamily: semantic.type.family.primary,
    fontWeight: semantic.type.weight.semibold as any,
    fontSize: size === 'lg' ? theme.typography.fontSize.bodyStrong : size === 'sm' ? theme.typography.fontSize.caption : theme.typography.fontSize.body,
    marginLeft: leftIcon ? semantic.spacing.sm : 0,
    marginRight: rightIcon ? semantic.spacing.sm : 0,
  }

  const pressedStyle: ViewStyle = variant === 'primary'
    ? { backgroundColor: semantic.colors.accent.primaryPressed as any }
    : variant === 'secondary'
      ? { backgroundColor: semantic.colors.interactive.fillPressed as any }
      : { opacity: 0.9 }

  const spinnerSize = size === 'sm' ? theme.iconSizes.sm : theme.iconSizes.md
  const spinnerColor = (() => {
    if (variant === 'primary') return semantic.colors.text.onAccent as any
    if ((variant as any) === 'danger') return semantic.colors.state.onDanger as any
    return semantic.colors.accent.primary as any
  })()

  const [focused, setFocused] = React.useState(false)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || loading || !onPress), busy: !!loading }}
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={(e) => {
        if (disabled || loading || !onPress) return
        onPress?.(e)
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      testID={testID || (variant === 'primary' ? 'button.primary' : variant === 'secondary' ? 'button.secondary' : `button.${variant}`)}
      style={({ pressed }) => [
        base,
        { backgroundColor: backgroundColor as any },
        focused && { borderWidth: Math.max(base.borderWidth || 1, 2), borderColor: semantic.colors.focus.ring as any },
        pressed && !disabled && !isLoading && pressedStyle,
        style,
      ]}
      disabled={!!(disabled || loading || !onPress)}
      pointerEvents={isLoading ? 'none' : 'auto'}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', opacity: isLoading ? 0 : 1 }}>
        {leftIcon}
        <Text style={textStyle}>{title}</Text>
        {rightIcon}
      </View>
      {isLoading && (
        <ActivityIndicator testID="button.spinner" size={spinnerSize} color={spinnerColor} />
      )}
    </Pressable>
  )
}

export const PrimaryButton = (props: Omit<ButtonProps, 'variant'>) => <Button {...props} variant="primary" />
export const SecondaryButton = (props: Omit<ButtonProps, 'variant'>) => <Button {...props} variant="secondary" />
export const OutlineButton = (props: Omit<ButtonProps, 'variant'>) => <Button {...props} variant="outline" />
export const GhostButton = (props: Omit<ButtonProps, 'variant'>) => <Button {...props} variant="ghost" />
