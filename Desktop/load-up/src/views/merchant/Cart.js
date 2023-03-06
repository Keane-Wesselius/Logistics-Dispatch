import React, { useState, useEffect, Component } from 'react';
import './Cart.css';
import { useNavbarUpdate } from '../../NavbarContext';
const Packets = require("../../backend/packets");

let ws = null;
function Cart() {
    const updateNavbar = useNavbarUpdate();
    updateNavbar('merchant');

    useEffect(() => {
        //if (ws == null || (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING)) {
            ws = new WebSocket("ws://localhost:5005/");
        //}

        // websocket open and close
        ws.onopen = () => {
            console.log("ws opened: merchant cart");
            const userPacket = new Packets.GetCartItems(localStorage.getItem('token')); // "//new Packets.GetLinkedItems(localStorage.getItem('token'));
            console.log("User string: " + userPacket.toString());
            ws.send(userPacket.toString());
        }
        ws.onclose = () => console.log("ws closed: merchant cart");

        // when websocket gets resposne back
        ws.onmessage = (res) => {
            const packet = res.data;
            console.log(packet);
            if(Packets.getPacketType(packet) === Packets.PacketTypes.SET_CART_ITEMS){
                const setCartItemsPacket = Packets.SetCartItems.fromJSONString(packet);
                
                console.log("Cart items packet");
                setItems(setCartItemsPacket.itemList);
            } else if(Packets.getPacketType(packet) === Packets.PacketTypes.PLACE_ORDER_SUCCESS){
                alert("Successfully placed order!")
            } else if(Packets.getPacketType(packet) === Packets.PacketTypes.PLACE_ORDER_FAILURE){
                alert("Failed to place order.")
            } else if(Packets.getPacketType(packet) === Packets.PacketTypes.CART_ITEM_SUCCESS){
                alert("Item removed from cart!");
                window.location.reload();
            } else if(Packets.getPacketType(packet) === Packets.PacketTypes.CART_ITEM_FAILURE){
                alert("Failed to remove item from cart!");
            }

            // ws.close();
        }; 

        // websocket error
        ws.onerror = (e) => {
            console.error("WebSocket error:", e.message);
        };
    }, []);

    const [date, setDate] = useState("");

    const handleOrder = () => {
        if(date == "") {
            alert("Please select a delivery date.")
        } else {
            const placeOrderPacket = new Packets.PlaceOrder(date, localStorage.getItem('token'));
            console.log("Sending order packet: " + placeOrderPacket.toString());
            ws.send(placeOrderPacket.toString());
        }
        
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
            <form>
                <label for="delivery_date">Preferred Delivery Date:</label>
		        <input type="date" id="delivery_date" name="delivery_date" required onChange={e => setDate(e.target.value)}></input> 
            </form>
            <button className="place-order-btn" onClick={handleOrder}>
                Place Order
            </button>
        </div>
    );
  
}

class TableRow extends Component {
    // remove to cart
    handleRemove = () => {
        const removeCartItem = new Packets.RemoveCartItem(this.props.rowContent._id, localStorage.getItem('token'));
        console.log("Sending RemoveCartItem packet: " + removeCartItem.toString());
        ws.send(removeCartItem.toString());
    }

    render() {
        var row = this.props.rowContent;

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
                        <button className="cart" onClick={this.handleRemove}>
                            Remove
                        </button>
                    </td>
                </tr>
            )
        } else {
			console.log("Got malformed row object, not rendering: " + JSON.stringify(row));
		}
    }
}

export default Cart;