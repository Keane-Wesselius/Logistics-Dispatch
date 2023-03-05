import './Scheduling.css';
import React, { useState, useEffect, Component } from 'react';
import { useNavbarUpdate } from '../../NavbarContext';
const Packets = require("../../backend/packets");

let ws = null;
function Browse() {
    const updateNavbar = useNavbarUpdate();
    updateNavbar('supplier');

    useEffect(() => {
        if (ws == null) {
            ws = new WebSocket("ws://localhost:5005/");
        }
    
         // websocket open and close
        ws.onopen = () => {
            console.log("ws opened: confirm orders");
            const userPacket = new Packets.GetLinkedOrders(localStorage.getItem('token'));
            console.log("User string: " + userPacket.toString());
            ws.send(userPacket.toString());
        }
        ws.onclose = () => console.log("ws closed: confirm orders");

        // when websocket gets resposne back
        ws.onmessage = (res) => {
            const packet = res.data;
            console.log(packet);
            if(Packets.getPacketType(packet) === Packets.PacketTypes.SET_LINKED_ORDERS){
                console.log("Linked orders packet");
                const tmp = JSON.parse(packet);
                setOrders(tmp.data);
            } else if(Packets.getPacketType(packet) === Packets.PacketTypes.UPDATE_ORDER_STATUS_SUCCESS){
                console.log("Order status change success packet");
                alert("Order has been confirmed!");
            } else if(Packets.getPacketType(packet) === Packets.PacketTypes.UPDATE_ORDER_STATUS_FAILURE){
                console.log("Order status change failure packet");
                alert("Can only confirm pending orders!");
            }

            // ws.close();
        }; 

        // websocket error
        ws.onerror = (e) => {
            console.error("WebSocket error:", e.message);
        };
    }, []);

    const [orders, setOrders] = useState([]);
    const heading = ["Merchant ID", "Items", "Start Address", "End Address", "Est Delivery Date", "Min Delivery Price", "Max Delivery Price", "Status", "Pending Date", "Pending Time", "Total Cost", "Confirm Order"]

    return (
        <div className="browse" >
            <h1 class="text-center">Confirm Orders</h1>
            <table className="bitem-table">
                <thead>
                    <tr>
                        {heading.map((header) => <th className="bitem-th" >{header}</th>)}
                    </tr>
                </thead>
                <tbody id="bitem-table">
                    {/*<!-- item data will be dynamically added here -->*/}
                    {orders.map((order) => (<TableRow rowContent={order} />))}
                
                </tbody>
            </table>
        </div>
    );
  
}

// TODO add drop down for items list
class TableRow extends Component {
    // add to cart
    handleSubmit = () => {
        const confirmPacket = new Packets.UpdateOrderStatus(this.props.rowContent._id, 'confirmed', localStorage.getItem('token'));
        console.log("User string: " + confirmPacket.toString());
        ws.send(confirmPacket.toString());
    }

    render() {
        var row = this.props.rowContent;
        var range = []
        for (var i = 1; i <= row.quantity; i++) {
            range.push(i);
        }

        if (Object.hasOwn(row, 'merchantId') && Object.hasOwn(row, 'items') && Object.hasOwn(row, 'startingAddress') && Object.hasOwn(row, 'endingAddress') && 
            Object.hasOwn(row, 'estimatedDeliveryDate') && Object.hasOwn(row, 'minimumDeliveryPrice') && Object.hasOwn(row, 'maximumDeliveryPrice') && 
            Object.hasOwn(row, 'status') && Object.hasOwn(row, 'pendingDate') && Object.hasOwn(row, 'pendingTime') && Object.hasOwn(row, 'totalCost')){
            return (
                <tr>
                    <td>{row.merchantId}</td>
                    <td>Items</td>
                    <td>{row.startingAddress}</td>
                    <td>{row.endingAddress}</td>
                    <td>{row.estimatedDeliveryDate}</td>
                    <td>{row.minimumDeliveryPrice}</td>
                    <td>{row.maximumDeliveryPrice}</td>
                    <td>{row.status}</td>
                    <td>{row.pendingDate}</td>
                    <td>{row.pendingTime}</td>
                    <td>{row.totalCost}</td>
                    <td>
                        <button className="confirm" onClick={this.handleSubmit}>
                            Confirm
                        </button>
                    </td>
                </tr>
            )
        }
    }
}

export default Browse;