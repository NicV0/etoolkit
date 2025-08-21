import React from 'react'
import { Pressable, Text } from 'react-native'

type Props = {
  label: string
  onPress?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ label, onPress, variant = 'primary' }: Props) {
  const style = {
    primary: { borderWidth: 1, borderRadius: 8, padding: 12 },
    secondary: { borderWidth: 1, borderRadius: 8, padding: 12, opacity: 0.9 },
    ghost: { padding: 12 }
  }[variant]

  return (
    <Pressable onPress={onPress} style={style as any}>
      <Text>{label}</Text>
    </Pressable>
  )
}
