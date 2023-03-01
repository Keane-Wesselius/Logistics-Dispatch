import React from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const Header = () => {
  const navigation = useNavigation();
  const route = useRoute();
  let page = route.name;
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{page}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "silver",
  },

  title: {
    // marginRight: "24%",
    marginTop: 40,
    color: "white",
    fontSize: 25,
  },
});

export default Header;
