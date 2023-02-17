import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button } from "react-native";
//import AppNavigator from "../components/navigator";
import Header from "../components/header";
import Logout from "../components/Logout";

const Profile = ({ navigation, route }) => {
  const username = route.params.username;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header navigation={navigation} />
      </View>
      <Logout />
      <View style={styles.content}>
        <Text> {username}'s Profile Page</Text>
      </View>
      <View style={styles.footer}>
        {/*<AppNavigator navigation={navigation} username={username} />*/}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "lightblue",
  },

  header: {
    flex: 1,
    flexDirection: "row",
    // justifyContent: "center",
    // alignItems: "center",
    backgroundColor: "gray",
  },

  title: {
    marginTop: 40,
    color: "white",
    fontSize: 20,
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
  },
});

export default Profile;
