import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const Register = ({ navigation }) => {
  const [accType, setAccType] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    if (username && password) {
        navigation.navigate('HomeScreen')
    } else {
      alert("wrong input");
    }
  };

  return (
    <View style={styles.container}>
        <Text style = {styles.heading}>Create a New Account</Text>
      <View style={styles.accType}>
        <Text>Account Type</Text>
        <TextInput
          style={styles.input}
          value={accType}
          placeholder="Driver/Merchant/Supplier"
          onChangeText={setAccType}
        />
      </View>
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
    backgroundColor: '#D0EDF6',
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
    marginTop: '5%'
  },

  input: {
    width: 300,
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: "black",
    marginVertical: 10,
    borderRadius: 10
  },
  heading: {
    fontSize: 30,
    marginBottom: '5%', 
    fontWeight: 'bold'

  },
});

export default Register;