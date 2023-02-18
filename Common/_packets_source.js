// Essentially, Rollup 'compiles' a JavaScript module which can be used in both Node and the browser (Expo), which will be required for this project and utilizes Rollup ( https://rollupjs.org )

// Contains constant names for JSON tags.
export const Constants = {
	USERNAME: "username",
	EMAIL: "email",
	PASSWORD: "password",
	AREA: "area",
	TYPE: "type",
};

// Contains function names, essentially Packet types.
export const PacketTypes = {
	LOGIN: "login",
	GET_ACTIVE_JOBS: "get_active_jobs",
	FIND_IF_USER_EXISTS: "find_if_user_exists",
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

export class LoginPacket extends Packet {
	constructor(username, password) {
		super(PacketTypes.LOGIN);

		// TODO: Sanitize
		this.username = username;
		this.password = password;
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new LoginPacket(tryGet(jsonObject, Constants.USERNAME), tryGet(jsonObject, Constants.PASSWORD));
	}
}

// TODO: Not an actual implementation, but shows how the schemes should work.
export class GetActiveJobsPacket extends Packet {
	constructor(area) {
		super(PacketTypes.GET_ACTIVE_JOBS);

		// TODO: Sanitize
		this.area = area;
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new GetActiveJobsPacket(tryGet(jsonObject, Constants.AREA));
	}
}

export class DoesUserExistPacket extends Packet {
	constructor(email, password) {
		super(PacketTypes.FIND_IF_USER_EXISTS);

		// TODO: Sanitize
		this.email = email;
		// TODO: Does finding if a user exists need to have password included? Authorization should likely be checked for the connection rather than the password.
		this.password = password;
	}

	static fromJSONString(jsonString) {
		const jsonObject = parseJSON(jsonString);
		return new GetActiveJobsPacket(tryGet(jsonObject, Constants.email), tryGet(jsonObject, Constants.password));
	}
}