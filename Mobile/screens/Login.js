import { ImageBackgroud, Alert, Button, TextInput, View } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Image, TouchableOpacity, Text } from "react-native";
import Tabs from "../navigation/Tabs";
import { Tab } from "react-native-elements";
const Packets = require("./packets");
const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}\b/;

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

const Sign_in = ({ navigation, route }) => {
  // let ws = new WebSocket("ws://");
  // //onopen happens when the websocket connects
  // ws.onopen = () => { };
  // ws.onclose = () => console.log("ws closed");

  // //When we get an answer back this is called
  // //This function is called when we get an answer back from the server
  // //Due to a backend.js bug we will see the error message even if we are successfully signing into application
  // //Shiva or Galmo this is keane will one of you show me how to pass varibles between the different screens of the application
  // //we need to keep the same websocket
  // ws.onmessage = (response) => {
  // 	const packet = response.data;
  // 	console.log(packet);

  // 	if (
  // 		Packets.getPacketType(packet) ===
  // 		Packets.PacketTypes.AUTHENTICATION_SUCCESS
  // 	) {
  // 		const emailSplit = email.split("@");
  // 		const username = emailSplit[0];
  // 		navigation.replace("Home", { username });
  // 	} else if (
  // 		Packets.getPacketType(packet) ===
  // 		Packets.PacketTypes.AUTHENTICATION_FAILED
  // 	) {
  // 		alert("wrong username or password");
  // 	}
  // };

  // ws.onerror = (e) => {
  // 	console.error("WebSocket error:", e.message);
  // };

  // TODO: If WebSocket IP is incorrect or malformed IN ANY WAY, it will fully crash the app without any exception being thrown due to Java Exceptions not being catachable in JavaScript. This has been a known issue since 2015: https://github.com/facebook/react-native/issues/3346
  let ws = new WebSocket("ws://10.0.0.183:5005");
  global.ws = ws;

  //onopen happens when the websocket connects
  ws.onopen = () => {};
  ws.onclose = () => console.log("ws closed");

  //When we get an answer back this is called
  //This function is called when we get an answer back from the server
  //Due to a backend.js bug we will see the error message even if we are successfully signing into application
  //Shiva or Galmo this is keane will one of you show me how to pass varibles between the different screens of the application
  //we need to keep the same websocket
  global.ws.onmessage = (response) => {
    const packet = response.data;
    console.log(packet);

    if (
      Packets.getPacketType(packet) ===
      Packets.PacketTypes.AUTHENTICATION_SUCCESS
    ) {
      // const emailSplit = email.split("@");
      // const username = emailSplit[0];
      const username = "TEST";
      global.navigation.replace("Home", { username });
    } else if (
      Packets.getPacketType(packet) ===
      Packets.PacketTypes.AUTHENTICATION_FAILED
    ) {
      // email: robots@gmail.com
      // pass: pickles
      //if(getScreenName() == "Login") {
      const loginPacket =
        Packets.AuthenticationFailedPacket.fromJSONString(packet);

      // TODO: Clear password / email field
      alert(loginPacket.errorMessage);
      //}
    }
  };

  ws.onerror = (e) => {
    console.error("WebSocket error:", e.message);
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [email, set_email] = useState("");

  const handleLogin = () => {
    //We create a packet to send to the backend using the username and password entered on the screen
    if (emailPattern.test(email)) {
      const loginPacket = new Packets.LoginPacket(email, password);
      console.log("Login Packet String: " + loginPacket.toString());
      try {
        global.ws.send(loginPacket.toString());
      } catch (error) {
        alert("Connection error, check that you are connected to the internet");

        //navigation.navigate("Home");
        //console.log("shiva");
      }
    } else {
      alert("Invalid email");
    }
  };

  const handleSignup = () => {
    navigation.navigate("Signup");
  };
  return (
    <View style={styles.loginContainer}>
      <Image style={styles.img} source={require("../assets/logo-black.png")} />
      {/* <TextInput
        style={styles.inputcontainer}
        //placeholder='Email'
        value={email}
        onChangeText={set_email}
        autoCapitalize="none"
        keyboardType="email-address"
      /> */}

      <View style={styles.email}>
        <Text>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          placeholder="email"
          onChangeText={setEmail}
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
    //borderWidth: 2,
   // borderColor: "blue",
  },
});

export default Sign_in;
