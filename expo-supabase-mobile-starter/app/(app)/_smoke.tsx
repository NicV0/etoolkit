import { View, Text, Pressable } from "react-native";

export default function Smoke() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="rounded-2xl border border-gray-200 p-6">
        <Text className="text-xl font-semibold text-gray-900">NativeWind OK</Text>
        <Text className="mt-1 text-gray-600">Tailwind v3 + NativeWind v2 (no CSS)</Text>
        <Pressable className="mt-4 rounded-xl bg-blue-600 px-4 py-2">
          <Text className="text-white font-medium">Tap</Text>
        </Pressable>
      </View>
    </View>
  );
}
