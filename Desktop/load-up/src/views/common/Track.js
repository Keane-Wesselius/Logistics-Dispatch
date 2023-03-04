import React, { useState, useEffect, Component } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { useNavbarUpdate } from '../../NavbarContext';
import './Track.css';
const Packets = require("../../backend/packets");

function Track() {

    const updateNavbar = useNavbarUpdate();

    useEffect(() => {
        let ws = new WebSocket("ws://localhost:5005/");

         // websocket open and close
        ws.onopen = () => {
            console.log("ws opened: merchant track");
            const orderPacket = new Packets.GetAllConfirmedOrders(localStorage.getItem('token'));
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
            if(Packets.getPacketType(packet) === Packets.PacketTypes.GET_ALL_CONFIRMED_ORDERS){
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
    const heading = ["ID", "Name", "Description", "Quantity", "Price", "Weight", "Supplier", "Date", "Map"]

    return (
        <div className="browse" >
            <h1 class="text-center">Available Items</h1>
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
            <GoogleMap class="map"
            center={{lat: 37.7749, lng: -122.4194}}
            zoom={13}>
            <h2>Delivery Route</h2>
            </GoogleMap>
        </div>
    );
}

class TableRow extends Component {
    // add to cart
    handleSubmit = () => {
        alert("This order now on the map!");
    }

    render() {
        var row = this.props.rowContent;

        if (Object.hasOwn(row, '_id') && Object.hasOwn(row, 'itemName') && Object.hasOwn(row, 'description') && Object.hasOwn(row, 'quantity') &&
            Object.hasOwn(row, 'price') && Object.hasOwn(row, 'weight') && Object.hasOwn(row, 'supplierID') && Object.hasOwn(row, 'postedDate')) {
            return (
                <tr>
                    <td>{row._id}</td>
                    <td>{row.itemName}</td>
                    <td>{row.description}</td>
                    <td>{row.quantity}</td>
                    <td>{row.price}</td>
                    <td>{row.weight}</td>
                    <td>{row.supplierID}</td>
                    <td>{row.postedDate}</td>
                    <td>
                        <button className="view" onClick={this.handleSubmit}>
                            View
                        </button>
                    </td>
                </tr>
            )
        }
    }
}

export default Track;
