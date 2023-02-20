const WebSocket = require("ws");
const Packets = require("../Common/packets.js");
// TODO: Change to less-commonly used port ( https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports )
// 19178 should work.
const wss = new WebSocket.WebSocketServer({ port: 5005 });
const bcrypt = require("bcrypt");

//saltRounds refers to bcrypt, the higher the saltRounds the more secure the password
//by default bcrypt recommends 10 saltRounds, using a 2gz processor that will give us roughly 10 hashs/second
//going too high on this number could cause a hash to run for multiple days, best to leave it as it is
const saltRounds = 10;

// Controls whether the system will try to interface with the database, disable for easier debugging / unrelated implementations.
const doDatabase = true;

// TODO: These should be 'const', but need to be 'let' to support toggling database support on and off. This should be removed in production.
let uri = null;
let dbClient = null;

if (doDatabase) {

	const { MongoClient } = require("mongodb");
	uri = "MONGO KEY HERE";
	dbClient = new MongoClient(uri);

	// Creates a connection to the database
	async function startDatabase() {
		try {
			await dbClient.connect();
		} catch (e) {
			console.error(e);
		}
		// finally {
		//   await client.close();
		// }
	}
	startDatabase();

}

// Contains all clients which have successfully logged in. Perhaps not the most safe connection, especially is WebSocket connections could be spoofed, but other metrics such as IP Address / MAC Address are even worse at verifying that the connection is who they are. See the token idea below for additional security.
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
			return;
		}

		const isClientAuthenticated = authenticatedClients.includes(ws);

		// TODO: What happens if the user sends two login packets at once?
		if (packetType == Packets.PacketTypes.LOGIN) {
			// TODO: If the client fails to send a valid login packet after a few attempts, they should be blocked from connecting for a period to avoid DOS attacks.
			const loginPacket = Packets.LoginPacket.fromJSONString(data);

			if (loginPacket.username != null && loginPacket.password != null) {
				// TODO: Using loose verbiage of 'username' and 'email', should standardize which one it is / be explicit that it can accept both
				// TODO: These might want to be split off into their own file to reduce the clutter in this file. Not sure how we want to structure the Backend server yet though.
				// TODO: All of these functions are accessing the test database and we will have to update them as soon as we get the real data base entries with correct schemas
				getUserData(loginPacket.username).then(userData => {
					let userUsernameWasValid = false;
					let userPasswordWasValid = false;

					if (userData != null) {
						userUsernameWasValid = true;
						
						bcrypt.compare(loginPacket.password, userData.password, function(err, result) {
							if (result == true) {
								console.log("Got valid login: " + loginPacket.username + " " + loginPacket.password);
								authenticatedClients.push(ws);
								const authenticationSuccessPacket = new Packets.AuthenticationSuccessPacket();
								ws.send(authenticationSuccessPacket.toString());
		
								// {"type": "authentication_success"}
		
								userPasswordWasValid = true;
							}
						});
						
						
					}

					let userErrorMessage = null;
					if (!userUsernameWasValid) {
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
						console.log("Got invalid username / password: " + loginPacket.username + " " + loginPacket.password);
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
				const authenticationFailedPacket = new Packets.AuthenticationFailedPacket(userErrorMessage);
				ws.send(authenticationFailedPacket.toString());
			}
		} else if (isClientAuthenticated && packetType == Packets.PacketTypes.GET_ACTIVE_JOBS) {
			// TODO: Currently no mechanism to see what jobs the user should be able to see, so we are currently passing everything from the database, which is probably bad.
			getAllJobs(dbClient).then((results) => {
			}).catch(() => {
			})
		} else if (packetType == Packets.PacketTypes.CREATE_ACCOUNT) {
			const accountPacket = Packets.CreateAccountPacket.fromJSONString(data);

			if (accountPacket.email != null && accountPacket.password != null && accountPacket.acctype != null) {
				createNewUser(dbClient, accountPacket).then((result) => {

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

		// TODO: Example showing packet implementation, remove later.
		// else if (isClientAuthenticated && packetType == Packets.PacketTypes.GET_ACTIVE_JOBS) {
		// 	// Requires the client to be authenticated, if they are not, do not attempt to process the packet.

		// 	// TODO: Stub, remove commented code.

		// 	// const findIfUserExistsPacket = Packets.DoesUserExistPacket.fromJSONString(data);

		// 	// // Check if the jsonObject is valid. By this point, we should be able to assume the JSON object is both safe and valid.
		// 	// if (findIfUserExistsPacket != null) {
		// 	// 	console.log("FIND USER EXISTS");
		// 	// 	if (doDatabase) {

		// 	// 	}
		// 	// } else {
		// 	// 	console.log("Got invalid JSON object: " + data);
		// 	// }
		// }
	});
});

// TODO: Should this take a dbClient like the other functions?
async function getUserData(userEmail) {
	let result = null;
	if (userEmail != null) {
		// TODO: Add support for getting user data via either email or username
		// Will get the test database, then the users collection, then find the first entry where email is equal to the 'userEmail' parameter.
		//Currently I (keane) need to figure out bCrypt so i am passing the encrypted version of the password to get true values
		result = await dbClient.db("test").collection("users").findOne({ email: userEmail });
	}

	return result;
}

//Database call to create a new user
//newUser is a JSON that contains at the bare minimum an email and a password field
async function createNewUser(client, newUser){

	const hashedPassword = await bcrypt.hash(newUser.password, 10)
	//Checks to see if the username and password already exists in the database 
    const emailExists = await client.db("test").collection("users").findOne({ email: newUser.email});

	let result = null;
    //This case refers to when the user already exists
    if (emailExists)
    {
        console.log("Tried to create new user but they already exist");
		result = "Tried to create a new user but they already exist";
    }
	//This means the user does not exist and we are creating a new user
    else
    {
        const hashedUser = ({
            email: newUser.email,
            password: hashedPassword
        });
        const result = await client.db("test").collection("users").insertOne(hashedUser);
        console.log("New user created");
    }
	return result;
}
//This function will find all the jobs available for the drivers to accept
//Note we can sort the jobs coming from the database 
//In this case results is an array of the jobs in JSON form
async function getAllJobs(client) {
	const cursor = client.db("test").collection("jobs").find();
	const results = await cursor.toArray();

	results.forEach((result, i) => {
		console.log(result);
	});

	return results;
}