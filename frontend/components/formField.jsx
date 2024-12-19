import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useState } from 'react';
import "../global.css";
import { icons, images } from '../constants';

const FormField = ({ title, placeholder, handleChangeText, value, otherStyles, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base">{title}</Text>

      <View className="w-full h-10 rounded-xl px-2 border-[1px] border-gray-200 border-solid flex-row">
        <TextInput className="flex-1 text-base" value={value} placeholder={placeholder} onChangeText={handleChangeText} secureTextEntry={title == "Password" && !showPassword}>
        </TextInput>
      </View>
    </View>
  )
}

export default FormField