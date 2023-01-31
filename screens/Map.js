import React, { useEffect, useState } from "react";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import {
  View,
  Image,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";
import MapViewDirections from "react-native-maps-directions";
import { FontAwesome5, Entypo } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as TaskManger from "expo-task-manager";

/**
 * Map component to display Map in screen
 */
const Map = ({ route, navigation }) => {
  //for testing
  const fake_location = {
    latitude: 47.0001255,
    longitude: -120.5422917,
  };
  const [region, setRegion] = useState(null);
  const [destRegion, setDestRegion] = useState(null);

  // for inputing address and getting coordinates
  const [address, setAddress] = useState("");
  //const [destinatio, setCoordinates] = useState(null)

  const handleAddress = (text) => {
    setAddress(text);
  };

  const handleSubmit = async () => {
    const result = await Location.geocodeAsync(address);
    if (result.length > 0) {
      setDestRegion(result[0]);
    }
  };
  //getting current position of drivers
  const [location, setLocation] = useState(null);

  /**
   * Getting permission right after starting the app
   */ useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      }
    };
    getLocation();
  }, []);

  /**
   * Hard coded location for testing
   */
  useEffect(() => {
    let mapRegion = {
      latitude: 47.0001255,
      longitude: -120.5422917,
      latitudeDelta: 0.09,
      longitudeDelta: 0.04,
    };
    let mapDestRegion = {
      latitude: 47.64667644307501,
      longitude: -122.33536691338327,
    };
    setRegion(mapRegion);
    //setDestRegion(mapDestRegion)
  }, []);

  /**
   * Renders Map to Screen
   * @returns
   */
  function renderMap() {
    /**
     * Putting Destination in the Map
     */
    const DestinationMarker = () => {
      return (
        <Marker coordinate={destRegion}>
          <View>
            <Entypo name="location" size={24} color="black" />
          </View>
        </Marker>
      );
    };
    /**
     * Car Icon to display car in the map
     */
    const CarIcon = () => {
      return (
        //for current location

        <Marker
          //coordinate={location.coords}
          coordinate={fake_location}
          //coordinate = {{  latitude: location.coords.latitude, longitude: location.coords.longitude,}}
          anchor={{ x: 0.5, y: 0.5 }}
          flat={true}
          title="Driver Location"
        >
          <View>
            <FontAwesome5 name="car" size={24} color="black" />
          </View>
        </Marker>
      );
    };

    /**
     * Returns Map View
     */
    return (
      //map View
      <View style={{ flex: 1 }}>
        <MapView
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          zoomEnabled={true}
          style={{ flex: 1 }}
        >
      
          {/** Making textbox for inputing address */}
          <View
            
            style={{
              padding: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              opacity: 0.5,
              width: "100%",
              height: "20%",
              flexDirection: "row",
            }}
          >
            <TextInput
              value={address}
              onChangeText={handleAddress}
              placeholder="Enter Address"
              style={{
                padding: 10,
                backgroundColor: "white",
                marginTop: "5%",
                width: "60%",
                height: "30%",
                borderRadius: 10,
              }}
            />
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                marginTop: "5%",
                marginLeft: 10,
                width: "30%",
                height: '30%',
                borderRadius: 10,
              }}
              onPress = {handleSubmit}
            >
             <Text> shiva</Text>
            </TouchableOpacity>
          </View>

          {/** MapViewDirection component to see route*/}
          <MapViewDirections
            origin={fake_location }
            //origin = {{latitude: location.coords.latitude, longitude: location.coords.longitude,}}
            //destination = {{latitude: 47.64667644307501,
            //longitude: -122.33536691338327}}
            destination={destRegion}
            apikey="AIzaSyDNawxdz2xAwd8sqY_vq9YB7ZRTQPgp-tA"
            mode="DRIVING"
            stokeWidth={5}
            stokeColor="red"
            optimizeWaypoints={true}
          />
          <CarIcon />
          <DestinationMarker />
        </MapView>
      </View>
    );
  }

  /**
   * Returning Main Map
   */
  return <View style={{ flex: 1 }}>{renderMap()}</View>;
};

export default Map;
