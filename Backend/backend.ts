import { WebSocket } from "ws";
import * as Packets from "../Common/packets.js";
import { DatabaseHandler } from "./database.js";
import * as Strings from "./strings.js";
import * as bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

// TODO: Change to less-commonly used port ( https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports )
// 19178 should work.
// Create a WebSocketServer on port 5005 and with a maximum payload of 10 megabytes (10 bytes * 1000 kilobytes * 1000 megabytes). More options can be found here: https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback
const wss = new WebSocket.WebSocketServer({ port: 5005, maxPayload: 10 * 1000 * 1000 });

// Controls whether the system will try to interface with the database, disable for easier debugging / unrelated implementations.
const doDatabase = true;
// let database = null;
let database : DatabaseHandler | null = null;

if (doDatabase) {
	database = new DatabaseHandler();
}

enum AccountType {
	DRIVER,
	MERCHANT,
	SUPPLIER,
}

interface DatabaseUserData {
	_id : ObjectId;
	acctype : string;
	email : string;
	firstName : string | null;
	lastName : string | null;
	name : string | null;
	profilePicture : string | null;
}

class UserData {
	id : string;
	accountType : AccountType;
	email : string;
	firstName : string | null;
	lastName : string | null;
	name : string | null;

	constructor(userDataJSON : DatabaseUserData) {
		this.id = userDataJSON._id.toString();
		this.accountType = AccountType[userDataJSON.acctype.toUpperCase()];
		this.email = userDataJSON.email;

		if (this.accountType == AccountType.DRIVER) {
			this.firstName = userDataJSON.firstName;
			this.lastName = userDataJSON.lastName;
		} else {
			this.name = userDataJSON.name;
		}
	}
}

function sendIfNotNull(webSocket : WebSocket, data : string | object | null) {
	if (data != null) {
		webSocket.send(data.toString());
	}
}

console.log("Server started on " + new Date().toString());

