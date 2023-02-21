import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  Collapse,
  CollapseHeader,
  CollapseBody,
} from "accordion-collapse-react-native";

function CompletedDelivery() {
  const data = {
    orders: [
      {
        order_id: "1234",
        date: "2023-02-14",
        earning: 25.99,
        payment_method: "credit_card",
        supplier: "supplier 1",
        merchant: "merchant 1",
      },
      {
        order_id: "5678",
        date: "2023-02-15",
        earning: 19.99,
        payment_method: "cash",
        supplier: "supplier 2",
        merchant: "merchant 2",
      },
      {
        order_id: "9012",
        date: "2023-02-16",
        earning: 32.5,
        payment_method: "debit_card",
        supplier: "supplier 3",
        merchant: "merchant 3",
      },
      {
        order_id: "3456",
        date: "2023-02-17",
        earning: 42.99,
        payment_method: "credit_card",
        supplier: "supplier 4",
        merchant: "merchant 4",
      },
      {
        order_id: "7890",
        date: "2023-02-16",
        earning: 28.75,
        supplier: "supplier 5",
        merchant: "merchant 5",
      },
    ],
  };

  const orders = data.orders;

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

  return (
    <ScrollView style={styles.container}>
      {orders.map((order) => {
        return (
          <Collapse
            key={order.order_id}
            isCollapsed={!activeSections.includes(order.order_id)}
            onToggle={() => toggleSection(order.order_id)}
          >
            <CollapseHeader>
              <View style={styles.order}>
                {/* <View> */}
                <Text style={styles.each}>Date: {order.date}</Text>
                <Text style={styles.each}>Earning: ${order.earning}</Text>
                {/* </View> */}
              </View>
            </CollapseHeader>
            <CollapseBody>
              <View style={styles.orderDetails}>
                {/* <View> */}
                <Text style={styles.each}>order ID: {order.order_id}</Text>

                <Text style={styles.each}>supplier: {order.supplier}</Text>
                <Text style={styles.each}>merchant: {order.merchant}</Text>
                {/* </View> */}
                {/* <View> */}
                {/* </View> */}
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
