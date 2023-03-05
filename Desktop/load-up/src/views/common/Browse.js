import React, { useState, useEffect, Component } from 'react';
import './Browse.css';
import { useNavbarUpdate } from '../../NavbarContext';
const Packets = require("../../backend/packets");

let ws = null;

function Browse() {
    
	const updateNavbar = useNavbarUpdate();
    //ws = null;

	// console.log(ws != null ? ws.status : "websocket is null");
    useEffect(() => {
		//if (ws == null || (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING)) {
            ws = new WebSocket("ws://localhost:5005/");
		//}

         // websocket open and close
        ws.onopen = () => {
            console.log("ws opened: merchant browse");
            const itemPacket = new Packets.GetLinkedItems(localStorage.getItem('token'));
            console.log("User string: " + itemPacket.toString());
            ws.send(itemPacket.toString());

            const userPacket = new Packets.GetUserData(localStorage.getItem('token'));
            console.log("User string: " + userPacket.toString());
            ws.send(userPacket.toString());
        }
        ws.onclose = () => console.log("ws closed: merchant browse");

        // when websocket gets resposne back
        ws.onmessage = (res) => {
            const packet = res.data;
            console.log(packet);
            if(Packets.getPacketType(packet) === Packets.PacketTypes.SET_LINKED_ITEMS){
                console.log("Linked items packet");
                const tmp = JSON.parse(packet);
                setItems(tmp.data);
            } else if (Packets.getPacketType(packet) === Packets.PacketTypes.SET_USER_DATA) {
                console.log(JSON.parse(packet).data._id);
                localStorage.setItem('id', JSON.parse(packet).data._id);
                updateNavbar(JSON.parse(packet).data.acctype);
            } else if(Packets.getPacketType(packet) === Packets.PacketTypes.CART_ITEM_SUCCESS){
                console.log("Cart Item Success Packet");
                alert("Successfully added item to cart!")
            } else if(Packets.getPacketType(packet) === Packets.PacketTypes.CART_ITEM_FAILURE){
                const cartItemFailurePacket = Packets.CartItemFailure.fromJSONString(packet);
                console.log("Cart Item Failure Packet");
                alert("Failed to add item to cart: " + cartItemFailurePacket.errorMessage);
            }

            // ws.close();
        }; 

        // websocket error
        ws.onerror = (e) => {
            console.error("WebSocket error:", e.message);
        };
    }, [updateNavbar]);

    const [items, setItems] = useState([]);
    const heading = ["ID", "Name", "Description", "Quantity", "Price", "Weight", "Supplier", "Date", "Add to Cart"]

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
        </div>
    );
  
}

class TableRow extends Component {
    // add to cart
    handleSubmit = () => {
        if(this.quantity != null) {
            const addCartItem = new Packets.AddCartItem(this.props.rowContent._id, this.quantity, localStorage.getItem('token'));
            console.log("Sending addCartItem packet: " + addCartItem.toString());
            ws.send(addCartItem.toString());
        } else {
            alert("Please pick a valid quantity number.")
        }
    }

    handleQuantityChange = (e) => {
        this.quantity = e.target.value;
    }

    render() {
        var row = this.props.rowContent;
        var range = []
        for (var i = 1; i <= row.quantity; i++) {
            range.push(i);
        }

        if (Object.hasOwn(row, '_id') && Object.hasOwn(row, 'itemName') && Object.hasOwn(row, 'description') && Object.hasOwn(row, 'quantity') &&
            Object.hasOwn(row, 'price') && Object.hasOwn(row, 'weight') && Object.hasOwn(row, 'supplierId') && Object.hasOwn(row, 'postedDate')) {
            return (
                <tr>
                    <td>{row._id}</td>
                    <td>{row.itemName}</td>
                    <td>{row.description}</td>
                    <td>{row.quantity}</td>
                    <td>{row.price}</td>
                    <td>{row.weight}</td>
                    <td>{row.supplierId}</td>
                    <td>{row.postedDate}</td>
                    <td>
                        <select className="cart" onChange={this.handleQuantityChange}>
                            <option hidden-value="" disabled selected hidden>Quantity</option>
                            {range.map((n) => <option>{n}</option>)}
                        </select>
                        <button className="cart" onClick={this.handleSubmit}>
                            Submit
                        </button>
                    </td>
                </tr>
            )
        } else {
			console.log("Got malformed row object, not rendering: " + JSON.stringify(row));
		}
    }
}

export default Browse;