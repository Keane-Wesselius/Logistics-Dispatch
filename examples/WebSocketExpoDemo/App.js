import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

//This React expo application is interfacing with Backend/backend.js

//We need extends React.Component to use the correct websocket vs using import react-native-websocket
export default class App extends React.Component {
	componentDidMount() {
		// This refers to a React WebSocket, not a browser WebSocket, which are different.
		let ws = new WebSocket('ws://127.0.0.1:5000/');
		//onopen happens when the websocket connects
		ws.onopen = () => {
			//ws.send sends data to backend.js 
			//We MUST send a string and not a JSON to the backend
			ws.send(JSON.stringify({function: "findIfUserExists", email: 'test@gmail.com', password: '$2b$10$WiSov1jp8GHWjEMAf7rFaejT7NHgbC9VBDLGQcO27.VqxKWnBtiJa' }));
		}
		ws.onclose = () => console.log('ws closed');

		//When we get an answer back this is called 
		ws.onmessage = e => {
			//JSON.parse is not working with the data sent back by the backend
			const message = e;//JSON.parse(e);
			//whatever we send back from the backend is a JSON with a bunch of weird things
			//However what we send from the backend is stored in the data key of the JSON
			console.log(e.data);
			console.log('e', message);
		};

		ws.onerror = (e) => {
			console.error('WebSocket error:', e.message);
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