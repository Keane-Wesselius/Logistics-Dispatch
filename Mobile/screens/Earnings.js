import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button } from "react-native";
import Header from "../components/header";
import moment from "moment";
import { AntDesign } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import Packets, { GetUserData } from "./packets";
const Earning = ({ navigation, route }) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      console.log("Earning about to send packet");
      const GetAllCompletedOrders = new Packets.GetAllCompletedOrders();
      console.log(GetAllCompletedOrders);
      try {
        global.ws.send(GetAllCompletedOrders.toString());
      } catch {
        alert("Connection error, check that you are connected to the internet");
      }
    } else {
      console.log("Earning is not focused");
    }
  }, [isFocused]);

  global.ws.onmessage = (response) => {
    const packet = response.data;

    if (
      Packets.getPacketType(packet) ===
      Packets.PacketTypes.SET_ALL_COMPLETED_ORDERS
    ) {
      console.log("GOT COMPLETED ORDERS");

      const completed = JSON.parse(packet);
      console.log("completed : " + completed);
      console.log("pay : " + completed.data.price);

      //console.log(allOrders)
    }
  };

  // const username = route.params.username;
  // const { username } = route.params;

  const [week, setWeek] = useState(new Date());
  const [earnings, setEarnings] = useState({
    Sunday: 60,
    Monday: 30,
    Tuesday: 35,
    Wednesday: 40,
    Thursday: 45,
    Friday: 50,
    Saturday: 55,
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
          <Text style={styles.total}> total </Text>
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
