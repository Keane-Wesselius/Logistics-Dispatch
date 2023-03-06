import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}\b/;

const Packets = require("./packets");

const Signup = ({ navigation }) => {
  //Replace websocket IP with the IP of the machine running Backend.js
  //   let ws = new WebSocket("ws://10.0.0.183:5005/");

  //   ws.onopen = () => {};
  //   ws.onclose = () => console.log("ws closed: Signup page");

  global.ws.onmessage = (response) => {
    const packet = response.data;
    console.log(packet);

    if (
      Packets.getPacketType(packet) ===
      Packets.PacketTypes.ACCOUNT_CREATE_SUCCESS
    ) {
      alert("Account created successfully, returning to login");
      navigation.navigate("Login");
    } else if (
      Packets.getPacketType(packet) ===
      Packets.PacketTypes.ACCOUNT_CREATE_FAILED
    ) {
      alert("Error creating account");
    }
  };

  global.ws.onerror = (e) => {
    console.error("WebSocket error: ", e.message);
  };

  const accType = "driver";
  const [firstName, setFirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    if (password == confirmPassword) {
      //THERE IS NO DATA FOR PROFILE PICTURE BEING SENT TO BACKEND
      //SHOULD WE JUST STORE THE PROFILE PICTURE ON THE DEVICE?
      if (emailPattern.test(email)) {

          if (firstName != "" && lastName != "" && password != "")
        {
          const accountPacket = new Packets.CreateDriverAccountPacket(
            firstName,
            lastName,
            email,
            password,
            accType
          );
          console.log("Account create string: " + accountPacket.toString());
          try {
            global.ws.send(accountPacket.toString());
          } catch (error) {
            alert("Connection error, check that you are connected to the internet");
          }
        }
        else{
          alert("Must fill out all the fields");
        }
        
        

      }
      else{
        alert("Invalid email address");
      }
    } 
    else {
      alert("Error: passwords do not match");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create a New Account</Text>

      <View style={styles.name}>
        <Text>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          placeholder="name"
          onChangeText={setFirstName}
        />
      </View>

      <View style={styles.name}>
        <Text>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          placeholder="name"
          onChangeText={setlastName}
        />
      </View>

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
      <View style={styles.confirmPassword}>
        <Text>confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>
      <View>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.submit}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D0EDF6",
  },

  submit: {
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
  heading: {
    fontSize: 30,
    marginBottom: "5%",
    fontWeight: "bold",
  },
});

export default Signup;
