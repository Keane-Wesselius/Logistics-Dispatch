import React, { useState, useEffect, Component } from 'react';
import './myItems.css';
import { useNavbarUpdate } from '../../NavbarContext';
const Packets = require("../../backend/packets");

let ws = null;

function MyItems() {
    
	const updateNavbar = useNavbarUpdate();
    updateNavbar('supplier');

    useEffect(() => {
		if (ws == null || (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING)) {
			ws = new WebSocket("ws://localhost:5005/");
		}

         // websocket open and close
        ws.onopen = () => {
            console.log("ws opened: myItems");
            const itemPacket = new Packets.GetLinkedItems(localStorage.getItem('token'));
            console.log("User string: " + itemPacket.toString());
            ws.send(itemPacket.toString());
        }
        ws.onclose = () => console.log("ws closed: myItems");

        // when websocket gets resposne back
        ws.onmessage = (res) => {
            const packet = res.data;
            console.log(packet);
            if(Packets.getPacketType(packet) === Packets.PacketTypes.SET_LINKED_ITEMS){
                console.log("Linked items packet");
                const tmp = JSON.parse(packet);
                setItems(tmp.data);
            } 
            // ws.close();
        }; 

        // websocket error
        ws.onerror = (e) => {
            console.error("WebSocket error:", e.message);
        };
    }, []);

    const [items, setItems] = useState([]);
    const heading = ["ID", "Name", "Description", "Quantity", "Price", "Weight", "Date Added"]

    return (
        <div className="myitems" >
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
        </div>
    );
  
}

class TableRow extends Component {
    render() {
        var row = this.props.rowContent;
        var range = []
        for (var i = 1; i <= row.quantity; i++) {
            range.push(i);
        }

        if (Object.hasOwn(row, '_id') && Object.hasOwn(row, 'itemName') && Object.hasOwn(row, 'description') && Object.hasOwn(row, 'quantity') &&
            Object.hasOwn(row, 'price') && Object.hasOwn(row, 'weight') && Object.hasOwn(row, 'postedDate')) {
            return (
                <tr>
                    <td>{row._id}</td>
                    <td>{row.itemName}</td>
                    <td>{row.description}</td>
                    <td>{row.quantity}</td>
                    <td>{row.price}</td>
                    <td>{row.weight}</td>
                    <td>{row.postedDate}</td>
                </tr>
            )
        } else {
			console.log("Got malformed row object, not rendering: " + JSON.stringify(row));
		}
    }
}

export default MyItems;