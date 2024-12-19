import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import FormField from "../../components/formField";
import { Link } from "expo-router";

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = () => {

  }
  
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
          />
          <TouchableOpacity
            onPress={submit}
            className="bg-green-500 mt-6 rounded-lg text-center items-center px-8 py-4 active:opacity-80"
          >
            <Text className="text-white text-lg font-bold">Sign In</Text>
          </TouchableOpacity>
          <View className="flex-row gap-2 justify-center pt-5">
            <Text className="text-lg">
              Don't have an account?
            </Text>
            <Link href="/sign-up" className="text-lg font-semibold text-green-500">Sign Up</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
