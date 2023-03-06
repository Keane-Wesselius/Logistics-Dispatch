import { Dimensions, StyleSheet,Button, Text, View,Modal, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Gesture, GestureDetector, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AntDesign } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native';
//import OrderList from '../screens/OrderList';
import SignatureScreen from 'react-native-signature-canvas';
import * as FileSystem from  'expo-file-system';
//import Map from '../screens/Map';
const {height: SCREEN_HEIGHT} = Dimensions.get('window');
import Packets, { Status } from "./packets";

const BottomSheet = (props) => {
    const [modalVisible, setModalVisible] = useState(false);
    //ref for signature
    const signatureRef = useRef(null);
    const scrollViewRef = useRef();
    const [isSigning, setIsSigning] = useState(false);
    // navigation to orderlist screen when pressed cancel order
    const navigation = useNavigation();
    const handlePress = () =>{

        global.ws.onmessage = (response) => {
            const packet = response.data;
            
            if (Packets.getPacketType(packet) === Packets.PacketTypes.UPDATE_ORDER_STATUS_SUCCESS) {
                console.log("Order confirmed");
          
                navigation.navigate('OrdersList', {
                })
                props.clearDeliveryAddress();
    
            }

            else {
                alert("Unable to cancel order");
                props.clearDeliveryAddress();
            }
        };


        console.log('Trying to cancel order');
      const acceptPacket = new Packets.UpdateOrderStatus(props.orderId, Status.CONFIRMED);
      console.log(acceptPacket);
      try{
	    global.ws.send(acceptPacket.toString());
      }
      catch
      {
        alert("Connection error, check that you are connected to the internet");
      }


      //props.clearDeliveryAddress();
        
        
    }
    //getting order id:
    //console.log("orderId:", props.orderId);


    
    /*
    const handleStartSigning = () => {
        setIsSigning(true);
        scrollViewRef.current.setNativeProps({ scrollEnabled: false });
    };

    const handleStopSigning = () => {
        setIsSigning(false);
        scrollViewRef.current.setNativeProps({ scrollEnabled: true });
    };
     */  
     // Called after ref.current.readSignature() reads a non-empty base64 string
  const handleOK = (signature) => {
    console.log(signature);
    onOK(signature); // Callback from Component props
  };

  // Called after ref.current.readSignature() reads an empty string
  const handleEmpty = () => {
    console.log("Empty");
  };

  // Called after ref.current.clearSignature()
  const handleClear = () => {
    console.log("clear success!");
  };

  // Called after end of stroke
  const handleEnd = () => {
    signatureRef.current.readSignature();
    //console.log(  signatureRef.current.readSignature())
  };

  // Called after ref.current.getData()
  const handleData = (data) => {
    console.log(data);
  };  

    
    const saveSignature = () =>{
      
        try {
            console.log('About to confirm order');
            //console.log(props.orderId);
            const ConfirmOrderPacket = new Packets.UpdateOrderStatus(props.orderId, Status.COMPLETED);
            //console.log(getAllConfirmedOrdersPacket);
            
	        global.ws.send(ConfirmOrderPacket.toString());
      
           
            //console.log('Signature saved:', signatureUri);
  
            // Clear the signature canvas
            //signatureRef.current.clearSignature();
            console.log('Signature saved:');
            navigation.navigate('Profile', {
            })
            props.clearDeliveryAddress();
           

        } catch (error) {
            console.error("Error saving signature: ", error);
            props.clearDeliveryAddress();
        }
        
    }
    // indexes for opening and closing div when pressed button    
    const[currentIndex, setCurrentIndex] = useState(false);
    const[currentSign, setCurrentSign] = useState(false);
          
   


    return (
        <View style ={styles.bottomSheetContainer_2}>
            <TouchableOpacity style ={styles.blackButton} activeOpacity ={0.7} pointerEvents = 'box-none'
                onPress={() => setModalVisible(true)}        
                >
                <Text style = {{color: 'white', fontSize: 20}}> Complete/Cancel Delivery</Text>
                <AntDesign name="arrowup" size={24} color="white" />
            </TouchableOpacity>

        
            <Modal  
                visible={modalVisible}
                animationType= 'slide'
                transparent = {true}
             >
            <View  style={styles.modalContainer}>
            <View style={styles.modalContent}>
            <View style = {{ height: '100%', width: '100%', flexDirection: 'column'}}>
                    <TouchableOpacity style ={styles.blackButton} activeOpacity ={0.7} pointerEvents = 'box-none'
                    onPress = {()=>{
                        if (currentIndex == false)
                            setCurrentIndex(true)
                        else
                            setCurrentIndex(false)
                        }}
                    >
                    <Text style = {{color: 'white', fontSize: 20}}> Complete Delivery</Text>
                    <AntDesign name="arrowdown" size={24} color="white" />
                    </TouchableOpacity>
                    {currentIndex == true && 
                        <View style ={{ 
                            marginTop: '5%', 
                            width: '100%',
                            height: '15%', 
                            //backgroundColor: 'pink', 
                            flexDirection: 'row',
                            justifyContent: 'space-evenly',
                            }}>
                            <TouchableOpacity
                            style ={{
                                width: 100,
                                backgroundColor: '#D0EDF6',
                                borderRadius: 20,
                                justifyContent: 'center',
                                alignContent: 'center', 
                            }}
                            onPress = {()=>{
                                if (currentSign== false)
                                    setCurrentSign(true)
                                else
                                    setCurrentSign(false)
                                }}
                            >
                                <Text 
                                style = {{
                                    alignSelf: 'center',
                                    fontSize: 15
                                }}
                                >Sign Off package</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                            style ={{
                                width: 100,
                                backgroundColor: '#D0EDF6',
                                borderRadius: 20,
                                justifyContent: 'center',
                                alignContent: 'center', 
                            }}
                            onPress = {saveSignature}
                            >
                                <Text
                                style = {{
                                    alignSelf: 'center', 
                                    fontSize: 15

                                }}
                                > Left on the door</Text>
                            </TouchableOpacity>
                            
                            </View>
                        }
                        {currentSign == true && 
                            <View style = {{ height: '30%', width: '80%', alignSelf: 'center'}}>
                            
                            <SignatureScreen
                            ref = {signatureRef}
                            //onEnd={handleEnd}
                            onOK={saveSignature}
                            onEmpty={handleEmpty}
                            onClear={handleClear}
                            onGetData={handleData}
                            //onEmpty = {()=>console.log('empty')}
                            descriptionText = 'Sign off'
                            clearText = "clear"
                            confirmText = "save"
                            style = {styles.signature}
                            autoClear = {true}
                            //onStartSigning={handleStartSigning}
                            //onStopSigning={handleStopSigning}
                        />
                        
                        <View style = {{flexDirection: 'row', justifyContent: 'space-around'}}>
                        <Button title="Clear" onPress={()=>{signatureRef.current.clearSignature()}} />
                        <Button title="Save" onPress={saveSignature} /> 
                        </View>
                        </View>
                    }   
                
                <TouchableOpacity style ={styles.blackButton} activeOpacity ={0.7} pointerEvents = 'box-none'
                onPress={handlePress} >
                    <Text style = {{color: 'white', fontSize: 20}}> Cancel Delivery</Text>
                    <AntDesign name="arrowdown" size={24} color="white" />
                </TouchableOpacity>
                    
                
            </View>
            
            </View>
            
            
            </View>
            <TouchableOpacity  style ={[styles.blackButton, {backgroundColor: 'red'}]} activeOpacity ={0.7} pointerEvents = 'box-none'
                onPress={() => setModalVisible(false)}    
                >
                    <Text style = {{color: 'white', fontSize: 20}}> Close</Text>
                    <AntDesign name="arrowdown" size={24} color="white" />
                </TouchableOpacity>
            </Modal>
        </View>
    );
    /**
  return ( 
    <GestureDetector  gesture = {gesture}>
    <Animated.View  style ={[styles.bottomSheetContainer, rBottomSheetStyle]}> 
        <View style = {styles.line} >

        </View>
        <View style = {{ height: '100%', width: '100%', flexDirection: 'column'}}>
            <TouchableOpacity style ={styles.blackButton} activeOpacity ={0.7} pointerEvents = 'box-none'
             onPress = {()=>{
                if (currentIndex == false)
                    setCurrentIndex(true)
                else
                    setCurrentIndex(false)
                }}
             >
            <Text style = {{color: 'white', fontSize: 20}}> Complete Delivery</Text>
            <AntDesign name="arrowright" size={24} color="white" />
             </TouchableOpacity>

        
        <TouchableOpacity style ={styles.blackButton} activeOpacity ={0.7} pointerEvents = 'box-none'
        onPress={handlePress} >
            <Text style = {{color: 'white', fontSize: 20}}> Cancel Delivery</Text>
            <AntDesign name="arrowright" size={24} color="white" />
        </TouchableOpacity>

        {currentIndex == true && 
        <View style ={{ 
            marginTop: '5%', 
            width: '100%',
            height: '15%', 
            //backgroundColor: 'pink', 
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            }}>
            <TouchableOpacity
            style ={{
                width: 100,
                backgroundColor: '#D0EDF6',
                borderRadius: 20,
                justifyContent: 'center',
                alignContent: 'center', 
            }}
            onPress = {()=>{
                if (currentSign== false)
                    setCurrentSign(true)
                else
                    setCurrentSign(false)
                }}
            >
                <Text 
                style = {{
                    alignSelf: 'center',
                    fontSize: 15
                }}
                >Sign Off package</Text>
            </TouchableOpacity>

            <TouchableOpacity
             style ={{
                width: 100,
                backgroundColor: '#D0EDF6',
                borderRadius: 20,
                justifyContent: 'center',
                alignContent: 'center', 
            }}
            >
                <Text
                 style = {{
                    alignSelf: 'center', 
                    fontSize: 15

                }}
                > Left on the door</Text>
            </TouchableOpacity>
            
        </View>
        
        }
        {currentSign == true && 
            <View style = {{ height: '30%', width: '80%', alignSelf: 'center'}}>
            
            <SignatureScreen
            ref = {signatureRef}
            onEmpty = {()=>console.log('empty')}
            descriptionText = 'Sign off'
            clearText = "clear"
            confirmText = "save"
            style = {styles.signature}
            autoClear = {true}
            //onStartSigning={handleStartSigning}
            //onStopSigning={handleStopSigning}
        />
        
        <View style = {{flexDirection: 'row', justifyContent: 'space-around'}}>
        <Button title="Clear" onPress={()=>{signatureRef.current.clearSignature()}} />
        <Button title="Save" onPress={saveSignature} /> 
        </View>
        </View>
        }
        </View>
      
   </Animated.View>
    </GestureDetector>
    
  )
   */
}

