const Packets = require("../Common/packets");
const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:5005");

const names = ["Caiden", "Julien", "Hunter", "Andreas", "Jordan", "Denisse", "Fatima", "Julianne", "Braden", "Reynaldo", "Evan", "Bradley", "Alonzo", "Jase", "Rylie", "Natasha", "Sherlyn", "Joshua", "Ellie", "Mareli", "Kiersten", "Zane", "Quinton", "Krista", "Talon", "Odin", "Zoie", "Emerson", "Shyann", "Amaya", "Vance", "Armani", "Willow", "Kamren", "Morgan", "Jonathan", "Melina", "Jaron", "Dominique", "Beau", "Thomas", "Anastasia", "Akira", "Roselyn", "Miracle", "Ellis", "Ruth", "Keyla", "Hudson", "Boston", "Brenna", "Lennon", "Elisabeth", "Edith", "Rachel", "Nickolas", "Layton", "Jorden", "Perla", "Ariel", "Trent", "Raiden", "Maya", "Alan", "Alexis", "Ethan", "Adriel", "Vicente", "Savannah", "Maria", "Cheyenne", "Lilia", "Dakota", "Kole", "Mckayla", "Hassan", "Alec", "Lena", "Priscilla", "Slade", "Shiloh", "Jaiden", "Hezekiah", "Dallas", "Iris", "Patrick", "Finn", "Annika", "Jaelyn", "Cole", "Conor", "Jaylene", "Vivian", "Warren", "Marlee", "Madilyn", "Katelynn", "Miranda", "April", "Samara"];

const address = ["301 N Pine St, Ellensburg, WA 98926", "1800 Canyon Rd, Ellensburg, WA 98926", "312 S Sprague St, Ellensburg WA 98926", "1901 N Walnut St, Ellensburg, WA 98926"];

function getName() {
	return names[Math.floor(Math.random() * names.length)];
}

function getAddress() {
	return address[Math.floor(Math.random() * address.length)];
}

let token = null;
let items = null;

const driverEmail = "driver@gmail.com";
const merchantEmail = "merchant@gmail.com";
const supplierEmail = "supplier@gmail.com";

const password = "1";

ws.on("error", console.error);

ws.on("open", function open() {
	const createDriverAccountPacket = new Packets.CreateDriverAccountPacket(getName(), getName(), driverEmail, password, "driver");
	ws.send(createDriverAccountPacket.toString());
	const createMerchantAccountPacket = new Packets.CreateAccountPacket(getName(), merchantEmail, password, "merchant", address[0]);
	ws.send(createMerchantAccountPacket.toString());
	const createSupplierAccountPacket = new Packets.CreateAccountPacket(getName(), supplierEmail, password, "supplier", address[1]);
	ws.send(createSupplierAccountPacket.toString());

	setTimeout(() => {
		const loginPacket = new Packets.LoginPacket(supplierEmail, password);
		ws.send(loginPacket.toString());
	}, 1000);

	setTimeout(() => {
		const addItemPacket = new Packets.AddItem("Pencils", "Sharp and Pointy!", 100, 0.1, 0.1, token);
		ws.send(addItemPacket.toString());
	}, 2000);

	setTimeout(() => {
		const getAllItems = new Packets.GetLinkedItems(token);
		ws.send(getAllItems.toString());
	}, 3000);

	setTimeout(() => {
		console.log(JSON.stringify(items));
	}, 4000);
});

ws.on("message", function message(data) {
	console.log("Packet Received: " + data);

	if (Packets.getPacketType(data) === Packets.PacketTypes.AUTHENTICATION_SUCCESS) {
		const authenticationSuccessPacket = Packets.AuthenticationSuccessPacket.fromJSONString(data);
		token = authenticationSuccessPacket.token;
	} else if (Packets.getPacketType(data) === Packets.PacketTypes.SET_LINKED_ITEMS) {
		const setLinkedItems = JSON.parse(data);
		items = setLinkedItems.data;
	}
});

// database.placeOrder({ merchantId: supplierEmail, password: "1", acctype: "supplier", name: getName(), address: "1800 Canyon Rd, Ellensburg, WA 98926" });