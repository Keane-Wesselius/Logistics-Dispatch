import React from 'react'
import {View, Image, TouchableOpacity} from 'react-native';

import {createBottomTabNavigator, BottomTabBar} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import OrderList from '../screens/OrderList';
import Map from '../screens/Map';
//import Sign_in from '../screens/Sign_in';
import  {useLayoutEffect} from 'react';
import Profile from '../screens/Profile';
import { Entypo, MaterialCommunityIcons , Octicons, Fontisto } from '@expo/vector-icons';
import menu from '../assets/menu.png';
import { useNavigation } from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';
//import BackgroundVideo from '../components/BackgroundVideo';
//const for bottom tab
const Tab = createBottomTabNavigator();


const Tabs = () => {
  const navigation = useNavigation();

  //getting rid of top header
  useLayoutEffect(() =>{
    navigation.setOptions({
      headerShown: false,
    });

  }, []);

  //custom button
  const TabBarCustomButton = (accessibilityState, children, onPress) =>{
     var isSeletected = accessibilityState.selected   
    if(isSeletected){
        return{
           
        }
      }
      else{
        return{

        }
      }
  }

  return (
    <Tab.Navigator
      screenOptions = {{
       // headerStyle: { backgroundColor: 'papayawhip' },
        headerShown: false,
        

      }}
    >
      
      <Tab.Screen
        name = "Map"
        component={Map}
        options = {{
          width: 20,

          tabBarIcon: ({focused}) => {
            return  <Fontisto name="map-marker-alt" size={25} color="black" />
          }
        }}
      >
      </Tab.Screen>
      <Tab.Screen

        name = "Home"
        component={HomeScreen}
        options = {{
          width: 20,

          tabBarIcon: ({focused}) => {
            return  <Entypo name="home" size={25} color="black" />
          }
        }}
      ></Tab.Screen>
      
      <Tab.Screen
        name = "OrdersList"
        component={OrderList}
        options = {{
          
          tabBarIcon: ({focused}) => {
            
            return <Octicons name="list-unordered" size={25} color="black" />
          }
        }}
      >
      </Tab.Screen>
      
      <Tab.Screen
        name = "Profile"
        component={Profile}
        options = {{
          tabBarIcon: ({focused}) => {
           return <MaterialCommunityIcons name="face-man-profile" size={25} color="black" />
          }
        }}
      >
      </Tab.Screen>
       
    </Tab.Navigator> 
    
  )
}

export default Tabs