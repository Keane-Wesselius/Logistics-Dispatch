import React, { useEffect, useRef, useState } from "react";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import {
  View,
  Image,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Dimensions,
  Animated, PanResponder, StatusBar,
} from "react-native";
import MapViewDirections from "react-native-maps-directions";
import { FontAwesome5, Entypo,AntDesign } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as TaskManger from "expo-task-manager";
import { useNavigation } from '@react-navigation/native'
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet from "../components/BottomSheet";
import { useIsFocused } from '@react-navigation/native';
import Packets from "./packets";
//import { BottomSheet } from "react-native-elements";

const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width/height;

/**
 * Map component to display Map in screen
 * { route, navigation },
 */
const Map = ({ route}) => {
   /*
    All const variables 
  */
 //getting current position of drivers
 const [location, setLocation] = useState(null);
 //getting time to get to the location, getting angle of car right
 const [duration, setDuration] = useState(0);
 const [miles, setMiles] = useState(0);
 const [isReady, setIsReady] = useState(false);
 const [angle, setAngle] = useState(0);
 const mapViewRef = useRef();
// for inputing address and getting coordinates
const [address, setAddress] = useState("");
const [coordinates, setCoordinates] = useState([]);
const [searchDeliveryAddress, setSearchDeliveryAddress] = useState(null);
  const isFocused = useIsFocused();
  //getting delivery addresss from orderlist on press
 const [deliveryAddress, setDeliveryAddress] = useState(null);
 const [startAddress, setStartAddress] = useState(null);
 const [startAddressCoord, setStartAddressCoord] = useState(null);
  let waypoints = []
 //gets start and delivery address from orderlist when deliver is pressed
 const [orderId, setOrderId] = useState(null);
  useEffect(() => {
    if(route.params && route.params.deliveryAddress){
    setDeliveryAddress(route.params.deliveryAddress);
    setOrderId(route.params.orderId);
    setStartAddress(route.params.startAddress);
    }
  
  }, [route.params]);
 
 //console.log(isFocused);
 
 //clearing delivery route when went out of screen
 useEffect(() => {
  if (isFocused) {
    global.ws.onmessage = (response) => {
      const packet = response.data;

      if (Packets.getPacketType(packet) == Packets.PacketTypes.SET_CURRENT_ORDER) {
        console.log("SETTING CURRENT ORDER " + packet);
        const json_obj = JSON.parse(packet);
        let allOrders = json_obj.data;

        if(allOrders.length >= 1) {
          setDeliveryAddress(allOrders[0].endingAddress);
          setOrderId(allOrders[0]._id);
          setStartAddress(allOrders[0].startingAddress);
        }
      }
    }

    try {
      const packet = new Packets.GetCurrentOrder();
      global.ws.send(packet.toString());
    } catch {
      alert("Error sending packet on map screen");
    }
  }
  else{
    setDeliveryAddress('');
    setCoordinates('');
    setDuration(0);
    setMiles(0);
    setStartAddressCoord('');
    setStartAddress('');    
  }
},[isFocused])

  //clearing delivery Address
  function clearDeliveryAddress(){
    setDeliveryAddress('');
    setCoordinates('');
    setDuration(0);
    setMiles(0);
    setStartAddressCoord('');
    setStartAddress('');
    
 
  }
  console.log(startAddress)
  /**
   * Handling when presed complete delivery, the deliveries in orderlist should be deleted
   */
  const removeOrder = () => {
     
  }
 
 /**
   * 
   * when clicked search button on map, handles, the minutes and routing
   * */
 const handleSubmit = async () => {
  console.log(address);
  const result = await Location.geocodeAsync(address);
  if (result.length > 0) {
    //console.log(result[0]);
    setDeliveryAddress(result[0]);
  }
 

   <Text>{Math.ceil(duration)} mins </Text> 
   
};

  const getLocationAsync = async () => {
    try {
      let delivery_result = await Location.geocodeAsync(deliveryAddress);
      let start_result = await Location.geocodeAsync(startAddress);
      let latlng = {
        latitude:delivery_result[0].latitude,
        longitude: delivery_result[0].longitude,
      };
      let latlng2 = {
        latitude: start_result[0].latitude,
        longitude:start_result[0].longitude,
      };
      setCoordinates([latlng]);
      setStartAddressCoord([latlng2])
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if(deliveryAddress){
      getLocationAsync();
    }
  }, [deliveryAddress]);
  
  
  /***
   * Getting coordinates from a given array of addresses 
 
  const getLocationAsync = async() => {
    const promises = fake_addressses.map(async fake_address => {
      let xyz = await Location.geocodeAsync(fake_address);
      return xyz[0];
    });
    Promise.all(promises).then(xyzs =>{
      setCoordinates(xyzs);
    })};
    //this prevents from infinite looping when trying find coordinates
    useEffect(() => {
      if (coordinates.length === 0) {
        getLocationAsync();
      }
    }, [coordinates]);

    */
  //sets destination address for destination marker
  const handleAddress = (text) => {
    setAddress(text);
  };


 

  /**
   * Getting permission right after starting the app
   */ useEffect(() => {
      let timeoutId = null; 
    const getLocation = async () => {
      try{
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          heading: location.coords.heading,
          latitudeDelta: 0.09,
          longitudeDelta: 0.04,
        });
      }}
      catch(e){
        //console.log("shiva");
      }
    };
    getLocation();

    // retry every 3 second if location yet not available
    timeoutId = setTimeout(getLocation, 3000);
  
    //changing rotation of marker as we rotate the phone and move to destination route
    Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
      distanceInterval: 0.1
    },
    location => {
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading,
        latitudeDelta: 0.09,
        longitudeDelta: 0.04,
      })
    }
    
    )
    return () => {
      clearTimeout(timeoutId);
    }
  }, []);
  
 
  
  /**
   * Calculate angle of car icon according to map directions
   */

  function calculateAngle(coordinates){
    let startLat = coordinates[0]["latitude"]
    let startLang = coordinates[0]["longitude"]
    let endLat = coordinates[1]["latitude"]
    let endLang = coordinates[1]["longitude"]
    let dx = endLat - startLat
    let dy = endLang - startLang

    return Math.atan2(dy,dx) *180/ Math.PI;
  }

   // making start address waypoints
   if(startAddress){
    waypoints = [startAddress];
   }
   else{
     waypoints = [location];
   }
  
  /**
   * Renders Map to Screen
   * @returns
   */
  function renderMap() {
   

  
    /**
     * Returns Map View
     */
    return (
      //map View
      <View style={{ flex: 1 }}>
        <MapView
          provider={PROVIDER_GOOGLE}
          initialRegion={location}
          zoomEnabled={true}
          style={{ flex: 1 }}
          followsUserLocation = {true}
          rotateEnabled
        >
      
          {/** MapViewDirection component to see route*/}
          <MapViewDirections
            //origin={fake_location }
            origin = {location}
            //destination = {{latitude: 47.64667644307501,
            //longitude: -122.33536691338327}}
            destination={deliveryAddress}
            strokeColor = 'purple'
            strokeWidth= {3}
            waypoints = {waypoints}
            alternatives = {true}
            apikey="AIzaSyDNawxdz2xAwd8sqY_vq9YB7ZRTQPgp-tA"
            mode="DRIVING"
            
            //optimizing waypoints
            optimizeWaypoints={true}
         
            //waypoints_times = {duration} 
            onReady = {result => {
              setDuration(result.duration)
              setMiles(result.distance )
              if(mapViewRef.current){
                //fit route into maps
                mapViewRef.current.fitToCoordinates(result.coordinates, {
                  edgePadding:{
                    right: (width/20),
                    bottom: (height/20),
                    left: (width/20),
                    top: (height/20)
                  }
                })

                //changing the car location to road block
                let nextLoc = {
                      latitude: result.coordinates[0]["latitude"],
                      longitude: result.coordinates[0]["longitude"],
                }
                if(result.coordinates.length >= 2){
                  let angle = calculateAngle(result.coordinates)
                  setAngle(angle)
                }
                setLocation(nextLoc)
                setIsReady(true)
                
              }
            }}
          />
         
         
         {/**
            * Car Icon to display car in the map
          */}
          {location && (
             <Marker
          
             coordinate={location}
             //SHIVA this is keane ^^^ The above line is whats screwing up on android devices
             //For now I have placed the line beneath so the app doesnt freakout
             //coordinate={{latitude: 0, longitude: 0}}
             //coordinate={fake_location}
   
             //coordinate = {{  latitude: location.coords.latitude, longitude: location.coords.longitude,}}
             //rotation = {}
             anchor={{ x: 0.5, y: 0.5 }}
             flat={true}
             title="Driver Location"
             //rotation={location.heading}
           >
            {/**car marker */}
             <View>
               <FontAwesome5 name="car" size={24} color="red" />
               <Text style = {{
                
                 fontSize: 15, 
                 fontWeight: 'bold', 
                 }}>{Math.ceil(duration)} mins,</Text>  
                 <Text style = {{
                
                fontSize: 15, 
                fontWeight: 'bold', 
                }}>{Math.ceil(miles)} miles </Text>  
                
             </View>
             </Marker>
          )}

          
          {
          /**
           * Putting Destination in the Map
           */}
          {coordinates && coordinates.map((coord, index) => (
          <Marker key={index} coordinate={coord} title={deliveryAddress} >
             <View>
                     <Entypo name="location-pin" size={24} color="red" />
                 </View>
          </Marker>
        ))}
        {startAddressCoord && startAddressCoord.map((coord, index) => (
          <Marker key={index} coordinate={coord} title={startAddress} >
             <View>
                  <Entypo name="location-pin" size={24} color="black" />
              </View>
          </Marker>
        ))}
           
          {/*deliveryAddress &&(<Marker  coordinate={deliveryAddress}  >
             <View>
                     <Entypo name="location-pin" size={24} color="red" />
                 </View>
          </Marker>)*/}
           
        </MapView>
      </View>
    );
  }
  /**
   * Puts header in map to put address
   */
  function renderDestinationHeader(){
    return (
      
      <View
      style = {{
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
      
      }}
      >
         {!startAddress &&(
        <View
        style = {{
          flexDirection: 'row',
          alignItems: 'center',
          width: width*0.9,
          height: '100%',
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 10,
          backgroundColor: 'white'
        }}>
          <Entypo name="location-pin" size={20} color="black" />
         
          <TextInput
              value={address}
              onChangeText={handleAddress}
              placeholder="Enter Address"
              style={{
                marginLeft: '5%',
                width: '50%',
                
              }}
            />
            <TouchableOpacity
              style={{
                  alignItems: 'flex-end',
                  width: '25%',
                  marginLeft: '10%',
                  height: '100%',
                  backgroundColor: 'white',
                  //boarderWidth: 10,
                  borderColor: 'black',
                 // backgroundColor: 'red',
                  //padding: 10,
                  borderRadius: 5,
                  alignItems: 'center',
                  flexDirection: 'row',
              }}
              onPress = {handleSubmit}
            >
            <AntDesign name="search1" size={20} color="black" />
             <Text style = {{
              marginLeft: 30,
              fontSize: 18, 
              fontWeight: 'bold', 
              alignItems: 'center', 
              justifyContent: 'center', 
              position: 'absolute'
              }}>
                Search
            </Text>
            </TouchableOpacity>

        
        </View>
  )}
      </View>
    )
  }
  /**
   * Renders slide up confirm delivery on Map
   */
  function renderConfirmDelivery(){
    return (
      <GestureHandlerRootView style ={{}}>
        <View style = {{
          flex: 1,
          backgroundColor: '#111',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <StatusBar style = "light"/>
          { deliveryAddress && startAddress && (
          <BottomSheet clearDeliveryAddress = {clearDeliveryAddress} removeOrder = {removeOrder} orderId = {orderId}/>)
          }
        </View>
        
        
      </GestureHandlerRootView>
    )
  }
  /**
   * Returning Main Map
   */
  return <View style={{ flex: 1 }} >
    
    {renderMap()}
    {renderDestinationHeader()}
    {renderConfirmDelivery()}
    </View>;
};

export default Map;
