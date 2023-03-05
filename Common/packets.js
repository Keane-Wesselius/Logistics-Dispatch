(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Packets = {}));
})(this, (function (exports) { 'use strict';

	// Essentially, Rollup 'compiles' a JavaScript module which can be used in both Node and the browser (Expo), which will be required for this project and utilizes Rollup ( https://rollupjs.org )

	// Contains constant names for JSON tags.
	const Constants = {
		NAME: "name",
		FIRST_NAME: "firstName",
		LAST_NAME: "lastName",
		USERNAME: "username",
		EMAIL: "email",
		PASSWORD: "password",
		ACCTYPE: "acctype",
		PROFILE_PICTURE: "profilePicture",
		AREA: "area",
		TYPE: "type",
		ERROR_MESSAGE: "errorMessage",
		ORDER_ID: "orderId",
		MERCHANT_ID: "merchantId",
		SUPPLIER_ID: "supplierId",
		DRIVER_ID: "driverId",
		STATUS: "status",
		TOKEN: "token",
		ADDRESS: "address",
		STARTING_ADDRESS: "startingAddress",
		ENDING_ADDRESS: "endingAddress",
		ESTIMATED_DELIVERY_DATE: "estimatedDeliveryDate",
		MINIMUM_DELIVERY_PRICE: "minimumDeliveryPrice",
		MAXIMUM_DELIVERY_PRICE: "maximumDeliveryPrice",
		ITEM_ID_LIST: "itemIdList",
		ITEM_LIST: "itemList",
		ITEM_ID: "itemId",
		QUANTITY: "quantity",
		LINKED_ID: "linkedId",
		IMAGE_TYPE: "imageType",
		IMAGE: "image",
	};

	// TODO: Create a dictionary of PacketTypes to Packet classes for easy casting / parsing.

	// Contains function names, essentially Packet types.
	const PacketTypes = {
		LOGIN: "login",
		AUTHENTICATION_SUCCESS: "authenticationSuccess",
		AUTHENTICATION_FAILED: "authenticationFailed",

		CREATE_ACCOUNT: "createAccount",
		CREATE_DRIVER_ACCOUNT: "createDriverAccount",
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
		UPDATE_ORDER_STATUS_FAILURE: "updateStatusFailure",

		GET_ALL_CONFIRMED_ORDERS: "getAllConfirmedOrders",
		SET_ALL_CONFIRMED_ORDERS: "setAllConfirmedOrders",

		GET_ALL_COMPLETED_ORDERS: "getAllCompletedOrders",
		SET_ALL_COMPLETED_ORDERS: "setAllCompletedOrders",

		GET_ALL_ORDERS: "getAllOrders",
		SET_ALL_ORDERS: "setAllOrders",

		ADD_ITEM: "addItem",
		REMOVE_ITEM: "removeItem",
		UPDATE_ITEM: "updateItem",
		UPDATE_ITEM_SUCCESS: "updateItemSuccess",
		UPDATE_ITEM_FAILED: "updateItemFailed",

		PLACE_ORDER: "placeOrder",
		PLACE_ORDER_SUCCESS: "placeOrderSuccess",
		PLACE_ORDER_FAILURE: "placeOrderFailure",

		GET_CART_ITEMS: "getCartItems",
		SET_CART_ITEMS: "setCartItems",
		ADD_CART_ITEM: "addCartItem",
		REMOVE_CART_ITEM: "removeCartItem",
		CART_ITEM_SUCCESS: "cartItemSuccess",
		CART_ITEM_FAILURE: "cartItemFailure",

		UPLOAD_IMAGE: "uploadImage",
	};

	const Status = {
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

	const ItemValues = {
		ITEM_ID: "itemId",
		ITEM_NAME: "itemName",
		DESCRIPTION: "description",
		QUANTITY: "quantity",
		PRICE: "price",
		WEIGHT: "weight"
	};

	const ImageTypes = {
		SIGNATURE: "signature",
		PROFILE_PICTURE: "profilePicture",
	};

	// Helper Functions
	function tryGet(object, field) {
		try {
			return object[field];
		} catch (ignored) {
		}

		return null;
	}

	// Helper method for when / if we need more security / data sanitization in the future.
	function parseJSON(jsonString) {
		try {
			// jsonString, if passed from the 'data' in WebSockets, might not actually be a string, so call the toString method to ensure it is.
			// TODO: Ensure toString() is secure.
			jsonString = jsonString.toString();

			// 5000 characters is kinda an arbitrary limit, but it should prevent some attacks from receiving a large string which requires many CPU cycles to parse, resulting in a DOS attack.
			if (jsonString != null && jsonString.length <= 500000) {
				return JSON.parse(jsonString);
			}
		} catch (ignored) {
		}

		return null;
	}

	function getPacketType(jsonString) {
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

	class LoginPacket extends Packet {
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

	class CreateAccountPacket extends Packet {
		constructor(name, email, password, acctype, address) {
			super(PacketTypes.CREATE_ACCOUNT);

			this.name = name;
			this.email = email;
			this.password = password;
			this.acctype = acctype;
			this.address = address;
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new CreateAccountPacket(tryGet(jsonObject, Constants.NAME), tryGet(jsonObject, Constants.EMAIL), tryGet(jsonObject, Constants.PASSWORD), tryGet(jsonObject, Constants.ACCTYPE), tryGet(jsonObject, Constants.ADDRESS));
		}
	}

	class CreateDriverAccountPacket extends Packet {
		constructor(firstName, lastName, email, password, acctype, profilePicture) {
			super(PacketTypes.CREATE_DRIVER_ACCOUNT);

			this.firstName = firstName;
			this.lastName = lastName;
			this.email = email;
			this.password = password;
			this.acctype = acctype;
			this.profilePicture = profilePicture;
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new CreateDriverAccountPacket(tryGet(jsonObject, Constants.FIRST_NAME), tryGet(jsonObject, Constants.LAST_NAME), tryGet(jsonObject, Constants.EMAIL), tryGet(jsonObject, Constants.PASSWORD), tryGet(jsonObject, Constants.ACCTYPE), tryGet(jsonObject, Constants.PROFILE_PICTURE));
		}
	}

	class AccountCreateFailedPacket extends Packet {
		constructor(errorMessage) {
			super(PacketTypes.ACCOUNT_CREATE_FAILED);

			this.errorMessage = errorMessage;
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new AccountCreateFailedPacket(tryGet(jsonObject, Constants.ERROR_MESSAGE));
		}
	}

	class AccountCreateSuccessPacket extends Packet {
		constructor() {
			super(PacketTypes.ACCOUNT_CREATE_SUCCESS);
		}

		static fromJSONString(jsonString) {
			parseJSON(jsonString);
			return new AccountCreateSuccessPacket();
		}
	}

	class AuthenticationFailedPacket extends Packet {
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
	class AuthenticationSuccessPacket extends Packet {
		constructor(accountType, token = null) {
			super(PacketTypes.AUTHENTICATION_SUCCESS);

			this.acctype = accountType;
			this.token = token;
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new AuthenticationSuccessPacket(tryGet(jsonObject, Constants.ACCTYPE), tryGet(jsonObject, Constants.TOKEN));
		}
	}

	// TODO: Not an actual implementation, but shows how the schemes should work. If do not want the user to be able to select what area they are seeing the active jobs from, we should make this an empty packet.
	class GetLinkedOrders extends Packet {
		constructor(token = null) {
			super(PacketTypes.GET_LINKED_ORDERS, token);
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new GetLinkedOrders(tryGet(jsonObject, Constants.TOKEN));
		}
	}

	class SetLinkedOrders extends JSONPacket {
		constructor(jsonString) {
			super(PacketTypes.SET_LINKED_ORDERS, jsonString);
		}

		static fromJSONString(jsonString) {
			return new SetLinkedOrders(jsonString);
		}
	}

	class GetUserData extends Packet {
		constructor(token = null) {
			super(PacketTypes.GET_USER_DATA, token);
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new GetUserData(tryGet(jsonObject, Constants.TOKEN));
		}
	}

	class SetUserData extends JSONPacket {
		constructor(jsonString) {
			super(PacketTypes.SET_USER_DATA, jsonString);
		}

		static fromJSONString(jsonString) {
			return new SetUserData(jsonString);
		}
	}

	class GetAllConfirmedOrders extends Packet {
		constructor(token = null) {
			super(PacketTypes.GET_ALL_CONFIRMED_ORDERS, token);
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new GetAllConfirmedOrders(tryGet(jsonObject, Constants.TOKEN));
		}
	}

	class SetAllConfirmedOrders extends JSONPacket {
		constructor(jsonString) {
			super(PacketTypes.SET_ALL_CONFIRMED_ORDERS, jsonString);
		}

		static fromJSONString(jsonString) {
			return new SetAllConfirmedOrders(jsonString);
		}
	}

	class GetAllCompletedOrders extends JSONPacket {
		constructor(token = null) {
			super(PacketTypes.GET_ALL_COMPLETED_ORDERS, token);
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new GetAllCompletedOrders(tryGet(jsonObject, Constants.TOKEN))
		}
	}

	class SetAllCompletedOrders extends JSONPacket {
		constructor(jsonString) {
			super(PacketTypes.SET_ALL_COMPLETED_ORDERS, jsonString);
		}

		static fromJSONString(jsonString) {
			return new SetAllCompletedOrders(jsonString);
		}
	}

	class UpdateOrderStatus extends Packet {
		constructor(orderID, status, token = null) {
			super(PacketTypes.UPDATE_ORDER_STATUS, token);

			// TODO: Sanitize
			this.orderId = orderID;
			// TODO: Check if 'status' is a valid enum value.
			this.status = status;
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new UpdateOrderStatus(tryGet(jsonObject, Constants.ORDER_ID), tryGet(jsonObject, Constants.STATUS), tryGet(jsonObject, Constants.TOKEN));
		}
	}

	class UpdateOrderStatusSuccess extends Packet {
		constructor() {
			super(PacketTypes.UPDATE_ORDER_STATUS_SUCCESS);
		}

		static fromJSONString(jsonString) {
			return new UpdateOrderStatusSuccess();
		}
	}

	class UpdateOrderStatusFailure extends Packet {
		constructor() {
			super(PacketTypes.UPDATE_ORDER_STATUS_FAILURE);
		}

		static fromJSONString(jsonString) {
			return new UpdateOrderStatusFailure();
		}
	}

	// TODO: SetActiveJobsPacket, which will send the result of backend.getAllJobs(), which should be an JSON array containing all the jobs.

	class AddItem extends Packet {
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
			return new AddItem(tryGet(jsonObject, ItemValues.ITEM_NAME), tryGet(jsonObject, ItemValues.DESCRIPTION), tryGet(jsonObject, ItemValues.QUANTITY), tryGet(jsonObject, ItemValues.PRICE), tryGet(jsonObject, ItemValues.WEIGHT), tryGet(jsonObject, Constants.TOKEN));
		}
	}

	class RemoveItem extends Packet {
		constructor(itemId, token = null) {
			super(PacketTypes.REMOVE_ITEM, token);

			this.itemId = itemId;
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new RemoveItem(tryGet(jsonObject, ItemValues.ITEM_ID), tryGet(jsonObject, Constants.TOKEN));
		}
	}

	class UpdateItem extends Packet {
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
			return new UpdateItem(tryGet(jsonObject, ItemValues.ITEM_ID), tryGet(jsonObject, ItemValues.ITEM_NAME), tryGet(jsonObject, ItemValues.DESCRIPTION), tryGet(jsonObject, ItemValues.QUANTITY), tryGet(jsonObject, ItemValues.PRICE), tryGet(jsonObject, ItemValues.WEIGHT), tryGet(jsonObject, Constants.TOKEN));
		}
	}

	class GetLinkedItems extends Packet {
		constructor(token = null) {
			super(PacketTypes.GET_LINKED_ITEMS, token);
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new GetLinkedItems(tryGet(jsonObject, Constants.TOKEN));
		}
	}

	class SetLinkedItems extends JSONPacket {
		constructor(jsonString) {
			super(PacketTypes.SET_LINKED_ITEMS, jsonString);
		}

		static fromJSONString(jsonString) {
			return new SetLinkedItems(jsonString);
		}
	}

	class ItemUpdateSuccess extends Packet {
		constructor() {
			super(PacketTypes.UPDATE_ITEM_SUCCESS);
		}

		static fromJSONString(jsonString) {
			return new ItemUpdateSuccess();
		}
	}

	class ItemUpdateFailed extends Packet {
		constructor() {
			super(PacketTypes.UPDATE_ITEM_FAILED);
		}

		static fromJSONString(jsonString) {
			return new ItemUpdateFailed();
		}
	}

	class GetAllOrders extends Packet {
		constructor(token = null) {
			super(PacketTypes.GET_ALL_ORDERS, token);
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new GetAllOrders(tryGet(jsonObject, Constants.TOKEN));
		}
	}

	class SetAllOrders extends JSONPacket {
		constructor(jsonString) {
			super(PacketTypes.SET_ALL_ORDERS, jsonString);
		}

		static fromJSONString(jsonString) {
			return new SetAllOrders(jsonString);
		}
	}

	class PlaceOrder extends Packet {
		constructor(token = null) {
			super(PacketTypes.PLACE_ORDER, token);
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new PlaceOrder(tryGet(jsonObject, Constants.TOKEN));
		}
	}

	class PlaceOrderSuccess extends Packet {
		constructor() {
			super(PacketTypes.PLACE_ORDER_SUCCESS);
		}

		static fromJSONString(jsonString) {
			return new PlaceOrderSuccess();
		}
	}

	class PlaceOrderFailure extends Packet {
		constructor() {
			super(PacketTypes.PLACE_ORDER_FAILURE);
		}

		static fromJSONString(jsonString) {
			return new PlaceOrderFailure();
		}
	}

	class GetCartItems extends Packet {
		constructor(token = null) {
			super(PacketTypes.GET_CART_ITEMS, token);
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new GetCartItems(tryGet(jsonObject, Constants.TOKEN));
		}
	}

	class SetCartItems extends Packet {
		constructor(itemList) {
			super(PacketTypes.SET_CART_ITEMS);

			this.itemList = itemList;
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new SetCartItems(tryGet(jsonObject, Constants.ITEM_LIST));
		}
	}

	class AddCartItem extends Packet {
		constructor(itemId, quantity, token = null) {
			super(PacketTypes.ADD_CART_ITEM, token);

			this.itemId = itemId;
			this.quantity = quantity;
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new AddCartItem(tryGet(jsonObject, Constants.ITEM_ID), tryGet(jsonObject, Constants.QUANTITY), tryGet(jsonObject, Constants.TOKEN));
		}
	}

	class RemoveCartItem extends Packet {
		constructor(itemId, token = null) {
			super(PacketTypes.REMOVE_CART_ITEM, token);

			this.itemId = itemId;
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new RemoveCartItem(tryGet(jsonObject, Constants.ITEM_ID), tryGet(jsonObject, Constants.TOKEN));
		}
	}

	class CartItemSuccess extends Packet {
		constructor() {
			super(PacketTypes.CART_ITEM_SUCCESS);
		}

		static fromJSONString(jsonString) {
			return new CartItemSuccess();
		}
	}

	class CartItemFailure extends Packet {
		constructor(errorMessage) {
			super(PacketTypes.CART_ITEM_FAILURE);

			this.errorMessage = errorMessage;
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new CartItemFailure(tryGet(jsonObject, Constants.ERROR_MESSAGE));
		}
	}

	class UploadImage extends Packet { 
		constructor(linkedId, imageType, image) {
			super(PacketTypes.UPLOAD_IMAGE);

			this.linkedId = linkedId;
			this.imageType = imageType;
			this.image = image;
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new UploadImage(tryGet(jsonObject, Constants.LINKED_ID), tryGet(jsonObject, Constants.IMAGE_TYPE), tryGet(jsonObject, Constants.IMAGE));
		}
	}

	exports.AccountCreateFailedPacket = AccountCreateFailedPacket;
	exports.AccountCreateSuccessPacket = AccountCreateSuccessPacket;
	exports.AddCartItem = AddCartItem;
	exports.AddItem = AddItem;
	exports.AuthenticationFailedPacket = AuthenticationFailedPacket;
	exports.AuthenticationSuccessPacket = AuthenticationSuccessPacket;
	exports.CartItemFailure = CartItemFailure;
	exports.CartItemSuccess = CartItemSuccess;
	exports.Constants = Constants;
	exports.CreateAccountPacket = CreateAccountPacket;
	exports.CreateDriverAccountPacket = CreateDriverAccountPacket;
	exports.GetAllCompletedOrders = GetAllCompletedOrders;
	exports.GetAllConfirmedOrders = GetAllConfirmedOrders;
	exports.GetAllOrders = GetAllOrders;
	exports.GetCartItems = GetCartItems;
	exports.GetLinkedItems = GetLinkedItems;
	exports.GetLinkedOrders = GetLinkedOrders;
	exports.GetUserData = GetUserData;
	exports.ImageTypes = ImageTypes;
	exports.ItemUpdateFailed = ItemUpdateFailed;
	exports.ItemUpdateSuccess = ItemUpdateSuccess;
	exports.ItemValues = ItemValues;
	exports.LoginPacket = LoginPacket;
	exports.PacketTypes = PacketTypes;
	exports.PlaceOrder = PlaceOrder;
	exports.PlaceOrderFailure = PlaceOrderFailure;
	exports.PlaceOrderSuccess = PlaceOrderSuccess;
	exports.RemoveCartItem = RemoveCartItem;
	exports.RemoveItem = RemoveItem;
	exports.SetAllCompletedOrders = SetAllCompletedOrders;
	exports.SetAllConfirmedOrders = SetAllConfirmedOrders;
	exports.SetAllOrders = SetAllOrders;
	exports.SetCartItems = SetCartItems;
	exports.SetLinkedItems = SetLinkedItems;
	exports.SetLinkedOrders = SetLinkedOrders;
	exports.SetUserData = SetUserData;
	exports.Status = Status;
	exports.UpdateItem = UpdateItem;
	exports.UpdateOrderStatus = UpdateOrderStatus;
	exports.UpdateOrderStatusFailure = UpdateOrderStatusFailure;
	exports.UpdateOrderStatusSuccess = UpdateOrderStatusSuccess;
	exports.UploadImage = UploadImage;
	exports.getPacketType = getPacketType;
	exports.parseJSON = parseJSON;
	exports.tryGet = tryGet;

}));
