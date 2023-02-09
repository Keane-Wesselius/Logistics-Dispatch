import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const AppNavigator = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const username = route.params?.username;
  const { name: currentScreen } = route;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, currentScreen === "Home" && styles.selectedTab]}
        onPress={() => navigation.navigate("Home", { username })}
      >
        <Text
          style={[styles.text, currentScreen === "Home" && styles.selectedText]}
        >
          Home
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, currentScreen === "Earning" && styles.selectedTab]}
        onPress={() => navigation.navigate("Earning", { username })}
      >
        <Text
          style={[
            styles.text,
            currentScreen === "Earning" && styles.selectedText,
          ]}
        >
          Earning
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, currentScreen === "Delivery" && styles.selectedTab]}
        onPress={() => navigation.navigate("Delivery", { username })}
      >
        <Text
          style={[
            styles.text,
            currentScreen === "Delivery" && styles.selectedText,
          ]}
        >
          Delivery
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, currentScreen === "Profile" && styles.selectedTab]}
        onPress={() => navigation.navigate("Profile", { username })}
      >
        <Text
          style={[
            styles.text,
            currentScreen === "Profile" && styles.selectedText,
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "gray",
    height: "100%",
    position: "absolute",
    width: "100%",
  },
  tab: {
    alignItems: "center",
  },
  text: {
    fontSize: 18,
  },
  selectedTab: {
    backgroundColor: "blue",
    borderRadius: 3,
    padding: 5,
  },

  selectedText: {
    color: "white",
  },
});

export default AppNavigator;
