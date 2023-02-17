import { ImageBackgroud, Alert, Button, TextInput, View } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Image, TouchableOpacity, Text } from "react-native";
import Tabs from "../navigation/Tabs";
import { Tab } from "react-native-elements";
//import {Button} from 'native-base';
//import axios from 'axios';
/*  
export default function Sign_in() { 
    const[email, set_email] = useState('');
    const[password, set_password] = useState('');
    const[error, set_error] = useState('');
    const navigation = useNavigation(); 
    const handlePress = () =>{
       navigation.navigate('Home')
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
    };
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
 */

const Sign_in = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const [email, set_email] = useState("");
  const handleLogin = () => {
    if (username && password) {
      navigation.replace("Home", { username });
    } else {
      alert("wrong username or password");
    }
  };

  const handleSignup = () => {
    navigation.navigate("Signup");
  };
  return (
    <View style={styles.loginContainer}>
      {/* <Image style={styles.img} source={require("../assets/logo-black.png")} /> */}
      {/* <TextInput
        style={styles.inputcontainer}
        //placeholder='Email'
        value={email}
        onChangeText={set_email}
        autoCapitalize="none"
        keyboardType="email-address"
      /> */}

      <View style={styles.username}>
        <Text>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          placeholder="username"
          onChangeText={setUsername}
        />
      </View>
      <View style={styles.password}>
        <Text>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.login}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.login}>Create A New Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D0EDF6",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },

  login: {
    color: "white",
  },

  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
    borderRadius: 10,
    height: 50,
    width: 200,
    marginTop: "5%",
  },

  username: {
    flexDirection: "column",
  },

  input: {
    width: 300,
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: "black",
    marginVertical: 10,
    borderRadius: 10,
  },
  img: {
    maxWidth: 200,
    maxHeight: 200,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "blue",
  },
});

export default Sign_in;
