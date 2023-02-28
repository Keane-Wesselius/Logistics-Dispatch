import React, { useEffect, useState } from 'react'
import {View, StyleSheet,Text,TextInput,Button,  TouchableOpacity} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import orders_json from './orders.json';
import { useNavigation } from '@react-navigation/native'
import Map from '../screens/Map';


const Orders = (props) => {
    //console.log("orders somehow?");
    const navigation = useNavigation();
  const[currentIndex, setCurrentIndex] = useState(null);
  //const[shippingAddress, setShippingAddress] = useState('');
  const {shippingAddress, onPress} = props;
  const handlePress = (dest_address) =>{
    navigation.navigate('Map', {
       deliveryAddress: dest_address,
       orderId: props.buyerId
    })
   //console.log(dest_address);
  }
  //parsing from json file
    /*
   {parsedOrders.map((order, index) => (
        <View>
           <Text key={index}>Payload: {order.payload} </Text>
           <Text key={index}>Shiping Name:  {order.shippingName}</Text>
           <Text key={index}>shiping Addrss: {order.shippingAddress}</Text>
           <Text key={index}>Shiping Info: {order.shippingInfo}</Text>
           <Text key={index}>Shipping Date: {order.shippingDate}</Text>
           <Text key={index}>Estimated Delivery: {order.estimatedDelivery}</Text>
           <Text key={index}>Buyer ID: {order.buyerId}</Text>
        </View>
    ))}
   */
  return (
   <View style = {styles.item}>
    <View style = {styles.itemLeft}>
    <TouchableOpacity 
    style = {styles.square} 
    onPress = {()=>{
    if (currentIndex == false)
        setCurrentIndex(true)
    else
        setCurrentIndex(false)
    }}
    >
        <MaterialCommunityIcons name="details" size={25} color="black" />
        <Text style = {{ fontWeight: 'bold', color: 'black'}}>
            Details
        </Text>
    </TouchableOpacity>
    <Text style = {{fontSize: 20, fontWeight: 'bold'}}> Order: {props.buyerId}</Text>
   
   
    
    <TouchableOpacity style = {styles.circular} onPress = {() => handlePress(props.shippingAddress)} >
        <Text>Deliver</Text>
        </TouchableOpacity>   
    

    </View>
    {currentIndex == true && 
    <View style ={{flexDirection: 'column', marginTop: '5%' }}>
      
          
        <View>
          <Text>Buyer ID: {props.buyerId}</Text>
          <Text>Shipping Name: {props.shippingName}</Text>
          <Text>Shipping Address: {props.shippingAddress}</Text>
          <Text>Shipping Info: {props.shippingInfo}</Text>
          <Text>Shipping Date: {props.shippingDate}</Text>
        </View>
    
    
    </View>
 }
   </View>
     
  ) 
  
}
export default Orders;
const styles = StyleSheet.create({
    item:{
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        //flexDirection: 'row',
        //alignItems: 'center',
        //justifyContent:'space-between',
        marginBottom: 20,
    },
    itemLeft:{
        flexDirection: 'row',
        //backgroundColor: 'black',
        alignItems: 'center',
        width: '100%',
      //  height: '100%',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    square:{
        width: 50,
        height: 50,
        backgroundColor:'#55bcf6', //'#fdf6e4',
        opacity: 0.4,
        borderRadius: 5,
        //marginRight: 15,
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    circular:{
        width: 100,
        height: 35,
        backgroundColor: '#fdf6e4',
        alignItems: 'center',
        borderRadius: 10,
       
        justifyContent: 'space-evenly',
    },
    itemText:{
        maxWidth: '80%',
        justifyContent: 'space-evenly',
    },
})
