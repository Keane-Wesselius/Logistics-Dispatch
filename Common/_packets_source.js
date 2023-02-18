// Essentially, Rollup 'compiles' a JavaScript module which can be used in both Node and the browser (Expo), which will be required for this project and utilizes Rollup ( https://rollupjs.org )

// Helper Functions
function tryGet(object, field) {
	try {
		return object[field];
	} catch (ignored) {
	}

	return null;
}
// 

export const Constants = {
	AUTHENTICATION: "authentication",
	USERNAME: "username",
	PASSWORD: "password",
};

export const Functions = {
	LOGIN: "login",
	FIND_IF_USER_EXISTS: "findIfUserExists",
};

export class Packet {
	constructor(data) {
		this.data = data;
		this.jsonObject = null;

		try {
			this.jsonObject = JSON.parse(this.data);
		} catch (ignored) {
		}
	}

	toJSONString() {
		try {
			return JSON.stringify(this.jsonObject);
		} catch (ignored) {
		}

		return null;
	}
}

// Essentially, packets in our application are kinda like Remote Procedure Calls ( https://en.wikipedia.org/wiki/Remote_procedure_call ) where we are essentially calling a function on the receiving end with parameters set using the JSON format. So the LoginPacket essentially is essentially stating that the client wants to call the 'login' function on the receivers side with the 'username' and 'password' fields.

// While switching to a 'real' RPC library might simplify this process significantly, this allows us to have full control over the data stream, as well as it's security (which may be two things supported by a real RPC library). Definitely something to look into.
export class LoginPacket extends Packet {
	constructor(data) {
		super(data);

		this.function = Functions.LOGIN;

		// I'm not sure if we want to secure the constructors like this, as while it does prevent errors will significantly clutter the code base. Doing this does at the very least guarantee that we can call toJSONString() without needing to worry if the object is valid or not.
		this.username = tryGet(this.jsonObject, Constants.username);
		this.password = tryGet(this.jsonObject, Constants.PASSWORD);
	}
}