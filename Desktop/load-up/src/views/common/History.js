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
            const orderPacket = new Packets.GetAllCompletedOrders(localStorage.getItem('token'));
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
            if(Packets.getPacketType(packet) === Packets.PacketTypes.SET_ALL_COMPLETED_ORDERS){
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
    const heading = ["ID", "Name", "Description", "Quantity", "Price", "Weight", "Supplier", "Date"]
    
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

class TableRow extends Component {
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
                </tr>
            )
        }
    }
}

export default History;