// NPM imports
import { WebSocket } from "ws";
import * as bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

// Local imports
import * as Packets from "../Common/packets.js";
import { DatabaseHandler } from "./database.js";
import * as Strings from "./strings.js";

// Controls whether the system will try to interface with the database, disable for easier debugging / unrelated implementations.
const database : DatabaseHandler = new DatabaseHandler();

enum AccountType {
	DRIVER = "driver",
	MERCHANT = "merchant",
	SUPPLIER = "supplier"
}

interface DatabaseUserData {
	_id : ObjectId;
	acctype : string;
	email : string;
	password : string;
	firstName : string | null;
	lastName : string | null;
	name : string | null;
	profilePicture : string | null;
	address : string | null;
}

class UserData {
	id : string;
	accountType : AccountType;
	email : string;
	firstName : string | null;
	lastName : string | null;
	name : string | null;
	address : string | null;
	cart : Set<ItemData>;

	constructor(userDataJSON : DatabaseUserData) {
		this.id = userDataJSON._id.toString();
		if (userDataJSON.acctype != null) {
			this.accountType = AccountType[userDataJSON.acctype.toUpperCase()];
		}

		this.email = userDataJSON.email;

		if (this.accountType == AccountType.DRIVER) {
			this.firstName = userDataJSON.firstName;
			this.lastName = userDataJSON.lastName;
		} else {
			this.name = userDataJSON.name;
		}

		this.address = userDataJSON.address;

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this.cart = new Set<ItemData>();
	}

	isDriver() {
		return this.accountType == AccountType.DRIVER;
	}

	isMerchant() {
		return this.accountType == AccountType.MERCHANT;
	}

	isSupplier() {
		return this.accountType == AccountType.SUPPLIER;
	}
}

class ItemData {
	_id : ObjectId | null;
	itemName : string;
	description : string;
	quantity : number;
	supplierId : ObjectId;
	price : number;
	weight : number;
	postedDate : Date;

	constructor(itemId : ObjectId | null, itemData : Packets.AddItem, supplierId : string) {
		this._id = itemId;
		this.itemName = itemData.itemName;
		this.description = itemData.description;
		this.quantity = itemData.quantity;
		this.supplierId = new ObjectId(supplierId);
		this.price = itemData.price;
		this.weight = itemData.weight;
		this.postedDate = new Date();
	}
}

class ActiveConnection {
	// TODO: Remove WebSocket and switch to just the token-based system, as it is much more reliable and secure.
	ws : WebSocket;
	token : string | null;
	userData : UserData | null;
	constructor(ws : WebSocket, userData : UserData | null = null, token : string | null = null) {
		this.ws = ws;
		this.token = token;
		this.userData = userData;
	}
}

function sendIfNotNull(webSocket : WebSocket, data : string | object | null) {
	if (data != null) {
		webSocket.send(data.toString());
	}
}

function getActiveConnectionByWebSocketOrToken(webSocket : WebSocket, token : string | null = null) {
	for (const activeConnection of activeConnections) {
		if (token != null && activeConnection.token === token) {
			console.log("Got ActiveConnection by token: " + activeConnection.token);
			return activeConnection;
		} else if (activeConnection.userData != null && activeConnection.ws == webSocket) {
			// TODO: Print identifying WebSocket information, such as IP address or MAC Address, etc.
			console.log("Got ActiveConnection by WebSocket: ");
			return activeConnection;
		}
	}

	return null;
}

function removeActiveConnectionByWebSocketOrToken(webSocket : WebSocket, token : string | null = null) {
	let linkedActiveConnection : ActiveConnection | null = null;
	for (const activeConnection of activeConnections) {
		if (activeConnection.ws == webSocket) {
			linkedActiveConnection = activeConnection;
			break;
		} else if (token != null && activeConnection.token === token) {
			linkedActiveConnection = activeConnection;
		}
	}

	if (linkedActiveConnection != null) {
		activeConnections.delete(linkedActiveConnection);
	}
}

function addActiveConnection(webSocket : WebSocket, userData : UserData | null = null, token : string | null = null) {
	const newActiveConnection = new ActiveConnection(webSocket, userData, token);

	// TODO: Check if user already exists and return false if it failed.
	activeConnections.add(newActiveConnection);

	return newActiveConnection;
}

