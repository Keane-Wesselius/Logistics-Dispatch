import React from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const Logout = () => {
  const navigation = useNavigation();
  //   const route = useRoute();
  //   let page = route.name;

  //   const handleLogout = () => {
  //     // Reset the navigation history and set Landing as the new root screen
  //     navigation.reset({
  //       index: 0,
  //       routes: [{ name: "Landing" }],
  //     });
  // };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.buttons}
        onPress={() => navigation.navigate("Landing")}
      >
        <Text
          // color="blue"
          // title="Logout"
          style={styles.textButtons}
        >
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    flexDirection: "row",
    // alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "gray",
    // height: 100,
  },

  buttons: {
    backgroundColor: "white",
    height: 40,
    borderRadius: 10,
  },
  textButtons: {
    color: "blue",
    height: 40,
    padding: 10,
  },
});

export default Logout;
