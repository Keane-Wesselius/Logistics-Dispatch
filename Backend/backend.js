const WebSocket = require("ws");
const Packets = require("../Common/packets.js");
const Database = require("./database.js");
const bcrypt = require("bcrypt");

// TODO: Change to less-commonly used port ( https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports )
// 19178 should work.
const wss = new WebSocket.WebSocketServer({ port: 5005 });

// Controls whether the system will try to interface with the database, disable for easier debugging / unrelated implementations.
let doDatabase = true;
let database = null;

if (doDatabase) {
	database = new Database.DatabaseHandler();
	database.completeOrder('a');
}

console.log("Server started on " + new Date().toString());

// Contains all clients which have successfully logged in. Perhaps not the most safe connection, especially is WebSocket connections could be spoofed, but other metrics such as IP Address / MAC Address are even worse at verifying that the connection is who they are. See the token idea below for additional security.
// TODO: Link WebSocket connections to user_ids for database use.
const authenticatedClients = [];

// Create a new connection method with access to the active WebSocket connection.
wss.on("connection", function connection(ws) {
	// If an error occurs in this connection. print to the console the error.
	ws.on("error", console.error);

	// Handles receiving a message from the current connection, with the data is in a buffer.
	ws.on("message", function message(data) {
		console.log("Raw Received Data: " + data);
		// TODO: Requiring some kind of token to be sent with each packet from a client to the server might be a good additional security measure, at the cost of more network traffic.

		// TODO: This parsing required getting the JSON JavaScript object to check the type parameter. At the very least, this will check if the JSON is valid, but that is already being done when parsing fromJsonString(). Slightly inefficient, so maybe having a way to construct a Packet from a JSON JavaScript object might want to be looked into / parsing the packet type using string manipulation (would be much, much faster).

		// Attempt to parse the packet type from the data.
		const packetType = Packets.getPacketType(data);
		if (packetType == null) {
			// TODO: Check that console.log is immune to unsanitized data, as invalid data might be some sort of attack. Might want to temporarily block them for a period of time.
			console.log("Received invalid packet: " + data);
			console.log("Len: " + data.length);
			return;
		}

		const isClientAuthenticated = authenticatedClients.includes(ws);

		// TODO: What happens if the user sends two login packets at once?
		if (packetType == Packets.PacketTypes.LOGIN) {
			// TODO: If the client fails to send a valid login packet after a few attempts, they should be blocked from connecting for a period to avoid DOS attacks.
			const loginPacket = Packets.LoginPacket.fromJSONString(data);

			if (database != null && loginPacket.email != null && loginPacket.password != null) {
				// TODO: Using loose verbiage of 'username' and 'email', should standardize which one it is / be explicit that it can accept both
				// TODO: These might want to be split off into their own file to reduce the clutter in this file. Not sure how we want to structure the Backend server yet though.
				// TODO: All of these functions are accessing the test database and we will have to update them as soon as we get the real data base entries with correct schemas
				database.getUserData(loginPacket.email).then(userData => {
					let userEmailWasValid = false;
					let userPasswordWasValid = false;

					if (userData != null) {
						userEmailWasValid = true;

						// TODO: Should check error?
						bcrypt.compare(loginPacket.password, userData.password, function (err, result) {
							if (result) {
								console.log("Got valid login: " + loginPacket.email + " " + loginPacket.password);
								authenticatedClients.push(ws);
								const authenticationSuccessPacket = new Packets.AuthenticationSuccessPacket();
								ws.send(authenticationSuccessPacket.toString());

								// {"type": "authentication_success"}
								userPasswordWasValid = true;
							}
						});
					}

					let userErrorMessage = null;
					if (!userEmailWasValid) {
						console.log("option 1");
						// TODO: Move into global, translatable user strings file.
						userErrorMessage = "User name is invalid.";
					} else if (!userPasswordWasValid) {
						console.log("option 2");
						// TODO: Move into global, translatable user strings file.
						userErrorMessage = "User password is invalid.";
					}

					if (userErrorMessage != null) {
						// TODO: Probably shouldn't log username / password to console.
						console.log("Got invalid username / password: " + loginPacket.email + " " + loginPacket.password);
						const authenticationFailedPacket = new Packets.AuthenticationFailedPacket(userErrorMessage);

						// Example of checking PacketTypes.
						// if(Packets.getPacketType(authenticationFailedPacket) === Packets.PacketTypes.AUTHENTICATION_FAILED) {
						// }

						// {"type": "authentication_failed", "error_message": "Invalid username / password"}
						ws.send(authenticationFailedPacket.toString());
					}
				}).catch(error => {
					// TODO: Check if error is stating database is down, return a fatal error in that case.
				});
			} else {
				// In this case, the JSON itself didn't contain a username or password. Hopefully, this will never happen due to clientside input verification, but if it does, we'll catch it.
				console.log("Got invalid login");
				userErrorMessage = "Invalid login.";
				const authenticationFailedPacket = new Packets.AuthenticationFailedPacket(userErrorMessage);
				ws.send(authenticationFailedPacket.toString());
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.GET_ACTIVE_JOBS) {
			// TODO: Currently no mechanism to see what jobs the user should be able to see, so we are currently passing everything from the database, which is probably bad.
			getAllJobs().then((results) => {
			}).catch(() => {
			})
		} else if (packetType == Packets.PacketTypes.CREATE_ACCOUNT) {
			const accountPacket = Packets.CreateAccountPacket.fromJSONString(data);

			if (database != null && accountPacket.email != null && accountPacket.password != null && accountPacket.acctype != null) {
				database.createNewUser(accountPacket).then((result) => {

					if (result != null) {
						const accountCreateFailedPacket = new Packets.AccountCreateFailedPacket(result);
						ws.send(accountCreateFailedPacket.toString());
					} else {
						const accountCreateSuccessPacket = new Packets.AccountCreateSuccessPacket();
						ws.send(accountCreateSuccessPacket.toString());
					}
				});
			}
		}
	});
});