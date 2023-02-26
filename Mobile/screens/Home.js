import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Button,
  View,
  Platform,
} from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { SimpleLineIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Card } from "react-native-elements";
import * as Calendar from "expo-calendar";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { FlatList } from "react-native-gesture-handler";
//import Tabs from '../navigation/tabs.js';
import Orders from "../components/Orders";

const Home = (navigation, route) => {
  //   const navigation = useNavigation();
  //fake orders
  const orderData = [
    { id: 1, name: "Food" },
    { id: 2, name: "car" },
    { id: 3, name: "shoes" },
  ];
  //const for orders
  const [orders, setOrders] = useState(orderData);
  //creating a calendars for orders
  const handleEarning = () => {
    navigation.navigate("TodaysEarnings");
  };

  console.log("global.ws" + global.ws);

  //for body
  // function renderBody(){
  //     return(
  //         <View style = {{
  //             marginTop: '5%',
  //             width: '80%',
  //             alignItems:'center',
  //             height: '35%',
  //             backgroundColor: '#fdf6e4',
  //             borderRadius: '50%',
  //             marginBottom: '2%',
  //            }}>
  //             <View>
  //                 <Text style ={{
  //                     marginTop: '5%',
  //                     alignItems:'center',
  //                     fontSize:30,
  //                     }}>
  //                         Your Stats
  //             </Text>
  //             </View>
  //             <View >
  //                     <Text style = {{marginTop: '5%',paddingLeft: 40,fontSize:25}} >Earnings</Text>
  //                     <Text style = {{marginTop: '0%',fontSize:15, paddingTop: 5}} >See your today's earnings</Text>
  //                 </View>
  //             <View style = {styles.cardContainer}>

  //                     <TouchableOpacity style = {styles.last_trip}>
  //                         <Text style = {{textAlign: 'center'}}>Last Trips</Text>
  //                     </TouchableOpacity>
  //                     <TouchableOpacity style = {styles.today} onPress = {handleEarning}>
  //                         <Text style = {{textAlign: 'center'}}>Today</Text>
  //                         </TouchableOpacity>

  //             </View>
  //         </View>

  //     );
  // }
  //for header
  function renderHeader() {
    return (
      <View style={{ flexDirection: "row", height: 50, marginTop: "5%" }}>
        <TouchableOpacity
          style={{
            width: 50,
            paddingLeft: 20,
          }}
        >
          <SimpleLineIcons
            name="menu"
            size={30}
            resizeMode="contain"
            color="black"
          />
        </TouchableOpacity>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <View
            style={{
              width: "70%",
              height: "100%",
              backgroundColor: "#ACB5B1",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
            }}
          >
            <Text style={{}}>Ellensburg, Washington</Text>
          </View>
        </View>
        <TouchableOpacity
          style={{ width: 50, paddingRight: 20, justifyContent: "center" }}
        >
          <Ionicons name="notifications" size={30} />
        </TouchableOpacity>
      </View>
    );
  }
  //for orders
  function renderOrders() {
    return (
      <SafeAreaView
        style={{
          width: "100%",
          height: "100%",
          // /backgroundColor: 'black',
        }}
      >
        <View style={{ marginBottom: "1%", alignItems: "center" }}>
          <Text
            style={{
              alignItems: "center",
              fontSize: 30,
              justifyContent: "center",
            }}
          >
            Completed Orders
          </Text>
        </View>
        <ScrollView style={styles.scroll_container}>
          <Orders />
          <Orders />
          <Orders />
          <Orders />
          <Orders />
        </ScrollView>
        {/* 
            <TouchableOpacity
                
            >   
            <View 
              >
                <Image
                    source={require('../assets/orders.jpg')}
                    style ={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 20,
                    }}
                />
                <View
                    style ={{
                        position:'absolute',
                        bottom: 0,
                        height: 50,
                        width: '30%',
                        backgroundColor: 'white',
                        borderTopRightRadius: 5,
                        borderBottomLeftRadius: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                       
                    }}
                >
                    <Text>Order 1</Text>     
                </View>
            </View>
        </TouchableOpacity>

        <TouchableOpacity
        style={{
       
        }}
    >
     
    <View 
      >
        <Image
            source={require('../assets/orders.jpg')}
            style ={{
                width: '100%',
                height: '100%',
                borderRadius: 20,
            }}
        />
        <View
            style ={{
                position:'absolute',
                bottom: 0,
                height: 50,
                width: '30%',
                backgroundColor: 'white',
                borderTopRightRadius: 5,
                borderBottomLeftRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
               
            }}
        >
            <Text>Order 2</Text>     
        </View>
    </View>
     
    </TouchableOpacity>
    */}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.background}>
      {renderHeader()}
      {renderBody()}
      {renderOrders()}
    </SafeAreaView>
  );
};
export default Home;

///css
const styles = StyleSheet.create({
  background: {
    backgroundColor: "#D0EDF6",
    flex: 1,
    position: "relative",
    alignItems: "center",
  },
  last_trip: {
    marginLeft: "0%",
    width: "20%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 30,
    justifyContent: "center",
  },
  today: {
    width: "20%",
    height: "80%",
    backgroundColor: "white",
    marginLeft: "40%",
    borderRadius: 30,
    justifyContent: "center",
  },
  top: {
    /*
        flex: 'row',
        paddingLeft:30,
        marginTop: 50,
        //alignItems: 'center',
        textAlign: 'center',
        display: 'inline-block',*/
    marginTop: "5%",
    height: 100,
    width: "100%",
    borderRadius: 16,
    paddingTop: 20,
    // borderWidth: 8,
    borderColor: "#D0EDF6",
    flexDirection: "row",
  },
  button: {
    alignItems: "center",
    marginTop: 8,
    //justifyContent: 'center',

    backgroundColor: "white",
  },
  menu: {
    marginLeft: "5%",

    card_heading: {
      padding: 10,
    },
  },
  notification: {
    color: "black",
    marginLeft: "55%",
  },
  cardContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "20%",
    marginTop: "10%",
    backgroundColor: "#fdf6e4",
    opacity: 0.75,
    borderRadius: 10,
    flexDirection: "row",
  },
  card: {
    marginTop: "25%",
    height: "40%",
    position: "absolute",
    justifyContent: "center",
    width: "100%",
    //marginLeft: "5%",
    alignItems: "center",
    backgroundColor: "#fdf6e4",
    flexDirection: "row",
  },
  scroll_container: {
    marginTop: "5%",
    margin: "5%",

    //backgroundColor: 'black',
  },
});
