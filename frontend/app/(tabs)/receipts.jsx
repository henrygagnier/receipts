import { View, Text } from 'react-native';
import React from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

const Receipts = () => {
  const a = async () => {
    await AsyncStorage.removeItem("token");
  }
  a();
  return (
    <View>
      <Text>Receipts</Text>
    </View>
  )
}

export default Receipts