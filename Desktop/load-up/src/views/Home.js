import React from 'react';
import './Home.css';
const Packets = require("../backend/packets");

let ws = null;
function initializeWebSocket() {
	if (ws == null) {
		ws = new WebSocket("ws://localhost:5005/");
		ws.onmessage = (res) => {
			const packet = res.data;
			console.log(packet);

			// We only want to include packet handlers for packets we care about, which might be SetOrderList packets for a page which needs order lists, while for another we might only care about item lists, etc. That is why we are not handling AUTHENTICATION_SUCCESS packets here, because they simply do not apply on the home page.
			if (Packets.getPacketType(packet) === Packets.PacketTypes.SET_LINKED_ORDERS) {
				console.log("SET_LINKED_ORDERS: " + packet);
			}
		};

		ws.onopen = () => {
			const getLinkedOrdersPacket = new Packets.GetLinkedOrders(localStorage.getItem('token'));
			ws.send(getLinkedOrdersPacket.toString());
		};
	}
}

function Home() {
	console.log("Token: " + localStorage.getItem('token'));
	initializeWebSocket();

	return (
		<div>
			<h1>HELLO WORLD</h1>
			<h1>Successful Login/Register!</h1>
			<h1>HELLO WORLD</h1>
		</div>
	)
}

export default Home;