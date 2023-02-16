const WebSocket = require("ws");
const wss = new WebSocket.WebSocketServer({ port: 5000 });

wss.on('connection', function connection(ws) {
	ws.on('error', console.error);

	ws.on('message', function message(data) {
		console.log('received: %s', data);
	});

	ws.send('from backend to desktop');
});