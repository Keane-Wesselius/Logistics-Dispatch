const WebSocket = require("ws");
const ws = new WebSocket(address = 'ws://127.0.0.1:5000');

ws.on('error', console.error);

ws.on('open', function open() {
	ws.send('from desktop to backend');
});

ws.on('message', function message(data) {
	console.log('received: %s', data);
});