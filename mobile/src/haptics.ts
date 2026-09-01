import * as Haptics from 'expo-haptics'

/** Light tick for taps; the web build uses navigator.vibrate for the same thing. */
export const tap = () => {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

export const success = () => {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
}

export const warn = () => {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
}
