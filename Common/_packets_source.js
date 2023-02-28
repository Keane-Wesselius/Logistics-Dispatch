// Essentially, Rollup 'compiles' a JavaScript module which can be used in both Node and the browser (Expo), which will be required for this project and utilizes Rollup ( https://rollupjs.org )

// Contains constant names for JSON tags.
export const Constants = {
	NAME: "name",
	USERNAME: "username",
	EMAIL: "email",
	PASSWORD: "password",
	ACCTYPE: "acctype",
	AREA: "area",
	TYPE: "type",
	ERROR_MESSAGE: "errorMessage",
	ORDER_ID: "orderId",
	MERCHANT_ID: "merchantId",
	SUPPLIER_ID: "supplierId",
	DRIVER_ID: "driverId",
	STATUS: "status",
	TOKEN: "token",
};

// TODO: Create a dictionary of PacketTypes to Packet classes for easy casting / parsing.

// Contains function names, essentially Packet types.
export const PacketTypes = {
	LOGIN: "login",
	AUTHENTICATION_SUCCESS: "authenticationSuccess",
	AUTHENTICATION_FAILED: "authenticationFailed",

	CREATE_ACCOUNT: "createAccount",
	ACCOUNT_CREATE_SUCCESS: "accountCreateSuccess",
	ACCOUNT_CREATE_FAILED: "accountCreateFailed",

	GET_LINKED_ORDERS: "getLinkedOrders",
	SET_LINKED_ORDERS: "setLinkedOrders",

	GET_LINKED_ITEMS: "getLinkedItems",
	SET_LINKED_ITEMS: "setLinkedItems",

	GET_USER_DATA: "getUserData",
	SET_USER_DATA: "setUserData",

	UPDATE_ORDER_STATUS: "updateStatus",
	UPDATE_ORDER_STATUS_SUCCESS: "updateStatusSuccess",
	UPDATE_ORDER_STATUS_FAILED: "updateStatusFailed",

	GET_ALL_CONFIRMED_ORDERS: "getAllConfirmedOrders",
	SET_ALL_CONFIRMED_ORDERS: "setAllConfirmedOrders",

	GET_ALL_ORDERS: "getAllOrders",
	SET_ALL_ORDERS: "setAllOrders",

	ADD_ITEM: "addItem",
	REMOVE_ITEM: "removeItem",
	UPDATE_ITEM: "updateItem",
	UPDATE_ITEM_SUCCESS: "updateItemSuccess",
	UPDATE_ITEM_FAILED: "updateItemFailed",
};

export const Status = {
	// Merchant has placed an order, has not been confirmed by supplier.
	PENDING: "pending",
	// Cancelled by merchant
	CANCELLED: "cancelled",
	// Confirmed by supplier, ready to be accepted by driver.
	CONFIRMED: "confirmed",
	// Denied by supplier.
	DENIED: "denied",
	// Accepted by driver, in transit for delivery.
	ACCEPTED: "accepted",
	// Rejected by driver (after they have accepted it, before they've started the delivery, maybe 1 hour grace period).
	REJECTED: "rejected",
	// Driver has picked up load, is delivering it.
	IN_TRANSIT: "inTransit",
	// TODO: System not built to handle any other status / condition by this point.
	// Successfully delivered and finished.
	COMPLETED: "completed",
};

export const ItemValues = {
	ITEM_ID: "itemId",
	ITEM_NAME: "itemName",
	DESCRIPTION: "description",
	QUANTITY: "quantity",
	PRICE: "price",
	WEIGHT: "weight"
};

// Helper Functions
export function tryGet(object, field) {
	try {
		return object[field];
	} catch (ignored) {
	}

	return null;
}

// Helper method for when / if we need more security / data sanitization in the future.
export function parseJSON(jsonString) {
	try {
		// jsonString, if passed from the 'data' in WebSockets, might not actually be a string, so call the toString method to ensure it is.
		// TODO: Ensure toString() is secure.
		jsonString = jsonString.toString();

		// 5000 characters is kinda an arbitrary limit, but it should prevent some attacks from receiving a large string which requires many CPU cycles to parse, resulting in a DOS attack.
		if (jsonString != null && jsonString.length <= 5000) {
			return JSON.parse(jsonString);
		}
	} catch (ignored) {
	}

	return null;
}

export function getPacketType(jsonString) {
	const jsonObject = parseJSON(jsonString);
	return tryGet(jsonObject, Constants.TYPE);
}
// End Helper Functions

// Packet classes have two primary functions: converting from JSON into a valid, secure JavaScript object and converting back into JSON to be sent over WebSockets.
// When parsed from JSON, the returned JavaScript object should be validated to ensure no unsanitized data is allowed into the system. By the point the variable is set in the object, the data MUST be able to be assumed to be fully sanitized and safe.
class Packet {
	constructor(type, token = null) {
		this.type = type;
		this.token = token;
	}

