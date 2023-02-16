import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button } from "react-native";
import AppNavigator from "../component/navigator";
import Header from "../component/header";

const Earning = ({ navigation, route }) => {
  const username = route.params.username;
  // const { username } = route.params;

  const [week, setWeek] = useState(new Date());
  const [earnings, setEarnings] = useState({
    Monday: 30,
    Tuesday: 35,
    Wednesday: 40,
    Thursday: 45,
    Friday: 50,
    Saturday: 55,
    Sunday: 60,
  });

  const getEarningsForWeek = (week) => {
    // logic to fetch earnings data for the given week
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
    setWeek(newWeek);
    getEarningsForWeek(newWeek);
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <View style={styles.content}>
        <View style={styles.earningHeader}>
          <TouchableOpacity onPress={prevWeek}>
            <Text style={styles.arrow}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.title}> Week x</Text>
          <TouchableOpacity onPress={nextWeek}>
            <Text style={styles.arrow}>{">"}</Text>
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
          <Text style={styles.total}>total</Text>
          <Text style={styles.amount}>$920</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <AppNavigator navigation={navigation} username={username} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  footer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightyellow",
    // marginBottom: 36,
  },
  content: {
    flex: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    // justifyContent: "center",
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

    // backgroundColor: "gray",
    marginBottom: 10,
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
