import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button } from "react-native";
import Header from "../components/header";
import moment from "moment";
import { AntDesign } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import Packets, { GetUserData } from "./packets";
import { ActivityIndicator } from "react-native";

let earningsMap = new Map();
let earningsSet = false;

const Earning = ({ navigation, route }) => {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);



  


  useEffect(() => {
    if (isFocused) {
      earningsMap = new Map();

      global.ws.onmessage = (response) => {
        const orderPacket = response.data;
        //console.log(orderPacket);
        console.log("Earnings got a packet back")
        if (Packets.getPacketType(orderPacket) === Packets.PacketTypes.SET_ALL_COMPLETED_ORDERS) {
          console.log("Earnings GOT COMPLETED ORDERS");
    
          const json_obj = JSON.parse(orderPacket);
          let allOrders = json_obj.data;
          
          for (var i = 0; i < allOrders.length; i++) {
            console.log(allOrders[i]);
            let date = new Date(allOrders[i].completed_date);
            date = moment(date).format("MM/DD");
            //console.log(date);
            if (!earningsMap.has(date)) {
              earningsMap.set(date, allOrders[i].deliveryPrice);
            } else {
              let oldPay = earningsMap.get(date);
              earningsMap.set(date, allOrders[i].deliveryPrice + oldPay);
            }
          }
          //console.log(...earningsMap.entries());
    
          //console.log(allOrders)
          
        }
        setLoading(false);
      };




      console.log("Earning about to send packet");
      // const GetAllCompletedOrders = new Packets.GetAllCompletedOrders();

      // console.log(packet);
      try {
        const packet = new Packets.GetAllCompletedOrders();
        global.ws.send(packet.toString());
        //console.log(packet.toString());
      } catch {
        alert("Connection error, check that you are connected to the internet");
      }
    } else {
      setLoading(true);
      console.log("Earning is not focused");
    }
  }, [isFocused]);

  

  

  // const username = route.params.username;
  // const { username } = route.params;

  const [week, setWeek] = useState(new Date());
  const [earnings, setEarnings] = useState({
    Sunday: null,
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
    Saturday: null,
  });

  let total = 0;
  for (let key in earnings) {
    total += earnings[key];
  }

  const startOfWeek = moment(week).startOf("week").format("MM/DD");
  const endOfWeek = moment(week).endOf("week").format("MM/DD");

  const getEarningsForWeek = (week) => {
    // logic to fetch earnings data for the given week
    const startOfWeek = new Date(
      week.getFullYear(),
      week.getMonth(),
      week.getDate() - week.getDay()
    );
    const endOfWeek = new Date(
      week.getFullYear(),
      week.getMonth(),
      week.getDate() - week.getDay() + 6
    );
    
    let sunday = moment(new Date(week.getFullYear(), week.getMonth(), week.getDate() - week.getDay())).format("MM/DD");
    let monday = moment(new Date(week.getFullYear(), week.getMonth(), week.getDate() - week.getDay() + 1)).format("MM/DD");
    let tuesday = moment(new Date(week.getFullYear(), week.getMonth(), week.getDate() - week.getDay() + 2)).format("MM/DD");
    let wednesday = moment(new Date(week.getFullYear(), week.getMonth(), week.getDate() - week.getDay() + 3)).format("MM/DD");
    let thursday = moment(new Date(week.getFullYear(), week.getMonth(), week.getDate() - week.getDay() + 4)).format("MM/DD");
    let friday = moment(new Date(week.getFullYear(), week.getMonth(), week.getDate() - week.getDay() + 5)).format("MM/DD");
    let saturday = moment(new Date(week.getFullYear(), week.getMonth(), week.getDate() - week.getDay() + 6)).format("MM/DD");

    setEarnings({
      Sunday: (earningsMap.has(sunday) ? earningsMap.get(sunday) : 0),
      Monday: (earningsMap.has(monday) ? earningsMap.get(monday) : 0),
      Tuesday: (earningsMap.has(tuesday) ? earningsMap.get(tuesday) : 0),
      Wednesday: (earningsMap.has(wednesday) ? earningsMap.get(wednesday) : 0),
      Thursday: (earningsMap.has(thursday) ? earningsMap.get(thursday) : 0),
      Friday: (earningsMap.has(friday) ? earningsMap.get(friday) : 0),
      Saturday: (earningsMap.has(saturday) ? earningsMap.get(saturday) : 0),
    });
  };

  const prevWeek = () => {
    const newWeek = new Date(week);
    newWeek.setDate(week.getDate() - 7);
    setWeek(newWeek);
    getEarningsForWeek(newWeek);
  };

  const nextWeek = () => {
    const newWeek = new Date(week);
    newWeek.setDate(week.getDate() + 7);

    const today = new Date();
    const nextWeekStart = new Date(
      newWeek.getFullYear(),
      newWeek.getMonth(),
      newWeek.getDate() - newWeek.getDay()
    );

    if (today >= nextWeekStart) {
      setWeek(newWeek);
      getEarningsForWeek(newWeek);
    }

    
  };
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  else if (!earningsSet) {
    getEarningsForWeek(week);
    earningsSet = true;
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header navigation={navigation} />
      </View>

      <View style={styles.content}>
        <View style={styles.earningHeader}>
          <TouchableOpacity onPress={prevWeek}>
            {/* <Text style={styles.arrow}>{"<"}</Text> */}
            <AntDesign name="leftcircleo" size={45} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}> {startOfWeek + " - " + endOfWeek}</Text>
          <TouchableOpacity onPress={nextWeek}>
            <AntDesign name="rightcircleo" size={45} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.earningsContainer}>
          {Object.keys(earnings).map((day) => (
            <View style={styles.earning} key={day}>
              <Text style={styles.day}>{day}</Text>
              <Text style={styles.amount}>${earnings[day]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.earning}>
          <Text style={styles.total}> Total </Text>
          <Text style={styles.amount}>${total}</Text>
        </View>
        <Text style={styles.amount}>
          {/* {week.getMonth() + 1 + "/" + week.getDate()} */}
        </Text>
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
  },

  header: {
    flex: 1,
    backgroundColor: "gray",
  },

  content: {
    flex: 7,
    backgroundColor: "lightblue",
    alignItems: "center",
    // justifyContent: "center",
    // height: "100%",
  },

  footer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
    // marginBottom: 36,
  },

  earningHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    padding: 20,
    // backgroundColor: "blue",
  },

  title: {
    fontSize: 20,
  },
  arrow: {
    fontSize: 30,
  },
  earningsContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    padding: 20,
  },
  earning: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 250,
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },

  day: {
    fontSize: 16,
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },

  total: {
    fontWeight: "bold",
    fontSize: 20,
  },
});

export default Earning;