// Contains all clients which have successfully logged in. Perhaps not the most safe connection, especially is WebSocket connections could be spoofed, but other metrics such as IP Address / MAC Address are even worse at verifying that the connection is who they are. See the token idea below for additional security.
// TODO: Link WebSocket connections to user_ids for database use.
const websocketToClientData = new Map<WebSocket, UserData>();

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
		const packetType : string = Packets.getPacketType(data);
		if (packetType == null) {
			// TODO: Check that console.log is immune to unsanitized data, as invalid data might be some sort of attack. Might want to temporarily block them for a period of time.
			console.log("Received invalid packet: " + data);
			console.log("Len: " + data.toString().length);
			return;
		}

		const clientUserData = websocketToClientData.get(ws);
		const isClientAuthenticated = clientUserData != null;

		// TODO: What happens if the user sends two login packets at once?
		if (packetType == Packets.PacketTypes.LOGIN) {
			// TODO: If the client fails to send a valid login packet after a few attempts, they should be blocked from connecting for a period to avoid DOS attacks.
			const loginPacket = Packets.LoginPacket.fromJSONString(data);

			if (database != null && loginPacket.email != null && loginPacket.password != null) {
				// TODO: Using loose verbiage of 'username' and 'email', should standardize which one it is / be explicit that it can accept both
				// TODO: These might want to be split off into their own file to reduce the clutter in this file. Not sure how we want to structure the Backend server yet though.
				// TODO: All of these functions are accessing the test database and we will have to update them as soon as we get the real data base entries with correct schemas
				// database.getUserData(loginPacket.email).then(userData : DatabaseUserData => {
				database.getUserData(loginPacket.email).then(userData => {
					if (userData != null) {
						// bcrypt.compare is actually asynchronous, with a function callback (the '(err, result)' part of the function call), so it doesn't block execution, allowing the script to flow past it into error checking before we've confirmed the password was valid. Therefore, we need to do any error broadcasting INSIDE the bcrypt function for password errors, rather than being able to do all error messages at the end. Another example of some of the strange behavior and potential logical bugs in writing async JavaScript code.
						// TODO: Should check error?
						bcrypt.compare(loginPacket.password, userData.password, function (err, result) {
							if (result) {
								console.log("Got valid login: " + loginPacket.email + " " + loginPacket.password);
								// Add the current WebSocket connection, mapping the active connection to their userData from the database.

								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								websocketToClientData.set(ws, new UserData(userData));

								// Packet Structure: {"type": "authentication_success"}
								sendIfNotNull(ws, new Packets.AuthenticationSuccessPacket());
							} else {
								console.log("Got invalid password: " + loginPacket.email + " " + loginPacket.password);
								sendIfNotNull(ws, new Packets.AuthenticationFailedPacket(Strings.Strings.INVALID_PASSWORD));
							}
						});
					} else {
						console.log("Got invalid login: " + loginPacket.email + " " + loginPacket.password);
						sendIfNotNull(ws, new Packets.AuthenticationFailedPacket(Strings.Strings.INVALID_LOGIN));
					}
				}).catch(error => {
					console.log("Got invalid login: " + loginPacket.email + " " + loginPacket.password);
					sendIfNotNull(ws, new Packets.AuthenticationFailedPacket(Strings.Strings.INVALID_EMAIL));
				});
			} else {
				// In this case, the JSON itself didn't contain a username or password. Hopefully, this will never happen due to clientside input verification, but if it does, we'll catch it.
				console.log("Got invalid login");
				sendIfNotNull(ws, new Packets.AuthenticationFailedPacket(Strings.Strings.INVALID_LOGIN));
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.GET_LINKED_ORDERS) {
			if (clientUserData.accountType == AccountType.DRIVER) {
				database?.getAllOrdersByDriver(clientUserData.id).then((orders) => {
					console.log("Got orders '" + orders.toString() + "' from database");
					console.log("JSON String Version: " + JSON.stringify(orders));
					const setLinkedOrdersPacket = new Packets.SetLinkedOrders(JSON.stringify(orders));
					console.log(setLinkedOrdersPacket.toString());
					sendIfNotNull(ws, setLinkedOrdersPacket);
				});
			} else if (clientUserData.accountType == AccountType.MERCHANT) {
				database?.getAllOrdersByMerchant(clientUserData.id).then((orders) => {
					console.log("Got orders '" + orders.toString() + "' from database");
					console.log("JSON String Version: " + JSON.stringify(orders));
					const setLinkedOrdersPacket = new Packets.SetLinkedOrders(JSON.stringify(orders));
					console.log(setLinkedOrdersPacket.toString());
					sendIfNotNull(ws, setLinkedOrdersPacket);
				});
			} else if (clientUserData.accountType == AccountType.SUPPLIER) {
				database?.getAllOrdersBySupplier(clientUserData.id).then((orders) => {
					console.log("Got orders '" + orders.toString() + "' from database");
					console.log("JSON String Version: " + JSON.stringify(orders));
					const setLinkedOrdersPacket = new Packets.SetLinkedOrders(JSON.stringify(orders));
					console.log(setLinkedOrdersPacket.toString());
					sendIfNotNull(ws, setLinkedOrdersPacket);
				});
			} else {
				console.log("Got invalid account type for user data: '" + clientUserData.accountType + "'");
			}
		} else if (packetType == Packets.PacketTypes.CREATE_ACCOUNT) {
			const accountPacket = Packets.CreateAccountPacket.fromJSONString(data);

			if (database != null && accountPacket.email != null && accountPacket.password != null && accountPacket.acctype != null) {
				database.createNewUser(accountPacket).then((createdAccount) => {
					if (createdAccount) {
						sendIfNotNull(ws, new Packets.AccountCreateSuccessPacket().toString());
					} else {
						// TODO: The error is assumed here, but we should really say exactly what went wrong (existing username, email, etc).
						sendIfNotNull(ws, new Packets.AccountCreateFailedPacket("Failed to create account, account with username / email already exists.").toString());
					}
				});
			}
		} else {
			console.log("Received invalid or unhandled packet from client: " + data.toString());
		}
	});
});