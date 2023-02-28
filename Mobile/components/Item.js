import React, { useEffect, useState }from 'react';
import {View, StyleSheet,Text,TextInput,Button,  TouchableOpacity} from 'react-native';

const Item = ({ name, price, quantity }) => {
  return (
    <View style = {{padding: 10, flexDirection: 'column'}}>
        <Text>Name: {name}</Text>
        <Text>Price: {price}</Text>
        <Text>Quantity: {quantity}</Text>
      </View>
  )
}
export default Item