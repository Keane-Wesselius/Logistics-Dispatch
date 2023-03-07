import React, { useState, useEffect, Component } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { useNavbarUpdate } from '../../NavbarContext';

import './Track.css';
const Packets = require("../../backend/packets");

function Track() {

	const updateNavbar = useNavbarUpdate();
	const { isLoaded } = useLoadScript({
		googleMapsApiKey: 'AIzaSyDNawxdz2xAwd8sqY_vq9YB7ZRTQPgp-tA'
	});

	useEffect(() => {
		let ws = new WebSocket("ws://localhost:5005/");

		// websocket open and close
		ws.onopen = () => {
			console.log("ws opened: merchant track");
			const orderPacket = new Packets.GetLinkedOrders(localStorage.getItem('token'));
			console.log("User string: " + orderPacket.toString());
			ws.send(orderPacket.toString());

			const userPacket = new Packets.GetUserData(localStorage.getItem('token'));
			console.log("User string: " + userPacket.toString());
			ws.send(userPacket.toString());
		}
		ws.onclose = () => console.log("ws closed: merchant track");

		// when websocket gets resposne back
		ws.onmessage = (res) => {
			const packet = res.data;
			console.log(packet);
			if (Packets.getPacketType(packet) === Packets.PacketTypes.SET_LINKED_ORDERS) {
				console.log("Confirmed items packet");
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

	const [items, setItems] = useState([]);
	const [locations, setLocations] = useState([]);
	const acceptedOrdersHeading = ["Merchant Name", "Driver Name", "Items", "Start Address", "End Address", "Accepted Date", "Total Cost"]
	const confirmedOrdersHeading = ["Merchant Name", "Supplier Name", "Items", "Start Address", "End Address", "Confirmed Date", "Total Cost"]

	return (
		<div className="browse" >
			<h1 class="text-center">Accepted Orders</h1>
			<table className="bitem-table">
				<thead>
					<tr>
						{acceptedOrdersHeading.map((header) => <th className="bitem-th" >{header}</th>)}
					</tr>
				</thead>
				<tbody id="bitem-table">
					{/*<!-- item data will be dynamically added here -->*/}
					{items.map((item) => (<AcceptedTableRow rowContent={item} />))}
				</tbody>
			</table>

			<h1 class="text-center">Confirmed Orders</h1>
			<table className="bitem-table">
				<thead>
					<tr>
						{confirmedOrdersHeading.map((header) => <th className="bitem-th" >{header}</th>)}
					</tr>
				</thead>
				<tbody id="bitem-table">
					{/*<!-- item data will be dynamically added here -->*/}
					{items.map((item) => (<ConfirmedTableRow rowContent={item} />))}
				</tbody>
			</table>
			{/* { !isLoaded ? (
             <div>Loading...</div>
            ) : (
                <div><Map mapData={locations}/></div>
            )} */}
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

class AcceptedTableRow extends Component {
	// add to cart
	handleSubmit = () => {
		alert("This order now on the map!");
	}

	render() {
		var row = this.props.rowContent;

		if (Object.hasOwn(row, 'supplierName') && Object.hasOwn(row, 'items') && Object.hasOwn(row, 'startingAddress') && Object.hasOwn(row, 'endingAddress') && Object.hasOwn(row, 'confirmed_date') && Object.hasOwn(row, 'accepted_date') && Object.hasOwn(row, 'totalCost') && Object.hasOwn(row, 'deliveryPrice')) {
			if (row.status === "accepted") {
				return (
					<tr>
						<td>{row.merchantName}</td>
						<td>{row.driverName}</td>
						<td>{createItemString(row.items)}</td>
						<td>{row.startingAddress}</td>
						<td>{row.endingAddress}</td>
						<td>{row.accepted_date}</td>
						<td>{row.totalCost + row.deliveryPrice}</td>
					</tr>
				);
			}
		} else {
			console.log("Invalid Row: " + JSON.stringify(row));
		}
	}
}

function roundMoney(num, decimalPlaces = 2) {
	var p = Math.pow(10, decimalPlaces);
	var n = (num * p) * (1 + Number.EPSILON);
	return Math.round(n) / p;
}

class ConfirmedTableRow extends Component {
	// add to cart
	handleSubmit = () => {
		alert("This order now on the map!");
	}

	render() {
		var row = this.props.rowContent;

		if (Object.hasOwn(row, 'merchantName') && Object.hasOwn(row, 'supplierName') && Object.hasOwn(row, 'items') && Object.hasOwn(row, 'startingAddress') && Object.hasOwn(row, 'endingAddress') && Object.hasOwn(row, 'confirmed_date') && Object.hasOwn(row, 'totalCost') && Object.hasOwn(row, 'deliveryPrice')) {
			if (row.status === "confirmed") {
				return (
					<tr>
						<td>{row.merchantName}</td>
						<td>{row.supplierName}</td>
						<td>{createItemString(row.items)}</td>
						<td>{row.startingAddress}</td>
						<td>{row.endingAddress}</td>
						<td>{row.confirmed_date}</td>
						<td>{"$" + roundMoney(row.totalCost + row.deliveryPrice).toFixed(2)}</td>
					</tr>
				);
			}
		} else {
			console.log("Invalid Row: " + JSON.stringify(row));
		}
	}
}

// class Map extends Component {
//     render() {
//         var data = this.props.mapData;

//         if (Object.hasOwn(data, 'supplierAddress') && Object.hasOwn(data, 'clientAddress')) {
//             var locations = JSON.parse(data);

//            return (
//             <GoogleMap
//                 onLoad={(map) => {
//                 const bounds = new window.google.maps.LatLngBounds();
//                 locations.forEach((location) => {
//                   bounds.extend({lat:parseFloat(location.lat),lng:parseFloat(location.lng)});
//                 })
//                 map.fitBounds(bounds);
//               }}
//              >

//             <Marker position={locations[0]} />
//             <Marker position={locations[1]} />
//             </GoogleMap>
//             );     
//         }
//         else {
//             return (<div>Routes are loading...</div>);
//         }
//     };
//   }

export default Track;
