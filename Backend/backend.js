"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
var ws_1 = require("ws");
var Packets = require("../Common/packets.js");
var database_js_1 = require("./database.js");
var Strings = require("./strings.js");
var bcrypt = require("bcrypt");
var mongodb_1 = require("mongodb");
// TODO: Change to less-commonly used port ( https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports )
// 19178 should work.
// Create a WebSocketServer on port 5005 and with a maximum payload of 10 megabytes (10 bytes * 1000 kilobytes * 1000 megabytes). More options can be found here: https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback
var wss = new ws_1.WebSocket.WebSocketServer({
    port: 5005,
    maxPayload: 10 * 1000 * 1000
});
// Controls whether the system will try to interface with the database, disable for easier debugging / unrelated implementations.
var doDatabase = true;
// let database = null;
var database = null;
if (doDatabase) {
    database = new database_js_1.DatabaseHandler();
}
var AccountType;
(function (AccountType) {
    AccountType["DRIVER"] = "driver";
    AccountType["MERCHANT"] = "merchant";
    AccountType["SUPPLIER"] = "supplier";
})(AccountType || (AccountType = {}));
var UserData = /** @class */ (function () {
    function UserData(userDataJSON) {
        this.id = userDataJSON._id.toString();
        if (userDataJSON.acctype != null) {
            this.accountType = AccountType[userDataJSON.acctype.toUpperCase()];
        }
        this.email = userDataJSON.email;
        if (this.accountType == AccountType.DRIVER) {
            this.firstName = userDataJSON.firstName;
            this.lastName = userDataJSON.lastName;
        }
        else {
            this.name = userDataJSON.name;
        }
    }
    UserData.prototype.isDriver = function () {
        return this.accountType == AccountType.DRIVER;
    };
    UserData.prototype.isMerchant = function () {
        return this.accountType == AccountType.MERCHANT;
    };
    UserData.prototype.isSupplier = function () {
        return this.accountType == AccountType.SUPPLIER;
    };
    return UserData;
}());
var ItemData = /** @class */ (function () {
    function ItemData(itemId, itemData, supplierID) {
        this._id = itemId;
        this.itemName = itemData.itemName;
        this.description = itemData.description;
        this.quantity = itemData.quantity;
        this.supplierID = new mongodb_1.ObjectId(supplierID);
        this.price = itemData.price;
        this.weight = itemData.weight;
        this.postedDate = new Date();
    }
    return ItemData;
}());
function sendIfNotNull(webSocket, data) {
    if (data != null) {
        webSocket.send(data.toString());
    }
}
console.log("Server started on " + new Date().toString());
var ActiveConnection = /** @class */ (function () {
    function ActiveConnection(ws, userData, token) {
        if (userData === void 0) { userData = null; }
        if (token === void 0) { token = null; }
        this.ws = ws;
        this.token = token;
        this.userData = userData;
    }
    return ActiveConnection;
}());
// Contains all active WebSocket connection, their associated authentication token, and their database user data if they have one.
// TODO: Should periodically drop inactive connections.
var activeConnections = new Set();
function getActiveConnectionByWebSocketOrToken(webSocket, token) {
    var e_1, _a;
    if (token === void 0) { token = null; }
    console.log("IN GET ACTIVE CONNECTIONS");
    console.log("ACTIVE CONNECTIONS: " + activeConnections.size);
    try {
        for (var activeConnections_1 = __values(activeConnections), activeConnections_1_1 = activeConnections_1.next(); !activeConnections_1_1.done; activeConnections_1_1 = activeConnections_1.next()) {
            var activeConnection = activeConnections_1_1.value;
            console.log(JSON.stringify(activeConnection));
            if (activeConnection.ws == webSocket) {
                console.log("Got ActiveConnection by WebSocket: " + activeConnection.ws);
                return activeConnection;
            }
            else if (token != null && activeConnection.token === token) {
                console.log("Got ActiveConnection by token: " + activeConnection.token);
                return activeConnection;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (activeConnections_1_1 && !activeConnections_1_1.done && (_a = activeConnections_1["return"])) _a.call(activeConnections_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return null;
}
function removeActiveConnectionByWebSocketOrToken(webSocket, token) {
    var e_2, _a;
    if (token === void 0) { token = null; }
    var linkedActiveConnection = null;
    try {
        for (var activeConnections_2 = __values(activeConnections), activeConnections_2_1 = activeConnections_2.next(); !activeConnections_2_1.done; activeConnections_2_1 = activeConnections_2.next()) {
            var activeConnection = activeConnections_2_1.value;
            if (activeConnection.ws == webSocket) {
                linkedActiveConnection = activeConnection;
                break;
            }
            else if (token != null && activeConnection.token === token) {
                linkedActiveConnection = activeConnection;
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (activeConnections_2_1 && !activeConnections_2_1.done && (_a = activeConnections_2["return"])) _a.call(activeConnections_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
    if (linkedActiveConnection != null) {
        activeConnections["delete"](linkedActiveConnection);
    }
}
function addActiveConnection(webSocket, userData, token) {
    if (userData === void 0) { userData = null; }
    if (token === void 0) { token = null; }
    var newActiveConnection = new ActiveConnection(webSocket, userData, token);
    // TODO: Check if user already exists and return false if it failed.
    activeConnections.add(newActiveConnection);
    return newActiveConnection;
}
// Taken From 2/26/2023 2:31 PM: https://stackoverflow.com/a/16106759
function generateRandomAlphaNumericString(length, allowUppercase) {
    if (allowUppercase === void 0) { allowUppercase = true; }
    var text = "";
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < Math.ceil(length); i++) {
        var randomChar = charset.charAt(Math.floor(Math.random() * charset.length));
        if (allowUppercase && Math.random() >= 0.5) {
            randomChar = randomChar.toUpperCase();
        }
        text += randomChar;
    }
    return text;
}
var tokenLength = 32;
// TODO: Switch to a real token-based authentication system.
function generateToken() {
    return generateRandomAlphaNumericString(tokenLength);
}
// Create a new connection method with access to the active WebSocket connection.
wss.on("connection", function connection(ws) {
    // If an error occurs in this connection. print to the console the error.
    ws.on("error", console.error);
    ws.on("close", function () {
        // TODO: Cannot due this, as for clients which use the token authentication system, they obviously need to drop the WebSocket connection, either due to having to switch pages or screens or whatnot. We SHOULD implement a system which removes and garbage-collects the various unused connections after a period of time.
        // removeActiveConnectionByWebSocketOrToken(ws);
    });
    // Handles receiving a message from the current connection, with the data is in a buffer.
    ws.on("message", function message(data) {
        console.log("Raw Received Data: " + data);
        // TODO: This parsing required getting the JSON JavaScript object to check the type parameter. At the very least, this will check if the JSON is valid, but that is already being done when parsing fromJsonString(). Slightly inefficient, so maybe having a way to construct a Packet from a JSON JavaScript object might want to be looked into / parsing the packet type using string manipulation (would be much, much faster).
        // Attempt to parse the packet type from the data.
        var packetJSONObject = Packets.parseJSON(data);
        var packetType = Packets.tryGet(packetJSONObject, Packets.Constants.TYPE);
        if (packetType == null) {
            // TODO: Check that console.log is immune to unsanitized data, as invalid data might be some sort of attack. Might want to temporarily block them for a period of time.
            console.log("Received invalid packet: " + data);
            console.log("Len: " + data.toString().length);
            return;
        }
        console.log("Got packet of type: " + packetType);
        console.log("Packet token: " +
            Packets.tryGet(packetJSONObject, Packets.Constants.TOKEN));
        var activeConnection = getActiveConnectionByWebSocketOrToken(ws, Packets.tryGet(packetJSONObject, Packets.Constants.TOKEN));
        if (activeConnection != null) {
            // TODO: This could be a security vulnerability if someone manages to spoof the token of a client, so checking other potential indicators such as IP address / geolocation of IP might help to ensure that simple spoofing attacks cannot be exploited.
            if (activeConnection.ws != ws) {
                activeConnection.ws = ws;
            }
        }
        else if (packetType != Packets.PacketTypes.LOGIN &&
            packetType != Packets.PacketTypes.CREATE_ACCOUNT) {
            console.error("Failed to get active connection from WebSocket for packet which requires active connection. Closing connection.");
            ws.close();
            return;
        }
        var clientUserData = activeConnection != null ? activeConnection.userData : null;
        var isClientAuthenticated = clientUserData != null;
        console.log("Is client authenticated: " + isClientAuthenticated);
        // TODO: What happens if the user sends two login packets at once?
        if (packetType == Packets.PacketTypes.LOGIN) {
            // TODO: If the client fails to send a valid login packet after a few attempts, they should be blocked from connecting for a period to avoid DOS attacks.
            var loginPacket_1 = Packets.LoginPacket.fromJSONString(data);
            if (database != null &&
                loginPacket_1.email != null &&
                loginPacket_1.password != null) {
                // TODO: These might want to be split off into their own file to reduce the clutter in this file. Not sure how we want to structure the Backend server yet though.
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                database
                    .getUserData(loginPacket_1.email)
                    .then(function (userDataJSON) {
                    if (userDataJSON != null) {
                        // bcrypt.compare is actually asynchronous, with a function callback (the '(err, result)' part of the function call), so it doesn't block execution, allowing the script to flow past it into error checking before we've confirmed the password was valid. Therefore, we need to do any error broadcasting INSIDE the bcrypt function for password errors, rather than being able to do all error messages at the end. Another example of some of the strange behavior and potential logical bugs in writing async JavaScript code.
                        // TODO: Should check error?
                        bcrypt.compare(loginPacket_1.password, userDataJSON.password, function (err, result) {
                            if (result) {
                                console.log("Got valid login: " +
                                    loginPacket_1.email +
                                    " " +
                                    loginPacket_1.password);
                                if (activeConnection == null) {
                                    activeConnection = addActiveConnection(ws);
                                }
                                // Add the current WebSocket connection, mapping the active connection to their userData from the database.
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                var loginUserData = new UserData(userDataJSON);
                                // Modify the activeConnection to include the database user data and their new token.
                                activeConnection.userData = loginUserData;
                                activeConnection.token = generateToken();
                                // Packet Structure Example: {"type": "authentication_success", "acctype": "driver", "token": "rhog4sm4ep3vsl35a37ff3n1giociu78"} or {"type": "authentication_success", "acctype": "driver", "token": null}
                                // Send to the user that their authentication was successfull, returning the account type they signed up with and their associated token. Token can be used to authenticate the user in the case that the websocket connection cannot be kept alive.
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                sendIfNotNull(ws, new Packets.AuthenticationSuccessPacket(loginUserData.accountType, activeConnection.token));
                            }
                            else {
                                console.log("Got invalid password: " +
                                    loginPacket_1.email +
                                    " " +
                                    loginPacket_1.password);
                                sendIfNotNull(ws, new Packets.AuthenticationFailedPacket(Strings.Strings.INVALID_PASSWORD));
                            }
                        });
                    }
                    else {
                        console.log("Got invalid login: " +
                            loginPacket_1.email +
                            " " +
                            loginPacket_1.password);
                        sendIfNotNull(ws, new Packets.AuthenticationFailedPacket(Strings.Strings.INVALID_LOGIN));
                    }
                })["catch"](function (error) {
                    console.log("Got invalid login: " +
                        loginPacket_1.email +
                        " " +
                        loginPacket_1.password);
                    sendIfNotNull(ws, new Packets.AuthenticationFailedPacket(Strings.Strings.INVALID_EMAIL));
                });
            }
            else {
                // In this case, the JSON itself didn't contain a username or password. Hopefully, this will never happen due to clientside input verification, but if it does, we'll catch it.
                console.log("Got invalid login");
                sendIfNotNull(ws, new Packets.AuthenticationFailedPacket(Strings.Strings.INVALID_LOGIN));
            }
        }
        else if (isClientAuthenticated &&
            packetType == Packets.PacketTypes.GET_LINKED_ORDERS) {
            if (clientUserData.isDriver()) {
                database === null || database === void 0 ? void 0 : database.getAllOrdersByDriver(clientUserData.id).then(function (orders) {
                    sendIfNotNull(ws, new Packets.SetLinkedOrders(JSON.stringify(orders)));
                });
            }
            else if (clientUserData.isMerchant()) {
                database === null || database === void 0 ? void 0 : database.getAllOrdersByMerchant(clientUserData.id).then(function (orders) {
                    sendIfNotNull(ws, new Packets.SetLinkedOrders(JSON.stringify(orders)));
                });
            }
            else if (clientUserData.isSupplier()) {
                database === null || database === void 0 ? void 0 : database.getAllOrdersBySupplier(clientUserData.id).then(function (orders) {
                    sendIfNotNull(ws, new Packets.SetLinkedOrders(JSON.stringify(orders)));
                });
            }
            else {
                console.log("Got invalid account type for user data: '" +
                    clientUserData.accountType +
                    "'");
            }
        }
        else if (isClientAuthenticated &&
            packetType == Packets.PacketTypes.GET_ALL_CONFIRMED_ORDERS) {
            if (clientUserData.isDriver()) {
                database === null || database === void 0 ? void 0 : database.getAllConfirmedOrdersForDriver().then(function (orders) {
                    sendIfNotNull(ws, new Packets.SetAllConfirmedOrders(JSON.stringify(orders)));
                });
            }
            else if (clientUserData.isMerchant()) {
                database === null || database === void 0 ? void 0 : database.getAllConfirmedOrdersByMerchant(clientUserData.id).then(function (orders) {
                    sendIfNotNull(ws, new Packets.SetAllConfirmedOrders(JSON.stringify(orders)));
                });
            }
            else if (clientUserData.isSupplier()) {
                database === null || database === void 0 ? void 0 : database.getAllConfirmedOrdersBySupplier(clientUserData.id).then(function (orders) {
                    sendIfNotNull(ws, new Packets.SetAllConfirmedOrders(JSON.stringify(orders)));
                });
            }
            else {
                console.log("Got invalid account type for user data: '" +
                    clientUserData.accountType +
                    "'");
            }
        }
        else if (isClientAuthenticated &&
            packetType == Packets.PacketTypes.GET_ALL_COMPLETED_ORDERS) {
            if (clientUserData.isDriver()) {
                database === null || database === void 0 ? void 0 : database.getAllCompletedOrdersByDriver().then(function (orders) {
                    sendIfNotNull(ws, new Packets.SetAllCompletedOrders(JSON.stringify(orders)));
                });
            }
            else if (clientUserData.isMerchant()) {
                database === null || database === void 0 ? void 0 : database.getAllCompletedOrdersByMerchant().then(function (orders) {
                    sendIfNotNull(ws, new Packets.SetAllCompletedOrders(JSON.stringify(orders)));
                });
            }
            else if (clientUserData.isSupplier()) {
                database === null || database === void 0 ? void 0 : database.getAllCompletedOrdersBySupplier().then(function (orders) {
                    sendIfNotNull(ws, new Packets.SetAllCompletedOrders(JSON.stringify(orders)));
                });
            }
            else {
                console.log("Got invalid account type for user data: " +
                    clientUserData.accountType);
            }
            //Retrieves items from the database based on chosen supplier
        }
        else if (isClientAuthenticated &&
            packetType == Packets.PacketTypes.GET_LINKED_ITEMS) {
            if (clientUserData.isSupplier()) {
                database === null || database === void 0 ? void 0 : database.getItemsBySupplier(clientUserData.id).then(function (items) {
                    sendIfNotNull(ws, new Packets.SetLinkedItems(JSON.stringify(items)));
                });
            }
            else if (clientUserData.isMerchant()) {
                database === null || database === void 0 ? void 0 : database.getAllItems().then(function (items) {
                    sendIfNotNull(ws, new Packets.SetLinkedItems(JSON.stringify(items)));
                });
            }
            else {
                console.log("Got invalid account type for action GET_LINKED_ORDERS: " +
                    clientUserData.accountType);
            }
            //Adding new items into the database, suppliers only
        }
        else if (isClientAuthenticated &&
            packetType == Packets.PacketTypes.ADD_ITEM) {
            if (clientUserData.isSupplier()) {
                var addItemPacket = Packets.AddItem.fromJSONString(data);
                var item = new ItemData(null, addItemPacket, clientUserData.id);
                database === null || database === void 0 ? void 0 : database.insertNewItem(item).then(function (addedSuccessfully) {
                    if (addedSuccessfully) {
                        sendIfNotNull(ws, new Packets.ItemUpdateSuccess().toString());
                    }
                    else {
                        sendIfNotNull(ws, new Packets.ItemUpdateFailed().toString());
                    }
                });
            }
            else {
                console.log("Got invalid account type for action ADD_ITEM: " +
                    clientUserData.accountType);
            }
            //Removing items from the database, suppliers only
        }
        else if (isClientAuthenticated &&
            packetType == Packets.PacketTypes.REMOVE_ITEM) {
            if (clientUserData.isSupplier()) {
                var removeItemPacket = Packets.RemoveItem.fromJSONString(data);
                database === null || database === void 0 ? void 0 : database.removeItem(removeItemPacket.itemId).then(function (removedSuccessfully) {
                    if (removedSuccessfully) {
                        sendIfNotNull(ws, new Packets.ItemUpdateSuccess().toString());
                    }
                    else {
                        sendIfNotNull(ws, new Packets.ItemUpdateFailed().toString());
                    }
                });
            }
            else {
                console.log("Got invalid account type for action REMOVE_ITEM: " +
                    clientUserData.accountType);
            }
            //Creating accounts and adding them to the database
        }
        else if (isClientAuthenticated &&
            packetType == Packets.PacketTypes.UPDATE_STATUS) {
            // TODO: Kinda a security concern, as the ObjectID for orders could potentially be spoofed. Should check if the order they are editing can actually be seen by them.
            var updateStatus = Packets.UpdateStatus.fromJSONString(data);
            if (updateStatus.status == Packets.Status.ACCEPTED) {
                database === null || database === void 0 ? void 0 : database.acceptOrder(updateStatus.orderID);
            }
            else if (updateStatus.status == Packets.Status.CANCELLED) {
                database === null || database === void 0 ? void 0 : database.cancelOrder(updateStatus.orderID);
            }
            else if (updateStatus.status == Packets.Status.COMPLETED) {
                database === null || database === void 0 ? void 0 : database.completeOrder(updateStatus.orderID);
            }
            else if (updateStatus.status == Packets.Status.CONFIRMED) {
                database === null || database === void 0 ? void 0 : database.confirmOrder(updateStatus.orderID);
            }
            else if (updateStatus.status == Packets.Status.DENIED) {
                // TODO:
                // database?.denyOrder(updateStatus.orderID);
            }
            else if (updateStatus.status == Packets.Status.IN_TRANSIT) {
                // database?.(updateStatus.orderID);
                // TODO: Apply transit
            }
            else if (updateStatus.status == Packets.Status.PENDING) {
                // TODO: Something
            }
            else if (updateStatus.status == Packets.Status.REJECTED) {
                // database?.(updateStatus.orderID);
                // TODO
            }
        }
        else if (packetType == Packets.PacketTypes.UPDATE_ITEM) {
            if (clientUserData === null || clientUserData === void 0 ? void 0 : clientUserData.isSupplier()) {
                var updateItemPacket = Packets.UpdateItem.fromJSONString(data);
                var item = new ItemData(updateItemPacket.itemId, updateItemPacket, clientUserData.id);
                database === null || database === void 0 ? void 0 : database.updateItem(item).then(function (updatedSuccessfully) {
                    if (updatedSuccessfully) {
                        sendIfNotNull(ws, new Packets.ItemUpdateSuccess().toString());
                    }
                    else {
                        sendIfNotNull(ws, new Packets.ItemUpdateFailed().toString());
                    }
                });
            }
            //Creating accounts and adding them to the database
        }
        else if (isClientAuthenticated &&
            packetType == Packets.PacketTypes.GET_USER_DATA) {
            database === null || database === void 0 ? void 0 : database.getUserData(clientUserData.email).then(function (object) {
                sendIfNotNull(ws, new Packets.SetUserData(JSON.stringify(object)));
            });
            //Creating accounts and adding them to the database
        }
        else if (packetType == Packets.PacketTypes.CREATE_ACCOUNT) {
            var accountPacket = Packets.CreateAccountPacket.fromJSONString(data);
            if (database != null &&
                accountPacket.email != null &&
                accountPacket.password != null &&
                accountPacket.acctype != null) {
                database.createNewUser(accountPacket).then(function (createdAccount) {
                    if (createdAccount) {
                        sendIfNotNull(ws, new Packets.AccountCreateSuccessPacket().toString());
                    }
                    else {
                        // TODO: The error is assumed here, but we should really say exactly what went wrong (existing username, email, etc).
                        sendIfNotNull(ws, new Packets.AccountCreateFailedPacket("Failed to create account, account with username / email already exists.").toString());
                    }
                });
            }
        }
        else {
            console.log("Received invalid or unhandled packet from client: " + data.toString());
        }
    });
});
