import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const Packets = require ("./packets");

const Signup = ({ navigation }) => {
  //Replace websocket IP with the IP of the machine running Backend.js
  let ws = new WebSocket("ws://10.0.0.183:5005/");

  ws.onopen = () => {};
  ws.onclose = () => console.log("ws closed: Signup page");

  ws.onmessage = (response) => {
    const packet = response.data;
    console.log(packet);

    if (Packets.getPacketType(packet) === Packets.PacketTypes.ACCOUNT_CREATE_SUCCESS) {
      alert("Account created successfully, returning to login")
      navigation.navigate("Login");
    } else if (Packets.getPacketType(packet) === Packets.PacketTypes.ACCOUNT_CREATE_FAILED) {
      alert("Error creating account");
    }
  };

  ws.onerror = (e) => {
    console.error("WebSocket error: ", e.message);
  };

  const accType = "Driver";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    if (password == confirmPassword) {
      const accountPacket = new Packets.CreateAccountPacket(name, email, password, accType);
      console.log("Account create string: " + accountPacket.toString());

      ws.send(accountPacket.toString());
    } else {
      alert("Error: passwords do not match");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create a New Account</Text>

      <View style={styles.name}>
        <Text>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          placeholder="name"
          onChangeText={setName}
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
