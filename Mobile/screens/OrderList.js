import React, { useEffect, useState }from 'react';
import Orders from '../components/Orders';
import {View, ScrollView, StyleSheet,Text,TextInput,Button,  TouchableOpacity} from 'react-native';
import { addDays, eachDayOfInterval, eachWeekOfInterval, format, subDays } from 'date-fns';
import orders_jsons from '../components/orders.json';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
//import Map from './Map';
import PagerView from 'react-native-pager-view';
import Packets, { GetLinkedOrders } from "./packets";
import Item from '../components/Item'
import { ActivityIndicator } from 'react-native';

let counter = 0;
let allOrders = [];
const OrderList = ({navigation, props, route}) => {
  //dealing with having to change
  const [loading, setLoading] = useState(true);
  const [hiddenValue, setHiddenValue] = useState(true);
  const isFocused = useIsFocused();
 

  

  useEffect(() => {
    const intervalId = setInterval(() => {
      setHiddenValue(true);
      const getAllConfirmedOrdersPacket = new Packets.GetAllConfirmedOrders();
      try{
        global.ws.send(getAllConfirmedOrdersPacket.toString());
        }
        catch
        {
          alert("Connection error, check that you are connected to the internet");
        }
    }, 10000);

    if (isFocused) {

      global.ws.onmessage = (response) => {
        const packet = response.data;
        console.log("Orderlist Got a packet back");
        console.log("order List got this packet:" + packet);
        if (Packets.getPacketType(packet) === Packets.PacketTypes.SET_ALL_CONFIRMED_ORDERS) {
          console.log("GOT CONFIRMED ORDERS");
          
          //const setLinkedOrdersPacket = GetLinkedOrders.fromJSONString(packet);
          //orders_json = setLinkedOrdersPacket;
          
          //console.log("packet: " + packet);
          const json_obj = JSON.parse(packet);
          allOrders = json_obj.data;
          
    
        }
        setLoading(false);
        setHiddenValue(false);
      };


      console.log('orderList about to send packet');
      const getAllConfirmedOrdersPacket = new Packets.GetAllConfirmedOrders();
      console.log(getAllConfirmedOrdersPacket);
      try{
        global.ws.send(getAllConfirmedOrdersPacket.toString());
        }
        catch
        {
          alert("Connection error, check that you are connected to the internet");
        }


      

    } 
    
    
    else {
      clearInterval(intervalId);
      setLoading(true);
      console.log('OrderList is not focused');
    }

    console.log("Orderlist isFocused = " + isFocused);

    
    
  }, [isFocused]);

	let orders_json = [];

	
 

 /* if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }*/

  //const navigation = useNavigation();
 // navigation.navigate('Map', {
  //  deliveryAddress: 'shiva'
 // });
 
  //getting removeorder passed from Map after complete order is pressed
  const [removeOrder, setRemoveOrder] = useState(null);
  
  useEffect(() => {
    if(route.params && route.params.removeOrder){
      setRemoveOrder(route.params.removeOrder);
     }
     
  }, [route.params]);
  

  //generating dates in between 1-15 days
  const dates = eachWeekOfInterval({
    start: subDays(new Date(), 1),
    //start: new Date(),
    end: addDays(new Date(), 14),
  }, {
    //setting start day as Monday
    weekStartsOn: 1,
    },
    ).reduce((acc, cur) =>{

      const allDays = eachDayOfInterval({
        start: cur,
        end: addDays(cur, 6),
      })
      acc.push(allDays);
      return acc;
    }, []);

    if (loading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }

  return (
    <View style = {styles.container}>
    <Text style = {styles.heading}>List of Orders</Text>
   
      {/**Calender horizontal slider  
       <PagerView style = {styles.pagerview}>
      {dates.map((week, i) =>{
        return (
        <View key={i}>
          <View style = {styles.row}>
              {week.map(day =>  {
                const txt = format(day, 'EEEEEE')
                return (
                  <View style = {styles.day}>
                    <TouchableOpacity style = {styles.day}>
                    <Text style ={{fontSize: 18, fontWeight: 'bold'}}> {txt}</Text>
                    <Text style ={{fontSize: 18,  fontWeight: 'bold',color: 'grey'}}>{day.getDate()}</Text>
                    </TouchableOpacity>
                  </View>
                )
              })}
          </View>
        </View>);
      })}
     </PagerView>
     */}
     {/**Order List Vertical Slider */}
    <ScrollView  style = {styles.scroll_container}> 
    <View style = {styles.tasksWrapper}>
      <Text style = {styles.sectionTitle}>Today's Orders</Text>
    </View>
    <View style={{ display: 'none' }}>
        {hiddenValue}
      </View>
      <View style = {styles.items}>
      {/**List of all orders with Order component */}
      {allOrders.map((order, index) => (
      <Orders 
      key={order._id}
      orderNumber = {index +1}
      orderId = {order._id}
      driverId = {order.driverId}
      confirmedDate = {order.confirmed_date}
      confirmedTime = {order.confirmed_date}
      estimatedDeliveryDate = {order.estimatedDeliveryDate}
      startAddress = {order.startingAddress}
      maximumDeliveryPrice = {order.maximumDeliveryPrice}
      merchantId = {order.merchantId}
      minimumDeliveryPrice = {order.minimumDeliveryPrice}
      pendingDate = {order.pendingDate}
      pendingTime = {order.pendingTime}
      status = {order.status}
      supplierId = {order.supplierId}
      totalCost = {order.totalCost}
      items = {order.items.map((item) => (
        <Item
        key={item.name}
        name={item.name}
        price={item.price}
        quantity={item.quantity}
      />
      ))}
      //endingAddress = {order.endingAddress}
      //shippingName={order.shippingName}
      shippingAddress={order.endingAddress}
      //shippingInfo={order.shippingInfo}
      //shippingDate={order.shippingDate} 
      //text = {'Order 1'}
     
      />
    
     
      ))}
    </View>
    
   
   
    </ScrollView>  

  </View>
 
  )
}

export default OrderList


const styles = StyleSheet.create({
    heading:{
      marginTop:'15%',
      fontSize: 30,
      paddingHorizontal: '5%',
      fontWeight: 'bold'
    },
    container: {
        flex: 1,
        backgroundColor: '#D0EDF6',
    },
    pagerview:{
      marginTop: '5%',
      //backgroundColor: 'red',
      height: '15%'

    },
    scroll_container:{
      marginTop: 0,
    },
    tasksWrapper:{
       
        paddingHorizontal: 20,
    },
    sectionTitle:{
        fontSize: 24,
        marginTop: '5%'
        //fontWeight: 'bold'
    },
    items:{
      margin: '5%'
    },
    row:{
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    day:{
      alignItems: 'center',
      marginTop: '5%',
    }
})

