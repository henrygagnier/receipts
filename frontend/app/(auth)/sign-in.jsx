import { useGlobalContext } from "../../context/GlobalProvider";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import FormField from "../../components/formField";
import { Link } from "expo-router";
import { useNavigation } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

const SignIn = () => {
  const { setAuthState } = useGlobalContext(); // Access `setAuthState` from the global context
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const submit = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://receipts-auth.vercel.app/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Signed in successfully!");

        // Save the token
        await AsyncStorage.setItem("token", data.token);

        // Trigger global state update
        setAuthState((prev) => !prev); // Toggle the state to trigger `useEffect` in GlobalProvider

        // Navigate to "/"
        navigation.navigate("index");
      } else {
        Alert.alert("Error", data.message || "Something went wrong!");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="w-full min-h-[85vh] px-6 my-6 h-full">
          <Text className="text-5xl font-extrabold text-green-600 mt-12">
            GreenPoints
          </Text>
          <Text className="text-2xl mt-10 font-semibold">
            Sign in to GreenPoints
          </Text>
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles={"mt-7"}
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles={"mt-7"}
            secureTextEntry={true} // Mask the password input
          />
          <TouchableOpacity
            onPress={submit}
            disabled={loading}
            className={`${
              loading ? "bg-gray-400" : "bg-green-500"
            } mt-6 rounded-lg text-center items-center px-8 py-4 active:opacity-80`}
          >
            <Text className="text-white text-lg font-bold">
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>
          <View className="flex-row gap-2 justify-center pt-5">
            <Text className="text-lg">Don't have an account?</Text>
            <Link
              href="/sign-up"
              className="text-lg font-semibold text-green-500"
            >
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;