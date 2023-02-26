import { StatusBar } from "expo-status-bar";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import Login from "./screens/Login";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./screens/Home";
import OrderList from "./screens/OrderList";
import Map from "./screens/Map";
import Tabs from "./navigation/Tabs";
import Landing from "./components/Landing";
import React, { useState } from "react";
import Signup from "./screens/Signup";
import Earnings from "./screens/Earnings";
const Packets = require("./packets");

const Stack = createStackNavigator();
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	screen: {
		width: 100,
		height: 400,
	},
	image: {
		flex: 1,
		resizeMode: "cover",
		justifyContent: "center",
	},
	text: {
		color: "white",
		fontSize: 42,
		fontWeight: "bold",
		textAlign: "center",
		backgroundColor: "#000000a0",
	},
});

const App = (props) => {
	const [deliveryAddress, setDeliveryAddress] = useState(null);
	const onOrderPress = (shippingAddress) => {
		setDeliveryAddress(shippingAddress);
	};

	return (
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={{
					headerShown: false,
					gestureEnabled: false,
				}}
				initialRouteName={"Landing"}
			>
				<Stack.Screen name="Home" component={Tabs} />
				<Stack.Screen name="Login" component={Login} />
				<Stack.Screen name="OrdersList" component={OrderList} />
				<Stack.Screen name="Map" component={Map} />
				<Stack.Screen name="Landing" component={Landing} />
				<Stack.Screen name="Signup" component={Signup} />
				<Stack.Screen name="Earnings" component={Earnings} />
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default App;
