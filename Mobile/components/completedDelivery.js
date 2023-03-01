import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Orders from "../components/Orders";
import {
  Collapse,
  CollapseHeader,
  CollapseBody,
} from "accordion-collapse-react-native";
import Packets, { GetAllCompletedOrders } from "../screens/packets";
import { ActivityIndicator } from 'react-native';

let allOrders = [];

function CompletedDelivery() {
  let data = null;
  const [loading, setLoading] = useState(true);
  try {
    const Packet = new Packets.GetAllCompletedOrders();
    //console.log(Packet);
    global.ws.send(Packet.toString());
  } catch (error) {
    alert("Connection error, check that you are connected to the internet");
  }

  global.ws.onmessage = (response) => {
    console.log("Got a packet");
    const packet = response.data;
    //console.log(packet);

    if (
      Packets.getPacketType(packet) ===
      Packets.PacketTypes.SET_ALL_COMPLETED_ORDERS
    ) {
      //console.log("packet: " + packet);
      const json_obj = JSON.parse(packet);
      //console.log(json_obj);

      allOrders = json_obj.data;
      setLoading(false);
    }
  };

  console.log(allOrders);

  // data = {
  //   orders: [
  //     {
  //       order_id: "1234",
  //       date: "2023-02-14",
  //       earning: 25.99,
  //       payment_method: "credit_card",
  //       supplier: "supplier 1",
  //       merchant: "merchant 1",
  //     },
  //     {
  //       order_id: "5678",
  //       date: "2023-02-15",
  //       earning: 19.99,
  //       payment_method: "cash",
  //       supplier: "supplier 2",
  //       merchant: "merchant 2",
  //     },
  //     {
  //       order_id: "9012",
  //       date: "2023-02-16",
  //       earning: 32.5,
  //       payment_method: "debit_card",
  //       supplier: "supplier 3",
  //       merchant: "merchant 3",
  //     },
  //     {
  //       order_id: "3456",
  //       date: "2023-02-17",
  //       earning: 42.99,
  //       payment_method: "credit_card",
  //       supplier: "supplier 4",
  //       merchant: "merchant 4",
  //     },
  //     {
  //       order_id: "7890",
  //       date: "2023-02-16",
  //       earning: 28.75,
  //       supplier: "supplier 5",
  //       merchant: "merchant 5",
  //     },
  //   ],
  // };
  let orders = [];
  if (data != null) {
    orders = data;
  }

  const [activeSections, setActiveSections] = useState([]);

  const toggleSection = (section) => {
    let active = activeSections;
    if (active.includes(section)) {
      active.splice(active.indexOf(section), 1);
    } else {
      active.push(section);
    }
    setActiveSections([...active]);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView style={styles.container}>
      {allOrders.map((order) => {
        return (
          <Collapse
            key={order._id}
            isCollapsed={!activeSections.includes(order._id)}
            onToggle={() => toggleSection(order._id)}
          >
            <CollapseHeader>
              <View style={styles.order}>
                {/* <View> */}
                <Text style={styles.each}>Date: {order.completed_date}</Text>
                <Text style={styles.each}>Earning: ${order.totalCost}</Text>
                {/* </View> */}
              </View>
            </CollapseHeader>

            <CollapseBody>
              <View style={styles.orderDetails}>
                {/* <View> */}
                <Text style={styles.each}>Order ID: {order.driverId}</Text>

                <Text style={styles.each}>Supplier: {order.supplierId}</Text>
                {/*<Text style={styles.each}>merchant: {order.}</Text>*/}
              </View>
            </CollapseBody>
          </Collapse>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightblue",
    padding: 10,
  },

  order: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 5,
    padding: 10,
    backgroundColor: "#ffff",
    borderRadius: 15,
  },

  each: {
    paddingVertical: 5,
    fontSize: 14,
  },

  accordion: {
    backgroundColor: "white",
    marginVertical: 5,
    borderRadius: 10,
    overflow: "hidden",
  },

  accordionHeader: {
    // flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },

  accordionHeaderText: {
    // flexDirection: "row",
    flex: 1,
    fontSize: 16,
  },

  accordionBody: {
    padding: 10,
  },

  accordionBodyText: {
    fontSize: 14,
  },
  orderDetails: {
    // backgroundColor: "lightblue",
    padding: 10,
    marginLeft: 20,
    borderRadius: 15,
  },
});

export default CompletedDelivery;
