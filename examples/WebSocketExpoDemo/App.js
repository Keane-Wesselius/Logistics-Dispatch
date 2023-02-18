import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

export default class App extends React.Component {
	componentDidMount() {
		// This refers to a React WebSocket, not a browser WebSocket, which are different.
		let ws = new WebSocket('ws://127.0.0.1:5000/');
		ws.onopen = () => {
			ws.send("TEST");
		}
		ws.onclose = () => console.log('ws closed');

		ws.onmessage = e => {
			const message = JSON.parse(e.data);
			console.log('e', message);
		};
	}

	render() {
		return (
			<View style={styles.container} >
				<Text>Open up App.js to start working on your app!</Text>
				<StatusBar style="auto" />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});