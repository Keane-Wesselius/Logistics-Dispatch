const WebSocket = require("ws");
const Packets = require("../Common/packets.js");
const wss = new WebSocket.WebSocketServer({ port: 5000 });
const { MongoClient } = require('mongodb');

const uri = "MONGO KEY HERE";
const dbClient = new MongoClient(uri);

authenticated_clients = [];

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

		new Packets.AuthenticationPacket()

		// Check if the jsonObject is valid. By this point, we should be able to assume the JSON object is both safe and valid.
		if (jsonObject != null) {
			// Some examples of packets which need to be implemented:
			// Authentication Packets: Upon initial communication, client sends username and password to authenticate with the system. The server will send back if that authentication is valid or not.
			if (jsonObject.type == Packets.AUTHENTICATION) {
				console.log("Authentication Data: " + data);
			}

			// Now that we have a JSON from the frontend we can check if we are trying to call a function
			if (jsonObject.hasOwnProperty("function")) {
				if (jsonObject.function == "findIfUserExists") {
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

			console.log("Got valid JSON object: " + jsonObject);
			console.log("JSON values = " + JSON.stringify(jsonObject));
			ws.send("From backend to desktop");
		} else {
			console.log("Got invalid JSON object");
		}
	});
});


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