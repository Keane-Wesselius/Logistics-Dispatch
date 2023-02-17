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
      <TouchableOpacity style={styles.buttons}>
        <Button
          color="blue"
          title="Logout"
          onPress={() => navigation.navigate("Landing")}
        />
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
    borderRadius: 10,
    height: 40,
  },
});

export default Logout;
