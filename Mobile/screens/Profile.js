import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Button,
} from "react-native";
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
        <View style={styles.profile}>
          <Image
            style={styles.profilePic}
            source={require("../assets/profile.png")}
          />
          <Text style={styles.name}> First Last</Text>
          <TouchableOpacity style={styles.edit}>
            <Text style={styles.editButton}>edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.below}>
          <Text>Total Deliveries: 23</Text>
        </View>
      </View>
      {/* <View style={styles.footer}>
        <AppNavigator navigation={navigation} username={username} />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "gold",
  },

  header: {
    flex: 1,
    // flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "gray",
  },

  content: {
    flex: 9,
    // flexDirection: "row",
    // justifyContent: "center",
    // alignItems: "center",
    // backgroundColor: "brown",
  },

  profile: {
    flex: 1,
    backgroundColor: "lightblue",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "20%",
  },

  profilePic: {
    // flex: 1,
    borderRadius: "120%",
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
  },

  below: {
    flex: 1,
    // backgroundColor: "#red",
  },
});

export default Profile;
