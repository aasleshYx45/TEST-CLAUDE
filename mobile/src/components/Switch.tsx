import { useEffect, useRef } from 'react'
import { Animated, Pressable, StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, radius } from '../theme'
import { tap } from '../haptics'

type Props = { value: boolean; onChange: (next: boolean) => void; gradient: readonly [string, string] }

export function Switch({ value, onChange, gradient }: Props) {
  const knob = useRef(new Animated.Value(value ? 1 : 0)).current

  useEffect(() => {
    Animated.spring(knob, { toValue: value ? 1 : 0, useNativeDriver: true, friction: 9, tension: 90 }).start()
  }, [value, knob])

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => {
        tap()
        onChange(!value)
      }}
      style={styles.track}
    >
      {value ? (
        <LinearGradient colors={[...gradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.off]} />
      )}
      <Animated.View style={[styles.knob, { transform: [{ translateX: knob.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }] }]} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  track: {
    width: 50,
    height: 30,
    borderRadius: radius.pill,
    padding: 4,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  off: { backgroundColor: colors.surface3, borderRadius: radius.pill },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
})
