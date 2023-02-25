const Packets = require("../Common/packets");
const WebSocket = require("ws");
const ws = new WebSocket((address = "ws://127.0.0.1:5005"));
const bcrypt = require("bcrypt");
const saltRounds = 10;

ws.on("error", console.error);

ws.on("open", function open() {
	// const createAccountPacket = new Packets.CreateAccountPacket("test1", "1@45.com", "1", "driver");
	// ws.send(createAccountPacket.toString());

	// setTimeout(() => {
	// 	const loginPacket = new Packets.LoginPacket("1@45.com", "1");
	// 	ws.send(loginPacket.toString());
	// }, 5000);

	// setTimeout(() => {
	// 	const getLinkedOrdersPacket = new Packets.GetLinkedOrders();
	// 	ws.send(getLinkedOrdersPacket.toString());
	// }, 10000);

	const loginPacket = new Packets.LoginPacket("1@45.com", "1");
	ws.send(loginPacket.toString());

	setTimeout(() => {
		const getLinkedOrdersPacket = new Packets.GetLinkedOrders();
		ws.send(getLinkedOrdersPacket.toString());
	}, 1000);
});

ws.on("message", function message(data) {
	console.log("received: %s", data);
});