(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Packets = {}));
})(this, (function (exports) { 'use strict';

	// Essentially, Rollup 'compiles' a JavaScript module which can be used in both Node and the browser (Expo), which will be required for this project and utilizes Rollup ( https://rollupjs.org )

	// Contains constant names for JSON tags.
	const Constants = {
		NAME: "name",
		USERNAME: "username",
		EMAIL: "email",
		PASSWORD: "password",
		ACCTYPE: "acctype",
		AREA: "area",
		TYPE: "type",
		ERROR_MESSAGE: "errorMessage",
		ORDER_ID: "orderId",
		STATUS: "status",
	};

	// TODO: Create a dictionary of PacketTypes to Packet classes for easy casting / parsing.

	// Contains function names, essentially Packet types.
	const PacketTypes = {
		LOGIN: "login",
		AUTHENTICATION_SUCCESS: "authenticationSuccess",
		AUTHENTICATION_FAILED: "authenticationFailed",

		CREATE_ACCOUNT: "createAccount",
		ACCOUNT_CREATE_SUCCESS: "accountCreateSuccess",
		ACCOUNT_CREATE_FAILED: "accountCreateFailed",

		GET_LINKED_ORDERS: "getLinkedOrders",
		SET_LINKED_ORDERS: "setLinkedOrders",

		GET_USER_DATA: "getUserData",
		SET_USER_DATA: "setUserData",

		UPDATE_STATUS: "updateStatus",
		UPDATE_STATUS_SUCCESS: "updateStatusSuccess",
		UPDATE_STATUS_FAILED: "updateStatusFailed",

		GET_ALL_CONFIRMED_ORDERS: "getAllConfirmedOrders",
		SET_ALL_CONFIRMED_ORDERS: "getAllConfirmedOrders",
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
			if (jsonString != null && jsonString.length <= 5000) {
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
		constructor(type) {
			this.type = type;
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
			return new Packet(tryGet(jsonObject, Constants.type));
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
			const jsonObject = parseJSON(this.jsonString);
			if (jsonObject != null) {
				// Construct a new JSONObject with the type of this JSONPacket and a single field 'data' which contains the original JSONObject passed to the JSONPacket.
				const finalJSONObject = { type: this.type, data: jsonObject };

				try {
					return JSON.stringify(finalJSONObject);
				} catch (ignored) {
				}
			} else {
				console.log("Got Invalid jsonObject from string: " + this.jsonString);
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
		constructor() {
			super(PacketTypes.AUTHENTICATION_SUCCESS);
		}

		static fromJSONString(jsonString) {
			// TODO: Doesn't do anything, as AuthenticationSuccessPacket is an empty packet.
			parseJSON(jsonString);
			return new AuthenticationSuccessPacket();
		}
	}

	// TODO: Not an actual implementation, but shows how the schemes should work. If do not want the user to be able to select what area they are seeing the active jobs from, we should make this an empty packet.
	class GetLinkedOrders extends Packet {
		constructor() {
			super(PacketTypes.GET_LINKED_ORDERS);
		}

		static fromJSONString(jsonString) {
			return new GetLinkedOrders();
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
		constructor() {
			super(PacketTypes.GET_USER_DATA);
		}

		static fromJSONString(jsonString) {
			return new GetUserData();
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
		constructor() {
			super(PacketTypes.GET_ALL_CONFIRMED_ORDERS);
		}

		static fromJSONString(jsonString) {
			return new GetUserData();
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

	class UpdateStatus extends Packet {
		constructor(orderID, status) {
			super(PacketTypes.UPDATE_STATUS);

			// TODO: Sanitize
			this.orderID = orderID;
			// TODO: Check if 'status' is a valid enum value.
			this.status = status;
		}

		static fromJSONString(jsonString) {
			const jsonObject = parseJSON(jsonString);
			return new UpdateStatus(tryGet(jsonObject, Constants.ORDER_ID), tryGet(jsonObject, Constants.STATUS));
		}
	}

	// TODO: SetActiveJobsPacket, which will send the result of backend.getAllJobs(), which should be an JSON array containing all the jobs.

	exports.AccountCreateFailedPacket = AccountCreateFailedPacket;
	exports.AccountCreateSuccessPacket = AccountCreateSuccessPacket;
	exports.AuthenticationFailedPacket = AuthenticationFailedPacket;
	exports.AuthenticationSuccessPacket = AuthenticationSuccessPacket;
	exports.Constants = Constants;
	exports.CreateAccountPacket = CreateAccountPacket;
	exports.GetAllConfirmedOrders = GetAllConfirmedOrders;
	exports.GetLinkedOrders = GetLinkedOrders;
	exports.GetUserData = GetUserData;
	exports.LoginPacket = LoginPacket;
	exports.PacketTypes = PacketTypes;
	exports.SetAllConfirmedOrders = SetAllConfirmedOrders;
	exports.SetLinkedOrders = SetLinkedOrders;
	exports.SetUserData = SetUserData;
	exports.Status = Status;
	exports.UpdateStatus = UpdateStatus;
	exports.getPacketType = getPacketType;
	exports.parseJSON = parseJSON;

}));
