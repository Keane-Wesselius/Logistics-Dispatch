import { StatusBar } from 'expo-status-bar';
import {ImageBackground, StyleSheet, Text, View } from 'react-native';
import Sign from './screens/Sign_in';
import { NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from  '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import OrderList from './screens/OrderList';
import Map from './screens/Map';
import Tabs from './navigation/Tabs';
import BackgroundVideo from './components/BackgroundVideo';
import React, { useState } from 'react'
import Register from './screens/register';
import Earnings from './screens/Earnings';

const Stack = createStackNavigator();
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen: {
    width: 100,
    height: 400,
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#000000a0',
  },
});
/**
 *   
*/


const App = ( props) => {
  const[deliveryAddress, setDeliveryAddress] = useState(null);
  const onOrderPress = (shippingAddress) => {
    setDeliveryAddress(shippingAddress)
  }
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
        initialRouteName = {"BackgroundVideo"}
      >
      <Stack.Screen name="HomeScreen" component={Tabs}/>
      <Stack.Screen name="Sign In" component={Sign}/> 
      <Stack.Screen name="OrdersList" component={OrderList}/> 
      <Stack.Screen name="Map" component={Map}/> 
      <Stack.Screen name="BackgroundVideo" component={BackgroundVideo}/> 
      <Stack.Screen name="Register" component={Register}/>    
      <Stack.Screen name="Earnings" component={Earnings}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App