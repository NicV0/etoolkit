import { Stack } from 'expo-router';

/**
 * The stack navigator for modal and push screens. This layout applies
 * common screen options such as hiding headers. Each file in this
 * directory becomes a route pushed on top of the tabs.
 */
export default function StackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}