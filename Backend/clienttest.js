const WebSocket = require("ws");
const PacketDefinitions = require("./packet_definitions.js");
const ws = new WebSocket(address = 'ws://127.0.0.1:5000');

ws.on('error', console.error);

ws.on('open', function open() {
	setInterval(() => {
		// Taken From 2/17/2023 4:22 PM: https://javascript.info/json#json-stringify
		let authenticationPacket = {
			type: PacketDefinitions.AUTHENTICATION,
			username: "TestUser1",
			password: "password1",
		};

		// ws.send('from desktop to backend');
		// ws.send('{"type": true}');
		ws.send(JSON.stringify(authenticationPacket));
	}, 1000);
});

ws.on('message', function message(data) {
	console.log('received: %s', data);
});