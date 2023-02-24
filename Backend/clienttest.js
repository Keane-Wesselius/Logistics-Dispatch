const Packets = require("../Common/packets");
const WebSocket = require("ws");
const ws = new WebSocket((address = "ws://127.0.0.1:5005"));
const bcrypt = require("bcrypt");
const saltRounds = 10;

ws.on("error", console.error);

// console.log(PacketDefinitions.Packet.toString());
// const testAuthenticatioNPacket = new PacketDefinitions.AuthenticationPacket("test");
// console.log(testAuthenticatioNPacket);
// console.log(PacketDefinitions.Constants.AUTHENTICATION);

async function generateHashedPassword(password) {
	const hashedPassword = await bcrypt.hash(password, saltRounds);
	return hashedPassword;
}

// generateHashedPassword("1").then(hashedPassword => {
// 	console.log(hashedPassword);
// 	process.exit();
// });

ws.on("open", function open() {
	// Don't actually want to do this, as the password for the LoginPacket MUST be plaintext for bcrypt to work.
	// generateHashedPassword("1").then(hashedPassword => {
	// 	const loginPacket = new Packets.LoginPacket("1@44.com", hashedPassword);
	// 	ws.send(loginPacket.toString());
	// });

	const loginPacket = new Packets.LoginPacket("1@44.com", "1");
	ws.send(loginPacket.toString());
});

ws.on("message", function message(data) {
	console.log("received: %s", data);
});