	// Overrides the base toString() method, which is desirable for our application.
	toString() {
		try {
			return JSON.stringify(this);
		} catch (ignored) {
		}

		return null;
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new Packet(tryGet(jsonObject, Constants.TYPE), tryGet(jsonObject, Constants.TOKEN));
	}
}

// JSONPacket classes don't hold any JavaScript data and just help to ensure jsonStrings are passed with the correct 'type' parameter.
class JSONPacket extends Packet {
	constructor(type, jsonString) {
		super(type);
		this.jsonString = jsonString;
	}

	// Overrides the base toString() method, which is desirable for our application.
	toString() {
		let jsonObject = parseJSON(this.jsonString);
		// In the case of a null return from the database (which is the standard return value), set the data parameter of the return packet to an empty list for ease of use.
		if (jsonObject == null) {
			jsonObject = [];
		}

		// Construct a new JSONObject with the type of this JSONPacket and a single field 'data' which contains the original JSONObject passed to the JSONPacket.
		const finalJSONObject = { type: this.type, data: jsonObject };

		try {
			return JSON.stringify(finalJSONObject);
		} catch (ignored) {
		}

		return null;
	}

	static fromJSONString(jsonString) {
		return new JSONPacket(jsonString);
	}
}

export class LoginPacket extends Packet {
	constructor(email, password) {
		super(PacketTypes.LOGIN);

		// TODO: Sanitize
		this.email = email;
		this.password = password;
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new LoginPacket(tryGet(jsonObject, Constants.EMAIL), tryGet(jsonObject, Constants.PASSWORD));
	}
}

export class CreateAccountPacket extends Packet {
	constructor(name, email, password, acctype) {
		super(PacketTypes.CREATE_ACCOUNT);

		this.name = name;
		this.email = email;
		this.password = password;
		this.acctype = acctype;
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new CreateAccountPacket(tryGet(jsonObject, Constants.NAME), tryGet(jsonObject, Constants.EMAIL), tryGet(jsonObject, Constants.PASSWORD), tryGet(jsonObject, Constants.ACCTYPE));
	}
}

export class AccountCreateFailedPacket extends Packet {
	constructor(errorMessage) {
		super(PacketTypes.ACCOUNT_CREATE_FAILED);

		this.errorMessage = errorMessage;
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new AccountCreateFailedPacket(tryGet(jsonObject, Constants.ERROR_MESSAGE));
	}
}

export class AccountCreateSuccessPacket extends Packet {
	constructor() {
		super(PacketTypes.ACCOUNT_CREATE_SUCCESS);
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new AccountCreateSuccessPacket();
	}
}

export class AuthenticationFailedPacket extends Packet {
	constructor(errorMessage) {
		super(PacketTypes.AUTHENTICATION_FAILED);

		// TODO: Sanitize
		this.errorMessage = errorMessage;
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new AuthenticationFailedPacket(tryGet(jsonObject, Constants.ERROR_MESSAGE));
	}
}

// TODO: Probably should send back more of the user information rather than an empty packet.
export class AuthenticationSuccessPacket extends Packet {
	constructor(accountType, token = null) {
		super(PacketTypes.AUTHENTICATION_SUCCESS);

		this.acctype = accountType;
		this.token = token;
	}

	static fromJSONString(jsonString) {
		// TODO: Doesn't do anything, as AuthenticationSuccessPacket is an empty packet.
		const jsonObject = parseJSON(jsonString);
		return new AuthenticationSuccessPacket(tryGet(jsonObject, Constants.ACCTYPE), tryGet(jsonObject, Constants.TOKEN));
	}
}

// TODO: Not an actual implementation, but shows how the schemes should work. If do not want the user to be able to select what area they are seeing the active jobs from, we should make this an empty packet.
export class GetLinkedOrders extends Packet {
	constructor(token = null) {
		super(PacketTypes.GET_LINKED_ORDERS, token);
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new GetLinkedOrders(tryGet(jsonObject, Constants.TOKEN));
	}
}

export class SetLinkedOrders extends JSONPacket {
	constructor(jsonString) {
		super(PacketTypes.SET_LINKED_ORDERS, jsonString);
	}

	static fromJSONString(jsonString) {
		return new SetLinkedOrders(jsonString);
	}
}

export class GetUserData extends Packet {
	constructor(token = null) {
		super(PacketTypes.GET_USER_DATA, token);
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new GetUserData(tryGet(jsonObject, Constants.TOKEN));
	}
}

