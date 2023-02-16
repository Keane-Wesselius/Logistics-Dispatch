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
      <TouchableOpacity style={styles.buttons}>
        <Button
          color="blue"
          title="Logout"
          onPress={() =>
            navigation.navigate('BackgroundVideo')
          }
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "gray",
  },

  title: {
    marginRight: "24%",
    marginTop: 30,
    color: "white",
    fontSize: 20,
  },

  buttons: {
    backgroundColor: "white",
    borderRadius: 10,
    marginTop: 40,
    marginRight: 10,
  },
});

export default Header;