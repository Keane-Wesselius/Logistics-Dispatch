import React, { useState, useEffect, Component } from 'react';
import './History.css';
import { useNavbarUpdate } from '../../NavbarContext';
const Packets = require("../../backend/packets");

function History() {

	const updateNavbar = useNavbarUpdate();

	useEffect(() => {
		let ws = new WebSocket("ws://localhost:5005/");

		// websocket open and close
		ws.onopen = () => {
			console.log("ws opened: merchant history");
			const orderPacket = new Packets.GetLinkedOrders(localStorage.getItem('token'));
			console.log("User string: " + orderPacket.toString());
			ws.send(orderPacket.toString());

			const userPacket = new Packets.GetUserData(localStorage.getItem('token'));
			console.log("User string: " + userPacket.toString());
			ws.send(userPacket.toString());
		}
		ws.onclose = () => console.log("ws closed: merchant history");

		// when websocket gets resposne back
		ws.onmessage = (res) => {
			const packet = res.data;
			console.log(packet);
			if (Packets.getPacketType(packet) === Packets.PacketTypes.SET_LINKED_ORDERS) {
				console.log("Completed orders packet");
				const tmp = JSON.parse(packet);
				setItems(tmp.data);
			} else if (Packets.getPacketType(packet) === Packets.PacketTypes.SET_USER_DATA) {
				console.log(JSON.parse(packet).data._id);
				localStorage.setItem('id', JSON.parse(packet).data._id);
				updateNavbar(JSON.parse(packet).data.acctype);
			}

			//ws.close();
		};

		// websocket error
		ws.onerror = (e) => {
			console.error("WebSocket error:", e.message);
		};
	}, []);

	// CHANGE TO WHATEVER FORMAT WE DECIDE TO USE
	const [items, setItems] = useState([]);
	const heading = ["Supplier Name", "Merchant Name", "Driver Name", "Items", "Completed Date", "Total Cost"]

	return (
		<div className="browse" >
			<h1 class="text-center">Purchase History</h1>
			<table className="bitem-table">
				<thead>
					<tr>
						{heading.map((header) => <th className="bitem-th" >{header}</th>)}
					</tr>
				</thead>
				<tbody id="bitem-table">
					{/*<!-- item data will be dynamically added here -->*/}
					{items.map((item) => (<TableRow rowContent={item} />))}

				</tbody>
			</table>
		</div>
	);
}

function createItemString(items) {
	let returnString = "";
	for (const item of items) {
		if (returnString.length > 1000) {
			returnString += "...";
			break;
		}

		returnString += "Name: " + item.name + ",\nQuantity: " + item.quantity + ",\nPrice $" + item.price + ",\n";
	}

	return returnString.substring(0, returnString.length - 2);
}

function roundMoney(num, decimalPlaces = 2) {
	var p = Math.pow(10, decimalPlaces);
	var n = (num * p) * (1 + Number.EPSILON);
	return Math.round(n) / p;
}

class TableRow extends Component {
	render() {
		var row = this.props.rowContent;

		console.log("Row: " + JSON.stringify(row));

		if (Object.hasOwn(row, 'supplierName') && Object.hasOwn(row, 'merchantName')  && Object.hasOwn(row, 'driverName') && Object.hasOwn(row, 'items') && Object.hasOwn(row, 'completed_date') && Object.hasOwn(row, 'totalCost')) {
			if (row.status === "completed") {
				return (
					<tr>
						<td>{row.supplierName}</td>
						<td>{row.merchantName}</td>
						<td>{row.driverName}</td>
						<td>{createItemString(row.items)}</td>
						<td>{row.completed_date}</td>
						<td>{"$" + roundMoney(row.totalCost).toFixed(2)}</td>
					</tr>
				);
			}
		} else {
			console.log("Invalid Row: " + JSON.stringify(row));
		}
	}
}

export default History;