// Taken From 2/26/2023 2:31 PM: https://stackoverflow.com/a/16106759
function generateRandomAlphaNumericString(length : number, allowUppercase = true) {
	let returnString = "";
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789";

	for (let i = 0; i < Math.ceil(length); i++) {
		let randomChar = charset.charAt(Math.floor(Math.random() * charset.length));
		if (allowUppercase && Math.random() >= 0.5) {
			randomChar = randomChar.toUpperCase();
		}

		returnString += randomChar;
	}

	return returnString;
}

// TODO: Switch to a real token-based authentication system.
const tokenLength = 32;
function generateToken() {
	return generateRandomAlphaNumericString(tokenLength);
}

// Taken From 3/5/2023 6:48 PM: https://stackoverflow.com/a/15289883
// a and b are javascript Date objects
function dateDiffInDays(a : Date, b : Date) {
	const _MS_PER_DAY = 1000 * 60 * 60 * 24;
	// Discard the time and time-zone information.
	const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
	const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

	return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

// Contains all active WebSocket connection, their associated authentication token, and their database user data if they have one.
// TODO: Should periodically drop inactive connections.
const activeConnections = new Set<ActiveConnection>();

// TODO: Change to less-commonly used port ( https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports )
// 19178 should work.

// Create a WebSocketServer on port 5005 and with a maximum payload of 10 megabytes (10 bytes * 1000 kilobytes * 1000 megabytes). More options can be found here: https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback
const wss = new WebSocket.WebSocketServer({ port: 5005, maxPayload: 10 * 1000 * 1000 });

console.log("Server started on " + new Date().toString());

// Create a new connection method with access to the active WebSocket connection.
wss.on("connection", function connection(ws) {
	// If an error occurs in this connection. print to the console the error.
	ws.on("error", (error) => {
		console.error("WebSocket threw an error: " + error.name + ": " + error.message);
	});

	ws.on("close", () => {
		// TODO: Cannot due this, as for clients which use the token authentication system, they obviously need to drop the WebSocket connection, either due to having to switch pages or screens or whatnot. We SHOULD implement a system which removes and garbage-collects the various unused connections after a period of time.
		// removeActiveConnectionByWebSocketOrToken(ws);
	});

	// Handles receiving a message from the current connection, with the data is in a buffer.
	ws.on("message", function message(data) {
		console.log("Raw Received Data: " + data);
		// TODO: This parsing required getting the JSON JavaScript object to check the type parameter. At the very least, this will check if the JSON is valid, but that is already being done when parsing fromJsonString(). Slightly inefficient, so maybe having a way to construct a Packet from a JSON JavaScript object might want to be looked into / parsing the packet type using string manipulation (would be much, much faster).

		// Attempt to parse the packet type from the data.
		const packetJSONObject : string = Packets.parseJSON(data);
		const packetType : string | null = Packets.tryGet(packetJSONObject, Packets.Constants.TYPE);
		if (packetType == null) {
			// TODO: Check that console.log is immune to unsanitized data, as invalid data might be some sort of attack. Might want to temporarily block them for a period of time.
			console.log("Received Invalid Packet: " + data);
			console.log("Invalid Packet Length: " + data != null ? data.toString().length : "null");
			return;
		}

		console.log("Got packet of type '" + packetType + "' with token '" + Packets.tryGet(packetJSONObject, Packets.Constants.TOKEN) + "'");

		let activeConnection = getActiveConnectionByWebSocketOrToken(ws, Packets.tryGet(packetJSONObject, Packets.Constants.TOKEN));
		if (activeConnection != null) {
			// TODO: This could be a security vulnerability if someone manages to spoof the token of a client, so checking other potential indicators such as IP address / geolocation of IP might help to ensure that simple spoofing attacks cannot be exploited.
			if (activeConnection.ws != ws) {
				activeConnection.ws = ws;
			}
		} else if (packetType != Packets.PacketTypes.LOGIN && packetType != Packets.PacketTypes.CREATE_ACCOUNT && packetType != Packets.PacketTypes.CREATE_DRIVER_ACCOUNT) {
			console.error("Failed to get active connection from WebSocket for packet which requires active connection. Closing connection.");
			ws.close();
			return;
		}

		const clientUserData = activeConnection != null ? activeConnection.userData : null;
		const isClientAuthenticated = clientUserData != null;

		// TODO: What happens if the user sends two login packets at once?
		// TODO: These packet handlers might want to be split off into their own file to reduce the clutter in this file. Not sure how we want to structure the Backend server yet though.
		if (packetType == Packets.PacketTypes.LOGIN) {
			// TODO: If the client fails to send a valid login packet after a few attempts, they should be blocked from connecting for a period to avoid DOS attacks.
			const loginPacket = Packets.LoginPacket.fromJSONString(data);

			if (database != null && loginPacket.email != null && loginPacket.password != null) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				database.getUserData(loginPacket.email).then((userDataJSON : DatabaseUserData) => {
					if (userDataJSON != null) {
						// bcrypt.compare is actually asynchronous, with a function callback (the '(err, result)' part of the function call), so it doesn't block execution, allowing the script to flow past it into error checking before we've confirmed the password was valid. Therefore, we need to do any error broadcasting INSIDE the bcrypt function for password errors, rather than being able to do all error messages at the end. Another example of some of the strange behavior and potential logical bugs in writing async JavaScript code.
						bcrypt.compare(loginPacket.password, userDataJSON.password, function (err, result) {
							if (result) {
								console.log("Got valid login: " + loginPacket.email + " " + loginPacket.password);

								if (activeConnection == null) {
									activeConnection = addActiveConnection(ws);
								}

								// Add the current WebSocket connection, mapping the active connection to their userData from the database.

								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								const loginUserData = new UserData(userDataJSON);

								// Modify the activeConnection to include the database user data and their new token.
								activeConnection.userData = loginUserData;
								activeConnection.token = generateToken();

								// Packet Structure Example: {"type": "authentication_success", "acctype": "driver", "token": "rhog4sm4ep3vsl35a37ff3n1giociu78"} or {"type": "authentication_success", "acctype": "driver", "token": null}
								// Send to the user that their authentication was successful, returning the account type they signed up with and their associated token. Token can be used to authenticate the user in the case that the websocket connection cannot be kept alive.

								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								sendIfNotNull(ws, new Packets.AuthenticationSuccessPacket(loginUserData.accountType, activeConnection.token));
							} else {
								console.log("Got invalid password: " + loginPacket.email + " " + loginPacket.password);
								sendIfNotNull(ws, new Packets.AuthenticationFailedPacket(Strings.Strings.INVALID_PASSWORD));
							}
						});
					} else {
						console.log("Got invalid user data JSON: " + loginPacket.email + " " + loginPacket.password);
						sendIfNotNull(ws, new Packets.AuthenticationFailedPacket(Strings.Strings.INVALID_LOGIN));
					}
				}).catch((error) => {
					console.log("Got invalid email: " + loginPacket.email + " " + loginPacket.password);
					sendIfNotNull(ws, new Packets.AuthenticationFailedPacket(Strings.Strings.INVALID_EMAIL));
				});
			} else {
				// In this case, the JSON itself didn't contain a username or password. Hopefully, this will never happen due to clientside input verification, but if it does, we'll catch it.
				console.log("Got invalid login");
				sendIfNotNull(ws, new Packets.AuthenticationFailedPacket(Strings.Strings.INVALID_LOGIN));
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.GET_LINKED_ORDERS) {
			if (clientUserData.isDriver()) {
				database?.getAllOrdersByDriver(clientUserData.id).then((orders) => {
					sendIfNotNull(ws, new Packets.SetLinkedOrders(JSON.stringify(orders)));
				});
			} else if (clientUserData.isMerchant()) {
				database?.getAllOrdersByMerchant(clientUserData.id).then((orders) => {
					sendIfNotNull(ws, new Packets.SetLinkedOrders(JSON.stringify(orders)));
				});
			} else if (clientUserData.isSupplier()) {
				database?.getAllOrdersBySupplier(clientUserData.id).then((orders) => {
					sendIfNotNull(ws, new Packets.SetLinkedOrders(JSON.stringify(orders)));
				});
			} else {
				console.log("Got invalid account type for action GET_LINKED_ORDERS: '" + clientUserData.accountType + "'");
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.GET_ALL_CONFIRMED_ORDERS) {
			if (clientUserData.isDriver()) {
				database?.getAllConfirmedOrdersForDriver().then((orders) => {
					sendIfNotNull(ws, new Packets.SetAllConfirmedOrders(JSON.stringify(orders)));
				});
			} else if (clientUserData.isMerchant()) {
				database?.getAllConfirmedOrdersByMerchant(clientUserData.id).then((orders) => {
					sendIfNotNull(ws, new Packets.SetAllConfirmedOrders(JSON.stringify(orders)));
				});
			} else if (clientUserData.isSupplier()) {
				database?.getAllConfirmedOrdersBySupplier(clientUserData.id).then((orders) => {
					sendIfNotNull(ws, new Packets.SetAllConfirmedOrders(JSON.stringify(orders)));
				});
			} else {
				console.log("Got invalid account type for action GET_ALL_CONFIRMED_ORDERS: '" + clientUserData.accountType + "'");
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.GET_ALL_COMPLETED_ORDERS) {
			if (clientUserData.isDriver()) {
				database?.getAllCompletedOrdersByDriver(clientUserData.id).then((orders) => {
					sendIfNotNull(ws, new Packets.SetAllCompletedOrders(JSON.stringify(orders)));
				});
			} else if (clientUserData.isMerchant()) {
				database?.getAllCompletedOrdersByMerchant(clientUserData.id).then((orders) => {
					sendIfNotNull(ws, new Packets.SetAllCompletedOrders(JSON.stringify(orders)));
				});
			} else if (clientUserData.isSupplier()) {
				database?.getAllCompletedOrdersBySupplier(clientUserData.id).then((orders) => {
					sendIfNotNull(ws, new Packets.SetAllCompletedOrders(JSON.stringify(orders)));
				});
			} else {
				console.log("Got invalid account type for action GET_ALL_COMPLETED_ORDERS: " + clientUserData.accountType);
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.GET_ALL_ORDERS) {
			if (clientUserData.isDriver()) {
				database?.getAllOrdersByDriver(clientUserData.id).then((orders) => {
					sendIfNotNull(ws, new Packets.SetAllOrders(JSON.stringify(orders)));
				});
			} else if (clientUserData.isMerchant()) {
				database?.getAllOrdersByMerchant(clientUserData.id).then((orders) => {
					sendIfNotNull(ws, new Packets.SetAllOrders(JSON.stringify(orders)));
				});
			} else if (clientUserData.isSupplier()) {
				database?.getAllAcceptedOrdersBySupplier(clientUserData.id).then((orders) => {
					sendIfNotNull(ws, new Packets.SetAllOrders(JSON.stringify(orders)));
				});
			} else {
				console.log("Got invalid account type for action GET_ALL_ORDERS: " + clientUserData.accountType);
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.GET_LINKED_ITEMS) {
			// Retrieves items from the database based on chosen supplier
			if (clientUserData.isSupplier()) {
				database?.getItemsBySupplier(clientUserData.id).then((items) => {
					sendIfNotNull(ws, new Packets.SetLinkedItems(JSON.stringify(items)));
				});
			} else if (clientUserData.isMerchant()) {
				database?.getAllItems().then((items) => {
					sendIfNotNull(ws, new Packets.SetLinkedItems(JSON.stringify(items)));
				});
			} else {
				console.log("Got invalid account type for action GET_LINKED_ITEMS: " + clientUserData.accountType);
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.ADD_ITEM) {
			console.log(JSON.stringify(clientUserData));
			// Adding new items into the database, suppliers only
			if (clientUserData.isSupplier()) {
				const addItemPacket = Packets.AddItem.fromJSONString(data);
				const item = new ItemData(null, addItemPacket, clientUserData.id);
				console.log("Add Item Packet: " + JSON.stringify(addItemPacket));
				console.log("Added Item: " + JSON.stringify(item));

				database?.insertNewItem(item).then((addedSuccessfully) => {
					if (addedSuccessfully) {
						sendIfNotNull(ws, new Packets.ItemUpdateSuccess().toString());
					} else {
						sendIfNotNull(ws, new Packets.ItemUpdateFailed().toString());
					}
				});
			} else {
				console.log("Got invalid account type for action ADD_ITEM: " + clientUserData.accountType);
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.REMOVE_ITEM) {
			// Removing items from the database, suppliers only
			if (clientUserData.isSupplier()) {
				const removeItemPacket = Packets.RemoveItem.fromJSONString(data);
				database?.removeItem(removeItemPacket.itemId).then((removedSuccessfully) => {
					if (removedSuccessfully) {
						sendIfNotNull(ws, new Packets.ItemUpdateSuccess().toString());
					} else {
						sendIfNotNull(ws, new Packets.ItemUpdateFailed().toString());
					}
				});
			} else {
				console.log("Got invalid account type for action REMOVE_ITEM: " + clientUserData.accountType);
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.UPDATE_ORDER_STATUS) {
			// Creating accounts and adding them to the database
			// TODO: Kinda a security concern, as the ObjectID for orders could potentially be spoofed. Should check if the order they are editing can actually be seen by them.
			const updateStatus = Packets.UpdateOrderStatus.fromJSONString(data);

			// TODO: Validate status can actually go from it's previous state to this new state.
			if (updateStatus.status == Packets.Status.ACCEPTED) {
				database?.acceptOrder(updateStatus.orderId, clientUserData.id).then((updatedStatusSuccessfully) => {
					if (updatedStatusSuccessfully) {
						sendIfNotNull(ws, new Packets.UpdateOrderStatusSuccess().toString());
					} else {
						sendIfNotNull(ws, new Packets.UpdateOrderStatusFailure().toString());
					}
				});
			} else if (updateStatus.status == Packets.Status.CANCELLED) {
				database?.cancelOrder(updateStatus.orderId).then((updatedStatusSuccessfully) => {
					if (updatedStatusSuccessfully) {
						sendIfNotNull(ws, new Packets.UpdateOrderStatusSuccess().toString());
					} else {
						sendIfNotNull(ws, new Packets.UpdateOrderStatusFailure().toString());
					}
				});
			} else if (updateStatus.status == Packets.Status.COMPLETED) {
				database?.completeOrder(updateStatus.orderId).then((updatedStatusSuccessfully) => {
					if (updatedStatusSuccessfully) {
						sendIfNotNull(ws, new Packets.UpdateOrderStatusSuccess().toString());
					} else {
						sendIfNotNull(ws, new Packets.UpdateOrderStatusFailure().toString());
					}
				});
			} else if (updateStatus.status == Packets.Status.CONFIRMED) {
				database?.confirmOrder(updateStatus.orderId).then((updatedStatusSuccessfully) => {
					if (updatedStatusSuccessfully) {
						sendIfNotNull(ws, new Packets.UpdateOrderStatusSuccess().toString());
					} else {
						sendIfNotNull(ws, new Packets.UpdateOrderStatusFailure().toString());
					}
				});
			} else if (updateStatus.status == Packets.Status.IN_TRANSIT) {
				// TODO: Implement
			} else if (updateStatus.status == Packets.Status.REJECTED) {
				// TODO: Implement
			}

			// TODO: Handlers for the rest of the enums.
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.UPDATE_ITEM) {
			if (clientUserData?.isSupplier()) {
				const updateItemPacket = Packets.UpdateItem.fromJSONString(data);
				const item = new ItemData(updateItemPacket.itemId, updateItemPacket, clientUserData.id);

				database?.updateItem(item).then((updatedSuccessfully) => {
					if (updatedSuccessfully) {
						sendIfNotNull(ws, new Packets.ItemUpdateSuccess().toString());
					} else {
						sendIfNotNull(ws, new Packets.ItemUpdateFailed().toString());
					}
				});
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.GET_USER_DATA) {
			//Retrieving user data from the database
			database?.getUserData(clientUserData.email).then((object) => {
				// Remove password from sent user data.
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				object.password = null;
				sendIfNotNull(ws, new Packets.SetUserData(JSON.stringify(object)));
			});
		} else if (packetType == Packets.PacketTypes.CREATE_ACCOUNT) {
			// Creating accounts and adding them to the database
			const accountPacket = Packets.CreateAccountPacket.fromJSONString(data);

			if (database != null && accountPacket.name != null && accountPacket.email != null && accountPacket.password != null && accountPacket.acctype != null && accountPacket.address != null) {
				database.createNewUser(accountPacket).then((createdAccount) => {
					if (createdAccount) {
						sendIfNotNull(ws, new Packets.AccountCreateSuccessPacket().toString());
					} else {
						// TODO: The error is assumed here, but we should really say exactly what went wrong (existing username, email, etc).
						sendIfNotNull(ws, new Packets.AccountCreateFailedPacket("Failed to create account, account with username / email already exists.").toString());
					}
				});
			} else {
				sendIfNotNull(ws, new Packets.AccountCreateFailedPacket("Failed to create account, account with username / email already exists.").toString());
			}
		} else if (packetType == Packets.PacketTypes.CREATE_DRIVER_ACCOUNT) {
			// Creating accounts and adding them to the database
			const accountPacket = Packets.CreateDriverAccountPacket.fromJSONString(data);

			// Not requiring profile picture explicitly here, as it will save data sending the default from mobile.
			if (database != null && accountPacket.firstName != null && accountPacket.lastName != null && accountPacket.email != null && accountPacket.password != null && accountPacket.acctype != null) {
				database.createNewUser(accountPacket).then((createdAccount) => {
					if (createdAccount) {
						sendIfNotNull(ws, new Packets.AccountCreateSuccessPacket().toString());
					} else {
						// TODO: The error is assumed here, but we should really say exactly what went wrong (existing username, email, etc).
						sendIfNotNull(ws, new Packets.AccountCreateFailedPacket("Failed to create account, account with username / email already exists.").toString());
					}
				});
			} else {
				sendIfNotNull(ws, new Packets.AccountCreateFailedPacket("Failed to create account, account with username / email already exists.").toString());
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.PLACE_ORDER) {
			if (clientUserData.isMerchant()) {
				const placeOrderPacket = Packets.PlaceOrder.fromJSONString(data);
				const supplierIdToItemOrderArrayMap = new Map<string, Array<ItemData>>();

				// Need to check user's cart items, get the linked supplier Id's, then add that order to the database.
				for (const itemData of clientUserData.cart) {
					const supplierIdString = itemData.supplierId.toString();
					if (!supplierIdToItemOrderArrayMap.has(supplierIdString)) {
						supplierIdToItemOrderArrayMap.set(supplierIdString, []);
					}

					supplierIdToItemOrderArrayMap.get(supplierIdString)?.push(itemData);
				}

				for (const [supplierId, itemDataArray] of supplierIdToItemOrderArrayMap.entries()) {
					database.getUserDataBySupplierId(supplierId).then((supplierUserData) => {
						if (supplierUserData != null) {
							const actualItemDataArray = [];
							for (const item of itemDataArray) {
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								actualItemDataArray.push({ name: item.itemName, quantity: item.quantity, price: item.price });
							}

							const preferredDateObject = new Date(placeOrderPacket.preferredDate);
							// TODO: Periodically sweep the database and update deliveryPrice for non-completed orders.
							const daysUntilDelivery = dateDiffInDays(new Date(), preferredDateObject);
							console.log("Days until delivery: " + daysUntilDelivery);
							let deliveryPrice = 100;
							if (daysUntilDelivery >= 5) {
								deliveryPrice *= 1;
							} else if (daysUntilDelivery >= 4) {
								deliveryPrice *= 1.05;
							} else if (daysUntilDelivery >= 3) {
								deliveryPrice *= 1.075;
							} else if (daysUntilDelivery >= 2) {
								deliveryPrice *= 1.1;
							} else if (daysUntilDelivery <= 1) {
								deliveryPrice *= 1.15;
							}

							console.log("deliveryPrice: " + deliveryPrice);

							database.placeOrder(clientUserData.id, clientUserData.name, supplierId, supplierUserData.name, actualItemDataArray, supplierUserData.address, clientUserData.address, placeOrderPacket.preferredDate, deliveryPrice).then((placedOrderSuccessfully) => {
								if (placedOrderSuccessfully) {
									sendIfNotNull(ws, new Packets.PlaceOrderSuccess().toString());
								} else {
									// TODO: The error is assumed here, but we should really say exactly what went wrong.
									sendIfNotNull(ws, new Packets.PlaceOrderFailure().toString());
								}
							});
						} else {
							console.log("Couldn't get supplier by ID for place order: " + supplierId);
						}
					});
				}
			} else {
				console.log("Got invalid account type for action PLACE_ORDER: " + clientUserData.accountType);
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.GET_CART_ITEMS) {
			if (clientUserData.accountType != AccountType.DRIVER) {
				// TODO: Bad duck-tape fix to avoid having to marshal Set to JSON ourselves.
				sendIfNotNull(ws, new Packets.SetCartItems(Array.from(clientUserData.cart)));
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.ADD_CART_ITEM) {
			if (clientUserData.accountType != AccountType.DRIVER) {
				const addCartItemPacket = Packets.AddCartItem.fromJSONString(data.toString());

				database.getAllItems().then((items) => {
					let cartItemErrorMessage : string | null = null;
					let databaseItem : ItemData | null = null;

					if (items != null) {
						for (const item of items) {
							console.log("Item: " + JSON.stringify(item));
							if (item._id == addCartItemPacket.itemId) {
								const itemCartQuantity = parseInt(addCartItemPacket.quantity);
								const databaseItemQuantity = parseInt(item.quantity);

								if (databaseItemQuantity == null || isNaN(databaseItemQuantity)) {
									cartItemErrorMessage = "Invalid database quantity, please contact a system administrator.";
									console.log("Got invalid database quantity: " + item.quantity);
								}

								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								if (itemCartQuantity != null && !isNaN(itemCartQuantity) && itemCartQuantity < databaseItemQuantity) {
									// eslint-disable-next-line @typescript-eslint/ban-ts-comment
									// @ts-ignore
									databaseItem = item;
									// eslint-disable-next-line @typescript-eslint/ban-ts-comment
									// @ts-ignore
									databaseItem.quantity = itemCartQuantity;
								} else {
									// TODO: Constant string.
									console.log("Got invalid quantity: " + itemCartQuantity)
									cartItemErrorMessage = "Invalid quantity of items for cart.";
								}

								break;
							}
						}
					} else {
						cartItemErrorMessage = "No items exist to order.";
					}

					if (databaseItem == null) {
						cartItemErrorMessage = "Could not find item with id '" + addCartItemPacket.itemId + "' to order.";
					}

					if (cartItemErrorMessage == null) {
						sendIfNotNull(ws, new Packets.CartItemSuccess());
						// TODO: Reduce quantity of item in database.

						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						clientUserData.cart.add(databaseItem);
					} else {
						sendIfNotNull(ws, new Packets.CartItemFailure(cartItemErrorMessage));
					}
				});
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.REMOVE_CART_ITEM) {
			if (clientUserData.accountType != AccountType.DRIVER) {
				const removeCartItemPacket = Packets.RemoveCartItem.fromJSONString(data.toString());
				let foundCartItem : object | null = null;

				for (const cartItem of clientUserData.cart) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					if (cartItem._id == removeCartItemPacket.itemId) {
						foundCartItem = cartItem;
						break;
					}
				}

				if (foundCartItem != null) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					clientUserData.cart.delete(foundCartItem);
					sendIfNotNull(ws, new Packets.CartItemSuccess());
				} else {
					sendIfNotNull(ws, new Packets.CartItemFailure("Could not find cart item to remove."));
				}
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.UPLOAD_IMAGE) {
			const imagePacket = Packets.UploadImage.fromJSONString(data.toString());

			if (imagePacket.imageType == Packets.ImageTypes.PROFILE_PICTURE) {
				database?.updateProfilePicture(clientUserData.id, imagePacket.image).then((result) => {
					if (result) {
						console.log("PFP uploaded successfully.");
					}
					else {
						console.log("Error uploading profile picture.");
					}
				});
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.GET_CURRENT_ORDER) {
			if (clientUserData.isDriver()) {
				database?.getAllAcceptedOrdersByDriver(clientUserData.id).then((result) => {
					sendIfNotNull(ws, new Packets.SetCurrentOrder(JSON.stringify(result)));
				});
			}
			else {
				console.log("Got invalid account type for action GET_CURRENT_ORDER: " + clientUserData.accountType);
			}
		} else {
			console.log("Received invalid or unhandled packet from client: " + data.toString());
		}
	});
});