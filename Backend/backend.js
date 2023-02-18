const WebSocket = require("ws");
const Packets = require("../Common/packets.js");
const wss = new WebSocket.WebSocketServer({ port: 5000 });

// Controls whether the system will try to interface with the database, disable for easier debugging / unrelated implementations.
const doDatabase = false;

if (doDatabase) {
	const { MongoClient } = require('mongodb');
	const uri = "MONGO KEY HERE";
	const dbClient = new MongoClient(uri);
}

authenticated_clients = [];

if (doDatabase) {
	// Creates a connection to the database
	async function startDatabase() {
		try {
			await dbClient.connect();
		}
		catch (e) {
			console.error(e);
		}
		// finally {
		//   await client.close();
		// }
	};
	startDatabase();
}

// Create a new connection method with access to the active WebSocket connection.
wss.on("connection", function connection(ws) {
	// If an error occurs in this connection. print to the console the error.
	ws.on("error", console.error);

	// Handles receiving a message from the current connection, with the data is in a buffer.
	ws.on("message", function message(data) {
		console.log("DATA: " + data);

		// TODO: Keeping the connection alive by permanently storing it?
		if (!authenticated_clients.includes(ws)) {

			// Attempt to parse any packet receive as a Login packet, as that is the required first packet for clients.
			// TODO: If the client fails to send a valid login packet after a few attempts, they should be blocked from connecting for a period to avoid DOS attacks.
			const loginPacket = Packets.LoginPacket.fromJSONString(data);
			console.log("Login Packet String: " + loginPacket.toString());

			if (loginPacket.username != null && loginPacket.password != null) {
				console.log("Got valid login: " + loginPacket.username + " " + loginPacket.password);
				authenticated_clients.push(ws);
			} else {
				console.log("Got invalid login");
			}
		} else {
			// Client is authenticated, check what kind of function they are attempting to call.
			const jsonObject = Packets.parseJSON(data);

			// Check if the jsonObject is valid. By this point, we should be able to assume the JSON object is both safe and valid.
			if (jsonObject != null) {
				console.log("JSON values = " + JSON.stringify(jsonObject));

				// Now that we have a JSON from the frontend we can check if we are trying to call a function
				if (jsonObject.remoteFunction == Packets.Functions.FIND_IF_USER_EXISTS) {
					console.log("FIND USER EXISTS");
					if (doDatabase) {
						findIfUserExists(dbClient, jsonObject.email, jsonObject.password)
							//in this case authenticated is the value returned by findIfUserExists()
							.then(authenticated => {
								ws.send(authenticated);
							})
							.catch(err => {
								console.error(err);
								ws.send('Internal server error');
							});
					}
				}
			} else {
				console.log("Got invalid JSON object: " + data);
			}
		}
	});
});

if (doDatabase) {
	//This function looks into the database and finds if an email and password exists in the database
	//If it does we return true and false if not
	//Currently I (keane) need to figure out bCrypt so i am passing the encrypted version of the password to get true values
	async function findIfUserExists(client, userEmail, userPassword) {
		const result = await client.db("test").collection("users").findOne({ email: userEmail, password: userPassword });

		if (result) {
			console.log(`User Credentials found in database!'${userEmail}':`);
			//console.log(result);
			return "true";
		} else {
			console.log(`User Credentials not in database'${userEmail}'`);
			return "false";
		}
	};
}