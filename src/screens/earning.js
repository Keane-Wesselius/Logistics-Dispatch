import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button } from "react-native";
import AppNavigator from "../component/navigator";
import Header from "../component/header";

const Earning = ({ navigation, route }) => {
  const username = route.params.username;
  // const { username } = route.params;
  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <View style={styles.content}>
        <Text> {username}'s Earning Page</Text>
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
  },

  content: {
    flex: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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

export default Earning;
