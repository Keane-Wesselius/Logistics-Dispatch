import { StatusBar } from 'expo-status-bar';
import {ImageBackground, StyleSheet, Text, View } from 'react-native';
import Sign from './screens/Sign_in';
import { NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from  '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import Order from './screens/Order';
import Map from './screens/Map';
import Tabs from './navigation/Tabs';

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

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
        initialRouteName = {"HomeScreen"}
      >
      <Stack.Screen name="HomeScreen" component={Tabs}/>
      <Stack.Screen name="Sign In" component={Sign}/> 
      <Stack.Screen name="Orders" component={Order}/> 
      <Stack.Screen name="Map" component={Map}/>   
      </Stack.Navigator>
    </NavigationContainer>
  );
}