export class SetUserData extends JSONPacket {
	constructor(jsonString) {
		super(PacketTypes.SET_USER_DATA, jsonString);
	}

	static fromJSONString(jsonString) {
		return new SetUserData(jsonString);
	}
}

export class GetAllConfirmedOrders extends Packet {
	constructor(token = null) {
		super(PacketTypes.GET_ALL_CONFIRMED_ORDERS, token);
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new GetAllConfirmedOrders(tryGet(jsonObject, Constants.TOKEN));
	}
}

export class SetAllConfirmedOrders extends JSONPacket {
	constructor(jsonString) {
		super(PacketTypes.SET_ALL_CONFIRMED_ORDERS, jsonString);
	}

	static fromJSONString(jsonString) {
		return new SetAllConfirmedOrders(jsonString);
	}
}

export class UpdateStatus extends Packet {
	constructor(orderID, status, token = null) {
		super(PacketTypes.UPDATE_ORDER_STATUS, token);

		// TODO: Sanitize
		this.orderID = orderID;
		// TODO: Check if 'status' is a valid enum value.
		this.status = status;
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new UpdateStatus(tryGet(jsonObject, Constants.ORDER_ID), tryGet(jsonObject, Constants.STATUS), tryGet(jsonObject, Constants.TOKEN));
	}
}

// TODO: SetActiveJobsPacket, which will send the result of backend.getAllJobs(), which should be an JSON array containing all the jobs.

export class AddItem extends Packet {
	constructor(itemName, description, quantity, price, weight, token = null) {
		super(PacketTypes.ADD_ITEM, token);

		this.itemName = itemName;
		this.description = description;
		this.quantity = quantity;
		this.price = price;
		this.weight = weight;
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new AddItem(itemName = tryGet(jsonObject, ItemValues.ITEM_NAME), description = tryGet(jsonObject, ItemValues.DESCRIPTION), quantity = tryGet(jsonObject, ItemValues.QUANTITY), price = tryGet(jsonObject, ItemValues.PRICE), weight = tryGet(jsonObject, ItemValues.WEIGHT), token = tryGet(jsonObject, Constants.TOKEN));
	}
}

export class RemoveItem extends Packet {
	constructor(itemId, token = null) {
		super(PacketTypes.REMOVE_ITEM, token);

		this.itemId = itemId;
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new RemoveItem(tryGet(jsonObject, ItemValues.ITEM_ID), tryGet(jsonObject, Constants.TOKEN));
	}
}

export class UpdateItem extends Packet {
	constructor(itemId, itemName, description, quantity, price, weight, token = null) {
		super(PacketTypes.UPDATE_ITEM, token);

		this.itemId = itemId;
		this.itemName = itemName;
		this.description = description;
		this.quantity = quantity;
		this.price = price;
		this.weight = weight;
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new UpdateItem(itemId = tryGet(jsonObject, ItemValues.ITEM_ID), itemName = tryGet(jsonObject, ItemValues.ITEM_NAME), description = tryGet(jsonObject, ItemValues.DESCRIPTION), quantity = tryGet(jsonObject, ItemValues.QUANTITY), price = tryGet(jsonObject, ItemValues.PRICE), weight = tryGet(jsonObject, ItemValues.WEIGHT), token = tryGet(jsonObject, Constants.TOKEN));
	}
}

export class GetLinkedItems extends Packet {
	constructor(token = null) {
		super(PacketTypes.GET_LINKED_ITEMS, token);
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new GetLinkedItems(tryGet(jsonObject, Constants.TOKEN));
	}
}

export class SetLinkedItems extends JSONPacket {
	constructor(jsonString) {
		super(PacketTypes.SET_LINKED_ITEMS, jsonString);
	}

	static fromJSONString(jsonString) {
		return new SetLinkedOrders(jsonString);
	}
}

export class ItemUpdateSuccess extends Packet {
	constructor() {
		super(PacketTypes.UPDATE_ITEM_SUCCESS);
	}

	static fromJSONString(jsonString) {
		return new ItemUpdateSuccess();
	}
}

export class ItemUpdateFailed extends Packet {
	constructor() {
		super(PacketTypes.UPDATE_ITEM_FAILED);
	}

	static fromJSONString(jsonString) {
		return new ItemUpdateFailed();
	}
}

export class GetAllOrders extends Packet {
	constructor(token = null) {
		super(PacketTypes.GET_ALL_ORDERS, token);
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new GetAllOrders(tryGet(jsonObject, Constants.TOKEN));
	}
}

export class SetAllOrders extends JSONPacket {
	constructor(jsonString) {
		super(PacketTypes.SET_ALL_ORDERS, jsonString);
	}

	static fromJSONString(jsonString) {
		return new SetAllOrders(jsonString);
	}
}