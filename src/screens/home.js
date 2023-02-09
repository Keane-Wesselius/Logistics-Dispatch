import React from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import AppNavigator from "../component/navigator";
import Header from "../component/header";

const Home = ({ navigation, route }) => {
  const username = route.params.username;

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <View style={styles.content}>
        <Text> {username}'s Home Page</Text>
      </View>
      <View style={styles.footer}>
        <AppNavigator navigation={navigation} username={username} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "lightblue",
  },

  content: {
    flex: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "light ",
  },

  footer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightyellow",
    // marginBottom: 36,
  },
});

export default Home;
