import React from 'react'
import { Pressable, View, Text, ViewStyle, TextStyle } from 'react-native'
import { semantic } from '../../lib/theme/tokens'

export type RowProps = {
  title?: string
  subtitle?: string
  left?: React.ReactNode
  right?: React.ReactNode
  children?: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  showSeparator?: boolean
  testID?: string
  accessibilityLabel?: string
  accessibilityHint?: string
  leftTestID?: string
  rightTestID?: string
}

const MIN_HEIGHT = 56

export function Row({
  title,
  subtitle,
  left,
  right,
  children,
  onPress,
  disabled = false,
  showSeparator = false,
  testID = 'row.item',
  accessibilityLabel,
  accessibilityHint,
  leftTestID = 'row.left',
  rightTestID = 'row.right',
}: RowProps) {
  const containerBase: ViewStyle = {
    minHeight: MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semantic.spacing.md,
    paddingVertical: semantic.spacing.sm,
    backgroundColor: semantic.colors.background.surface as any,
    borderBottomWidth: showSeparator ? 1 : 0,
    borderBottomColor: showSeparator ? (semantic.colors.border.subtle as any) : 'transparent',
  }

  const titleStyle: TextStyle = {
    color: semantic.colors.text.primary as any,
    fontFamily: semantic.type.family.primary,
    fontWeight: semantic.type.weight.medium as any,
    fontSize: semantic.type.body,
  }

  const subtitleStyle: TextStyle = {
    color: semantic.colors.text.secondary as any,
    fontFamily: semantic.type.family.primary,
    fontWeight: semantic.type.weight.regular as any,
    fontSize: semantic.type.meta,
    marginTop: semantic.spacing.xs,
  }

  const Content = (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
      {left ? <View style={{ marginRight: semantic.spacing.md }} testID={leftTestID}>{left}</View> : null}
      <View style={{ flex: 1 }}>
        {title ? <Text style={titleStyle}>{title}</Text> : null}
        {subtitle ? <Text style={subtitleStyle}>{subtitle}</Text> : null}
        {children}
      </View>
      {right ? <View style={{ marginLeft: semantic.spacing.md }} testID={rightTestID}>{right}</View> : null}
    </View>
  )

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          containerBase,
          pressed && !disabled && { backgroundColor: semantic.colors.background.elevated as any },
          disabled && { opacity: 0.6 },
        ]}
        onPress={() => {
          if (disabled) return
          onPress?.()
        }}
        testID={testID}
      >
        {Content}
      </Pressable>
    )
  }

  return (
    <View accessibilityLabel={accessibilityLabel ?? title} style={containerBase} testID={testID}>
      {Content}
    </View>
  )
}

export default Row
