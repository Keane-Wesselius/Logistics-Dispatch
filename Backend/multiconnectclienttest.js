const Packets = require("../Common/packets");
const WebSocket = require("ws");

// const testParameter = "test";

// class Test {
// 	constructor(test) {
// 		this[testParameter] = test;
// 	}
// }

// const test = new Test("12341421");
// console.log(test.test);
// console.log(JSON.stringify(test));

// process.exit();

let token = null;
setTimeout(() => {
	const ws = new WebSocket((address = "ws://127.0.0.1:5005"));
	ws.on("error", console.error);

	ws.on("open", function open() {
		// const createAccountPacket = new Packets.CreateAccountPacket("test1", "1@47.com", "1", "driver");
		// ws.send(createAccountPacket.toString());

		// setTimeout(() => {
		// 	const loginPacket = new Packets.LoginPacket("1@45.com", "1");
		// 	ws.send(loginPacket.toString());
		// }, 5000);

		// setTimeout(() => {
		// 	const getLinkedOrdersPacket = new Packets.GetLinkedOrders();
		// 	ws.send(getLinkedOrdersPacket.toString());
		// }, 10000);

		const loginPacket = new Packets.LoginPacket("1@47.com", "1");
		ws.send(loginPacket.toString());

		// setTimeout(() => {
		// 	const getLinkedOrdersPacket = new Packets.GetLinkedOrders();
		// 	ws.send(getLinkedOrdersPacket.toString());
		// }, 1000);
	});

	ws.on("message", function message(data) {
		console.log("received: %s", data);
		const jsonObject = JSON.parse(data);
		token = jsonObject.token;
	});

	setTimeout(() => {
		ws.close();
	}, 1000);
}, 1);

setTimeout(() => {
	const ws = new WebSocket((address = "ws://127.0.0.1:5005"));
	ws.on("error", console.error);

	ws.on("open", function open() {
		// const createAccountPacket = new Packets.CreateAccountPacket("test1", "1@47.com", "1", "driver");
		// ws.send(createAccountPacket.toString());

		// setTimeout(() => {
		// 	const loginPacket = new Packets.LoginPacket("1@45.com", "1");
		// 	ws.send(loginPacket.toString());
		// }, 5000);

		// setTimeout(() => {
		// 	const getLinkedOrdersPacket = new Packets.GetLinkedOrders();
		// 	ws.send(getLinkedOrdersPacket.toString());
		// }, 10000);

		// const loginPacket = new Packets.LoginPacket("1@47.com", "1");
		// ws.send(loginPacket.toString());

		const getLinkedOrdersPacket = new Packets.GetLinkedOrders(token);
		ws.send(getLinkedOrdersPacket.toString());

		// setTimeout(() => {
		// 	const getLinkedOrdersPacket = new Packets.GetLinkedOrders();
		// 	ws.send(getLinkedOrdersPacket.toString());
		// }, 1000);
	});

	ws.on("message", function message(data) {
		console.log("received: %s", data);
	});
}, 3000);