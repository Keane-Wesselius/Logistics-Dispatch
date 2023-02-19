const WebSocket = require("ws");
const Packets = require("../Common/packets.js");
const wss = new WebSocket.WebSocketServer({ port: 5000 });

// Controls whether the system will try to interface with the database, disable for easier debugging / unrelated implementations.
const doDatabase = true;

// TODO: These should be 'const', but need to be 'let' to support toggling database support on and off. This should be removed in production.
let uri = null;
let dbClient = null;

if (doDatabase) {
	const { MongoClient } = require('mongodb');
	uri = "MONGO KEY HERE";
	dbClient = new MongoClient(uri);
}

const authenticatedClients = [];

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

// async function findIfUserExists(client, userEmail) {
// 	const result = await client.db("test").collection("users").findOne({ email: userEmail });

// 	if (result) {
// 		console.log(`User Credentials found in database!'${userEmail}':`);
// 		//console.log(result);
// 		return true;
// 	} else {
// 		console.log(`User Credentials not in database'${userEmail}'`);
// 		return false;
// 	}
// };

// async function findIfUserAndPasswordExists(client, userEmail, userPassword) {
// 	const result = await client.db("test").collection("users").findOne({ email: userEmail, password: userPassword });

// 	if (result) {
// 		console.log(`User Credentials found in database!'${userEmail}':`);
// 		//console.log(result);
// 		return "true";
// 	} else {
// 		console.log(`User Credentials not in database'${userEmail}'`);
// 		return "false";
// 	}
// };

async function getUserData(userEmail) {
	// TODO: Add support for getting user data via email or username
	const result = await client.db("test").collection("users").findOne({ email: userEmail });
	return result;
}

// Create a new connection method with access to the active WebSocket connection.
wss.on("connection", function connection(ws) {
	// If an error occurs in this connection. print to the console the error.
	ws.on("error", console.error);

	// Handles receiving a message from the current connection, with the data is in a buffer.
	ws.on("message", function message(data) {
		console.log("Raw Received Data: " + data);

		// TODO: Keeping the connection alive by permanently storing it?
		// TODO: Cannot have this be assumed this is the first packet, as the user might want to sign in.
		if (!authenticatedClients.includes(ws)) {
			// TODO: Type check
			// Attempt to parse any packet receive as a Login packet, as that is the required first packet for clients.
			// TODO: If the client fails to send a valid login packet after a few attempts, they should be blocked from connecting for a period to avoid DOS attacks.
			const loginPacket = Packets.LoginPacket.fromJSONString(data);

			if (loginPacket.username != null && loginPacket.password != null) {
				// findIfUserExists(dbClient, loginPacket.username)
				// 	//in this case authenticated is the value returned by findIfUserExists()
				// 	.then(userExists => {
				// 		if (userExists) {
				// 			findIfUserExists(dbClient, loginPacket.username, loginPacket.password)
				// 				//in this case authenticated is the value returned by findIfUserExists()
				// 				.then(authenticated => {
				// 					if (authenticated === "true") {
				// 						console.log("Got valid login: " + loginPacket.username + " " + loginPacket.password);
				// 						authenticatedClients.push(ws);
				// 						const authenticationSuccessPacket = new Packets.AuthenticationSuccessPacket();
				// 						ws.send(authenticationSuccessPacket.toString());
				// 					} else {
				// 						console.log("Got invalid login: " + loginPacket.username + " " + loginPacket.password);
				// 						const authenticationFailedPacket = new Packets.AuthenticationFailedPacket();
				// 						ws.send(authenticationFailedPacket.toString());
				// 					}
				// 				})
				// 				.catch(err => {
				// 					// TODO: Send back AuthenticationFailed Packed
				// 					console.error("Got invalid login: " + err);

				// 					const authenticationFailedPacket = new Packets.AuthenticationFailed("An unknown error occurred");
				// 					ws.send(authenticationFailedPacket.toString());
				// 				});
				// 		}
				// 	})
				// 	.catch(err => {
				// 		// TODO: Send back AuthenticationFailed Packed
				// 		console.error("Got invalid login: " + err);

				// 		const authenticationFailedPacket = new Packets.AuthenticationFailed("An unknown error occurred");
				// 		ws.send(authenticationFailedPacket.toString());
				// 	});

				let userUsernameWasValid = false;
				let userPasswordWasValid = false;

				// TODO: Using loose verbiage of 'username' and 'email', which one is it?
				getUserData(loginPacket.username).then(userData => {
					if (userData != null) {
						userUsernameWasValid = true;

						if (userData.password === loginPacket.password) {
							console.log("Got valid login: " + loginPacket.username + " " + loginPacket.password);
							authenticatedClients.push(ws);
							const authenticationSuccessPacket = new Packets.AuthenticationSuccessPacket();
							ws.send(authenticationSuccessPacket.toString());

							// {"type": "authentication_success"}

							userPasswordWasValid = true;
						}
					}
				}).catch(error => {
					// TODO: Check if error is stating database is down, return a fatal error in that case.
				});

				let userErrorMessage = null;
				if (!userUsernameWasValid) {
					userErrorMessage = "User name / email is invalid.";
				} else if (!userPasswordWasValid) {
					userErrorMessage = "User password is invalid.";
				}

				if (userErrorMessage != null) {
					// TODO: Probably shouldn't log username / password to console.
					console.log("Got invalid username / password: " + loginPacket.username + " " + loginPacket.password);
					const authenticationFailedPacket = new Packets.AuthenticationFailedPacket(userErrorMessage);

					// Example of checking PacketTypes.
					// if(Packets.getPacketType(authenticationFailedPacket) === Packets.PacketTypes.AUTHENTICATION_FAILED) {
					// }

					// {"type": "authentication_failed", "error_message": "Invalid username / password"}
					ws.send(authenticationFailedPacket.toString());
				}
			} else {
				console.log("Got invalid login");
			}
		} else {
			// The user in this case has already been authenticated, so any packets they send can be received and processed by the server.

			// TODO: Requiring some kind of token to be sent with each packet from a client to the server might be a good additional security measure, at the cost of more network traffic.
			// Attempt to parse the packet type from the data.

			// TODO: This parsing required getting the JSON JavaScript object to check the type parameter. At the very least, this will check if the JSON is valid, but that is already being done when parsing fromJsonString(). Slightly inefficient, so maybe having a way to construct a Packet from a JSON JavaScript might want to be looked into.
			const packetType = Packets.getPacketType(data);
			if (packetType != null) {
				if (packetType == Packets.PacketTypes.FIND_IF_USER_EXISTS) {
					// const findIfUserExistsPacket = Packets.DoesUserExistPacket.fromJSONString(data);

					// // Check if the jsonObject is valid. By this point, we should be able to assume the JSON object is both safe and valid.
					// if (findIfUserExistsPacket != null) {
					// 	console.log("FIND USER EXISTS");
					// 	if (doDatabase) {

					// 	}
					// } else {
					// 	console.log("Got invalid JSON object: " + data);
					// }
				}
			}
		}
	});
});

// TODO: These might want to be split off into their own file to reduce the clutter in this file. Not sure how we want to structure the Backend server yet though.
if (doDatabase) {
	//This function looks into the database and finds if an email and password exists in the database
	//If it does we return true and false if not
	//Currently I (keane) need to figure out bCrypt so i am passing the encrypted version of the password to get true values
}