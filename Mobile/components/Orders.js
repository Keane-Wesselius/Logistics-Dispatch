import React, { useEffect, useState } from 'react'
import {View, StyleSheet,Text,TextInput,Button,  TouchableOpacity} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import orders_json from './orders.json';
import { useNavigation } from '@react-navigation/native'
import Map from '../screens/Map';
import Packets, { UpdateOrderStatus, Status } from "./packets";


const Orders = (props) => {
    //console.log("orders somehow?");
    const navigation = useNavigation();
  const[currentIndex, setCurrentIndex] = useState(null);
  //const[shippingAddress, setShippingAddress] = useState('');
  const {shippingAddress, onPress} = props;
  let hasCurrentOrder = null;
  const handlePress = (dest_address, startAddress) =>{

    global.ws.onmessage = (response) => {
        const packet = response.data;
        console.log("Order Got a packet back");
        console.log("Order got this packet:" + packet);
        if (Packets.getPacketType(packet) == Packets.PacketTypes.SET_CURRENT_ORDER) {
            hasCurrentOrder = null;

            const json_obj = JSON.parse(packet);
            let acceptedOrders = json_obj.data;


            if (acceptedOrders.length >= 1) {
                console.log("Has a current order");
                hasCurrentOrder = true;
            }
            else {
                console.log("Does not have a current order");
                hasCurrentOrder = false;
            }
        } else if (Packets.getPacketType(packet) === Packets.PacketTypes.UPDATE_ORDER_STATUS_SUCCESS) {
            console.log("Order was accepted");
        
            navigation.navigate('Map', {
                deliveryAddress: dest_address,
                orderId: props.orderId,
                startAddress: startAddress
            })
        }

        else if (Packets.getPacketType(packet) === Packets.PacketTypes.UPDATE_ORDER_STATUS_FAILURE)
        {
            alert("Failed to take order");
        }
      };


    const getCurrentOrdersPacket = new Packets.GetCurrentOrder();
    try {
        global.ws.send(getCurrentOrdersPacket.toString());
    } catch {
        alert("Connection error, check that you are connected to the internet");
    }

    if (hasCurrentOrder != null) {
        console.log(hasCurrentOrder);
        if (!hasCurrentOrder) {
            console.log('order trying to get accepted');
            const acceptPacket = new Packets.UpdateOrderStatus(props.orderId, Status.ACCEPTED);
            console.log(acceptPacket);
            try{
                global.ws.send(acceptPacket.toString());
            }
            catch
            {
                alert("Connection error, check that you are connected to the internet");
            }
            }
            else {
                alert("There is an active order, cancel to accept a new order.");
            }
        }
    }

    


    
   //console.log(dest_address);
   //console.log(startAddress);
  //}
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
    <Text style = {{fontSize: 20, fontWeight: 'bold'}}> Order: {props.orderNumber}</Text>
   
   
    
    <TouchableOpacity style = {styles.circular} onPress = {() => handlePress(props.shippingAddress, props.startAddress)} >
        <Text>Deliver</Text>
        </TouchableOpacity>   
    

    </View>
    {currentIndex == true && 
    <View style ={{flexDirection: 'column', marginTop: '5%' }}>
      
          
        <View>
          
          <Text>Estimated Delivery Date: {props.preferredDate}</Text>
          <Text>Start Address: {props.startAddress}</Text>
          <Text>Shipping Address: {props.shippingAddress}</Text>
          <Text>Delivery Price: ${props.deliveryPrice}</Text>
          <Text>Merchant: {props.merchantName}</Text>
          {/*<Text>Pending Date: {props.pendingDate}</Text>
          <Text>Pending Time: {props.pendingTime}</Text>
    <Text>Status: {props.status}</Text>*/}
          <Text>Supplier: {props.supplierName}</Text>
          <Text>TotalCost: ${props.totalCost}</Text>
          <Text>Items: </Text>
          <Text>{props.items}</Text>
          
          {/*<Text>Shipping Name: {props.shippingName}</Text>
          <Text>Shipping Address: {props.shippingAddress}</Text>
          <Text>Shipping Info: {props.shippingInfo}</Text>
        <Text>Shipping Date: {props.shippingDate}</Text>*/}

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
