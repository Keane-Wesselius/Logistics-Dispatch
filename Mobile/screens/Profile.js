import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import Header from "../components/header";
import Logout from "../components/Logout";
import CompletedDelivery from "../components/completedDelivery";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Packets, { GetUserData } from "./packets";
import { useIsFocused } from "@react-navigation/native";
import { ActivityIndicator } from 'react-native';

let firstName = "";
let lastName = "";
const Profile = ({ navigation, route }) => {
  const isFocused = useIsFocused();
  const [user, setUser] = useState("");
  useEffect(() => {
    if (isFocused) {
      console.log("Profile about to send packet");
      // const getAllConfirmedOrdersPacket = new Packets.GetAllConfirmedOrders();
      // console.log(getAllConfirmedOrdersPacket);
      try {
        global.ws.send(new GetUserData().toString());
      } catch {
        alert("Connection error, check that you are connected to the internet");
      }
    } else {
      console.log("profile is not focused");
    }
  }, [isFocused]);

  global.ws.onmessage = (response) => {
    const packet = response.data;

    if (Packets.getPacketType(packet) === Packets.PacketTypes.SET_USER_DATA) {
      console.log("\nGot profile data");
      let user = JSON.parse(packet);

      user = user.data;
      
      firstName = user.firstName;
      lastName = user.lastName;
      console.log("data: " + user.firstName);
      console.log("last: " + user.lastName);
      console.log("email here: " + user.email);
      setUser(user);
    }
  };

  console.log("first name: " + firstName);
  console.log("last name: " + lastName);
  // console.log(user.data.email);
  // console.log(user.data.lastName);
  // const username = route.params.username;
  const [modalVisible, setModalVisible] = useState(false);

  let defaultProf = require("../assets/profile.png");

  const [hasPermission, setHasPermission] = useState();
  const [image, setImage] = useState(null);

  useEffect(() => {
    (async () => {
      const galleryStatus = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(galleryStatus.status === "granted");
    })();
  }, []);

  //base64 is just the image not the filepath
  //Dont upload 
  //pass the whole result
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      //base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  if (user == "") {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header navigation={navigation} />
      </View>
      <Logout />
      <View style={styles.content}>
        <View style={styles.profile}>
          <TouchableOpacity
            style={styles.editProfile}
            onPress={() => pickImage()}
          >
            {
              <Image
                source={image ? { uri: image } : defaultProf}
                style={styles.profilePic}
              />
            }
          </TouchableOpacity>
          <Text style={styles.name}>
            {firstName} {lastName}
          </Text>
          {/* {user.data.email} */}
          {/* <TouchableOpacity style={styles.edit} onPress={() => pickImage()}>
            <Text style={styles.editButton}>edit</Text>
          </TouchableOpacity> */}
        </View>

        <View style={styles.below}>
          <TouchableOpacity
            style={styles.showDelivery}
            onPress={() => setModalVisible(true)}
          >
            <Text>Deliveries: 0</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalTitle}>
            <Text style={styles.modalTitleText}>Completed Deliveries</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            title="Close"
            onPress={() => setModalVisible(false)}
          >
            {/* <Text style={styles.closeText}>x</Text> */}
            <View style={styles.closeText}>
              <AntDesign name="close" size={44} color="darkblue" />
            </View>
          </TouchableOpacity>

          <CompletedDelivery />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "silver",
  },

  content: {
    flex: 9,
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
    backgroundColor: "lightblue",
    // alignItems: "center",
    // justifyContent: "center",
    backgroundColor: "#D0EDF6",
  },
  modalText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  modalTitle: {
    flex: 0.13,
    backgroundColor: "silver",
    alignItems: "center",
  },

  modalTitleText: {
    fontSize: 23,
    marginTop: 40,
  },

  closeButton: {
    alignItems: "flex-end",
  },

  closeText: {
    color: "darkblue",
    paddingRight: 10,
    fontSize: 35,
  },

  items: {
    margin: "5%",
    width: "90%",
  },
});

export default Profile;
