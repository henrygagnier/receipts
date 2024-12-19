import {
  SafeAreaView,
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { ScrollView } from "react-native";
import { router } from "expo-router";

export default function Index() {
  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center px-6 min-h-screen">
          {/* Header Section */}
          <Text className="text-5xl font-extrabold text-green-600 mt-12">
            GreenPoints
          </Text>

          {/* Description Section */}
          <View className="mt-8">
            <Text className="text-2xl font-semibold text-center text-gray-800">
              Earn rewards for eating healthy with{" "}
              <Text className="text-green-500">GreenPoints</Text>
            </Text>
            <Text className="text-md text-center text-gray-600 mt-4">
              Scan your receipts and cash out rewards for making smart, healthy
              decisions.
            </Text>
          </View>

          {/* Button Section */}
          <TouchableOpacity
            onPress={() => router.push("/sign-in")}
            className="bg-green-500 mt-10 rounded-full px-8 py-4 active:opacity-80"
          >
            <Text className="text-white text-lg font-bold">
              Continue With Email
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
