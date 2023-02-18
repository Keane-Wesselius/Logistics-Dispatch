import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Button,
  Modal,
} from "react-native";
//import AppNavigator from "../components/navigator";
import Header from "../components/header";
import Logout from "../components/Logout";

const Profile = ({ navigation, route }) => {
  const username = route.params.username;
  const [modalVisible, setModalVisible] = useState(false);

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
          <TouchableOpacity
            style={styles.showDelivery}
            onPress={() => setModalVisible(true)}
          >
            <Text>Deliveries: 23</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalText}>completed Deliveries</Text>
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
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
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },

  profilePic: {
    // flex: 1,
    borderRadius: 100,
    height: 200,
    width: 200,
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
  },

  below: {
    flex: 1,
    // backgroundColor: "#red",
    justifyContent: "center",
    alignItems: "center",
  },
  showDelivery: {
    padding: 20,
    backgroundColor: "#ddd",
    borderRadius: 5,
    width: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default Profile;
