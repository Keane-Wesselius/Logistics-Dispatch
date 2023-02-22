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
	ERROR_MESSAGE: "error_message",
};

// TODO: Create a dictionary of PacketTypes to Packet classes for easy casting / parsing.

// Contains function names, essentially Packet types.
export const PacketTypes = {
	LOGIN: "login",
	GET_LINKED_ORDERS: "get_linked_orders",
	SET_LINKED_ORDERS: "set_linked_orders",
	AUTHENTICATION_FAILED: "authentication_failed",
	AUTHENTICATION_SUCCESS: "authentication_success",
	ACCOUNT_CREATE_FAILED: "account_create_failed",
	ACCOUNT_CREATE_SUCCESS: "account_create_success",
	CREATE_ACCOUNT: "create_account",
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
export function parseJSON(jsonString) {
	try {
		// jsonString, if passed from the 'data' in WebSockets, might not actually be a string, so call the toString method to ensure it is.
		// TODO: Ensure toString() is secure.
		jsonString = jsonString.toString();

		// 1000 characters is kinda an arbitrary limit, but it should prevent some attacks from receiving a large string which requires many CPU cycles to parse, resulting in a DOS attack.
		if (jsonString != null && jsonString.length <= 1000) {
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

class JSONPacket extends Packet {
	constructor(type, jsonString = null) {
		super(type);
		this.jsonString = jsonString;
	}

	// Overrides the base toString() method, which is desirable for our application.
	toString() {
		return this.jsonString;
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
		return new CreateAccountPacket(tryGet(jsonObject, Constants.NAME), tryGet(jsonObject, Constants.EMAIL), tryGet(jsonObject, Constants.PASSWORD), tryGet(jsonObject, Constants.TYPE));
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
	constructor() {
		super(PacketTypes.AUTHENTICATION_SUCCESS);
	}

	static fromJSONString(jsonString) {
		// TODO: Doesn't do anything, as AuthenticationSuccessPacket is an empty packet.
		const jsonObject = parseJSON(jsonString);
		return new AuthenticationSuccessPacket();
	}
}

// TODO: Not an actual implementation, but shows how the schemes should work. If do not want the user to be able to select what area they are seeing the active jobs from, we should make this an empty packet.
export class GetLinkedOrders extends Packet {
	constructor() {
		super(PacketTypes.GET_LINKED_ORDERS);
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new GetLinkedOrders();
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

// TODO: SetActiveJobsPacket, which will send the result of backend.getAllJobs(), which should be an JSON array containing all the jobs.