export default BottomSheet

const styles = StyleSheet.create({
    bottomSheetContainer: {
        width: '100%',
        height: SCREEN_HEIGHT/1.5,
        backgroundColor: 'white',
        //position: 'absolute',
        borderRadius: 50,
        //top: SCREEN_HEIGHT,
        backgroundColor:  "#fdf6e4",
    },
    bottomSheetContainer_2: {
        width: '100%',
        height: SCREEN_HEIGHT/4,
        //backgroundColor: 'white',
        //position: 'absolute',
        borderRadius: 50,
        //top: SCREEN_HEIGHT,
        backgroundColor:  "#fdf6e4",
    },

    line:{
        width: 100,
        height: 4,
        backgroundColor: 'grey',
        alignSelf: 'center',
        marginVertical: 15,
        borderRadius:2,
    },
    blackButton:{
        backgroundColor: 'black',
        //position: 'absolute',
        marginTop: '5%',
        height: 50,
        width: '80%', 
        alignItems: 'center', 
        justifyContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        borderRadius: 10,
    },
    signature: {
        width: '100%',
        height: '100%',
        borderWidth: 1,
        //height: '20%',
        //backgroundColor: 'red',
        marginTop: '5%',
        //alignSelf: 'center',
      
         },
         modalContainer: {
            flex: 1,
            //justifyContent: 'flex-end',
            //alignItems: 'center',
            //marginBottom: 50,
            //height: '50%',
            //backgroundColor:  "white",
            //opacity: 0.95,
          },
          modalContent: {
            //height: '50%',
            width: '100%',
            //marginTop: '80%',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            alignItems: 'center',
            backgroundColor:  "#fdf6e4",
            //opacity: 1,
          

          },

})