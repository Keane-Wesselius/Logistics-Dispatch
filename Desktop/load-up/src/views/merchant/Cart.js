import React, { useState, Component } from 'react';
import './Cart.css';

const Packets = require("../../backend/packets");

function Cart() {

    let ws = new WebSocket("ws://localhost:5005/");

    // websocket open and close
    ws.onopen = () => {
        console.log("ws opened: merchant cart");
        const userPacket = "GetCartItems(localStorage.getItem('token'));"//new Packets.GetLinkedItems(localStorage.getItem('token'));
        console.log("User string: " + userPacket.toString());
        ws.send(userPacket.toString());
    }
    ws.onclose = () => console.log("ws closed: merchant cart");

    // when websocket gets resposne back
    ws.onmessage = (res) => {
        const packet = res.data;
        console.log(packet);
        if(Packets.getPacketType(packet) === Packets.PacketTypes.SET_LINKED_ITEMS){
            console.log("Cart items packet");
            const tmp = JSON.parse(packet);
            setItems(tmp.data);
        }

        ws.close();
    }; 

    // websocket error
    ws.onerror = (e) => {
        console.error("WebSocket error:", e.message);
    };

    const handleOrder = () => {
        alert("Cart items ordered!");
        // something something PlaceOrder packet
    }

    const [items, setItems] = useState([]);
    const heading = ["ID", "Name", "Description", "Quantity", "Price", "Weight", "Supplier", "Date", "Remove"]

    return (
        <div className="browse" >
            <h1 class="text-center">Cart</h1>
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
            <button className="place-order-btn" onClick={handleOrder}>
                Place Order
            </button>
        </div>
    );
  
}

class TableRow extends Component {
    // remove to cart
    handleRemove = () => {
        alert("Item removed from cart!");
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
                        <button className="cart" onClick={this.handleRemove}>
                            Remove
                        </button>
                    </td>
                </tr>
            )
        }
    }
}

export default Cart;