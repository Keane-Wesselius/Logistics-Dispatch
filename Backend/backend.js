const WebSocket = require("ws");
const wss = new WebSocket.WebSocketServer({ port: 5000 });

// Create a new connection method with access to the active WebSocket connection.
wss.on("connection", function connection(ws) {
	// If an error occurs in this connection. print to the console the error.
	ws.on("error", console.error);

	// Handles receiving a message from the current connection, with the data is in a buffer.
	ws.on("message", function message(data) {
		// Parse the data as JSON data, converting it to a JavaScript object. Allegedly, this function SHOULD prevent security issues (such as an eval-attack, etc), but is potentially a security risk.
		let jsonObject = null;
		try {
			jsonObject = JSON.parse(data);
		} catch (ignored) {
		}

		// Check if the jsonObject is valid. By this point, we should be able to assume the JSON object is both safe and valid.
		if (jsonObject != null) {
			console.log("Got valid JSON object: " + jsonObject);
			ws.send("From backend to desktop");
		} else {
			console.log("Got invalid JSON object");
		}
	});
});