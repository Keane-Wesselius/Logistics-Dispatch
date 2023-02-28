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
import orders_json from '../components/orders.json';
import Orders from '../components/Orders';

const Profile = ({ navigation, route }) => {

 // const username = route.params.username;
  const [modalVisible, setModalVisible] = useState(false);
  //counter to count number of completed deliveries
  let counter = 0;
  //getting completed orders
  //getting removeorder passed from Map after complete order is pressed
  const [removeOrder, setRemoveOrder] = useState(null);
  
  useEffect(() => {
    if(route.params && route.params.removeOrder){
      setRemoveOrder(route.params.removeOrder);
     }
     
  }, [route.params]);
  //console.log(removeOrder);

  const filteredOrders = orders_json.filter((order) => order.buyerId == removeOrder);

  let defaultProf = require("../assets/profile.png");

  const [hasPermission, setHasPermission] = useState();
  const [image, setImage] = useState(null);

  useEffect(() => {
    (async () => {
      const galleryStatus = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(galleryStatus.status === "granted");
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

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
          <Text style={styles.name}> First Last</Text>
          {/* <TouchableOpacity style={styles.edit} onPress={() => pickImage()}>
            <Text style={styles.editButton}>edit</Text>
          </TouchableOpacity> */}
        </View>

        <View style={styles.below}>
          <TouchableOpacity
            style={styles.showDelivery}
            onPress={() => setModalVisible(true)}
          >
            <Text>Deliveries: {counter}</Text>
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
          {/*<Text style={styles.modalText}>completed Deliveries</Text>
           {/**List of all orders with Order component 
           <View style = {styles.items}>
              {filteredOrders.map((order) => (
              <Orders 
              key={order.buyerId}
              buyerId={order.buyerId}
              shippingName={order.shippingName}
              shippingAddress={order.shippingAddress}
              shippingInfo={order.shippingInfo}
              shippingDate={order.shippingDate} 
              text = {'Order 1'}
            
              />
            
      ))}
      </View>
<<<<<<< Updated upstream
          <Button title="Close" onPress={() => setModalVisible(false)} /> */}
=======
          <Button title="Close" onPress={() => setModalVisible(false)} />
>>>>>>> Stashed changes
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D0EDF6"
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
    fontSize: 35,},
    
  items:{
    margin: '5%',
    width: '90%'
  },
});

export default Profile;
