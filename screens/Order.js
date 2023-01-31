import React, { useEffect, useState }from 'react';
import * as Location from 'expo-location';

import {View, Image,Text,TextInput,Button,  TouchableOpacity} from 'react-native';

const Order = () => {
 //In your component
const [address, setAddress] = useState("")
const [coordinates, setCoordinates] = useState(null)

const handleAddress = (text) => {
    setAddress(text)
}

const handleSubmit = async() => {
    const result = await Location.geocodeAsync(address);
    if(result.length>0){
        setCoordinates(result[0])
    }
}


  return (
    <View>  
      <TextInput 
        value={address}
        onChangeText={handleAddress}
        placeholder="Enter Address"
        style ={{padding: 40}}
    />
    <Button 
        title="Submit"
        onPress={handleSubmit}
    />
    {coordinates && 
        <Text>
            Latitude: {coordinates.latitude}
            Longitude: {coordinates.longitude}
        </Text>
    }
</View>
 
  )
}

export default Order