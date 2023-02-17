const WebSocket = require("ws");
const ws = new WebSocket(address = 'ws://127.0.0.1:5000');

ws.on('error', console.error);

ws.on('open', function open() {
	setInterval(() => {
		// ws.send('from desktop to backend');
		ws.send('{"test": true}');
	}, 1000);
});

ws.on('message', function message(data) {
	console.log('received: %s', data);
});