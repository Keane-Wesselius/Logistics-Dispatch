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

const OrderList = ({navigation, props, route}) => {

  const isFocused = useIsFocused();
  let allOrders = [];
  useEffect(() => {
    if (isFocused) {
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
    } else {
      console.log('OrderList is not focused');
    }
  }, [isFocused]);

	let orders_json = [];
  
	global.ws.onmessage = (response) => {
		const packet = response.data;
		//console.log(packet);
    //console.log("shiva");
		if (Packets.getPacketType(packet) === Packets.PacketTypes.SET_ALL_CONFIRMED_ORDERS) {
			console.log("GOT CONFIRMED ORDERS");
      //console.log("shiva");
			//const setLinkedOrdersPacket = GetLinkedOrders.fromJSONString(packet);
			//orders_json = setLinkedOrdersPacket;
      
			//console.log("packet: " + packet);
      const json_obj = JSON.parse(packet);
      //console.log(json_obj);
      allOrders = json_obj.data;
      //console.log(allOrders)
		}
	};

	console.log("All ordres: "+ allOrders)

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
  

  const filteredOrders = orders_json.filter((order) => order.buyerId !== removeOrder);
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
      <View style = {styles.items}>
      {/**List of all orders with Order component */}
      {allOrders.map((order) => (
      <Orders 
      key={order.buyerId}
      buyerId= {order.buyerId}
      //driverId = {order.driverId}
      //endingAddress = {order.endingAddress}
      //shippingName={order.shippingName}
      shippingAddress={order.shippingAddress}
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

