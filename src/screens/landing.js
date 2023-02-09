import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  TouchableOpacity,
} from "react-native";
import Login from "../component/login";
import Register from "../screens/register";

const Landing = ({ navigation }) => {
  const handleRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      <View style={styles.register}>
        <TouchableOpacity style={styles.regButton} onPress={handleRegister}>
          <Text style={styles.regText}>Register</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.login}>
        <Login navigation={navigation} />
      </View>
      <View style={styles.bottom}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  register: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  regButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "blue",
    borderRadius: 10,
    height: 50,
    width: 100,
    marginTop: 30,
  },

  regText: {
    color: "white",
  },

  login: {
    flex: 1,
  },
  bottom: {
    flex: 2,
  },
});

export default Landing;
