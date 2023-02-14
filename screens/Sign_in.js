import { ImageBackgroud, Alert, Button, TextInput, View} from 'react-native';
import React, {useState} from 'react';
import { useNavigation } from '@react-navigation/native';
import {StyleSheet, Image,TouchableOpacity, Text} from 'react-native';
import Tabs from '../navigation/Tabs';
import { Tab } from 'react-native-elements';
//import {Button} from 'native-base';
//import axios from 'axios';
  
export default function Sign_in() { 
    const[email, set_email] = useState('');
    const[password, set_password] = useState('');
    const[error, set_error] = useState('');
    const navigation = useNavigation(); 
    const handlePress = () =>{
       navigation.navigate('HomeScreen')
        console.log('shiva')
    }
    /*const handle_sign_in =async() => {
        try{
            const res = await axios.post('https://www.google.com/'
            ,{
                email,
                password,
            });
        }
        catch(err){
            set_error(err.message);
        }
    };*/
    return(
        <View style = {styles.container}>
            
            <Image style = {styles.img} source = {require("../assets/logo-black.png")}/>
            <TextInput style = {styles.inputcontainer}
            placeholder='Email'
            value={email}
            onChangeText = {set_email}
            autoCapitalize = "none"
            keyboardType='email-address'
            />
            <TextInput
            style = {styles.inputcontainer}
            placeholder='password'
            value={password}
            onChangeText = {set_password}
            secureTextEntry = {true}
            />
          
            <TouchableOpacity style = {styles.buttonContainer}
           onPress = {() => handlePress ()} >
             <Text style= {{ color:"#841584", fontSize: 25}}>Sign In</Text>   
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    img:{
        maxWidth: 200,
        maxHeight: 200,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'blue',
       
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#D0EDF6',
    },
    inputcontainer: {
       marginTop: 30,  
      width: 300,
      height: 44,
      padding: 10,
      borderWidth: 1,
      borderColor: 'black',
      marginBottom: 10,
    },
    
    
        input: {
            width: 200,
            height: 44,
            padding: 10,
            borderWidth: 1,
            borderColor: 'black',
            marginBottom: 10,
          },

    buttonContainer: {

        margin: 20,
        padding: 10,
        alignItems: 'center',
        width: 100,
        backgroundColor: 'blue',
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
  });