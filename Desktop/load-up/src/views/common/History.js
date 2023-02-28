import React, { useState } from 'react';
import './History.css';

const Packets = require("../../backend/packets");

function History() {

    let ws = new WebSocket("ws://localhost:5005/");

    // websocket open and close
    ws.onopen = () => {
        console.log("ws opened: add items");
        const userPacket = new Packets.GetUserData(localStorage.getItem('token'));
        console.log("User string: " + userPacket.toString());
        ws.send(userPacket.toString());

    }
    ws.onclose = () => console.log("ws closed: add items");

    // when websocket gets resposne back
    ws.onmessage = (res) => {
        const packet = res.data;
        console.log(packet);
        // On success save user id
        if (Packets.getPacketType(packet) === Packets.PacketTypes.SET_USER_DATA) {
            console.log(JSON.parse(packet).data._id);
            localStorage.setItem('id', JSON.parse(packet).data._id);
        }else if(Packets.getPacketType(packet) === Packets.PacketTypes.SET_LINKED_ITEMS){
            console.log("Linked items packet");
            // TODO fix reading of data
            // console.log(JSON.parse(packet).data.name);
        }
    }; 

    // websocket error
    ws.onerror = (e) => {
        console.error("WebSocket error:", e.message);
    };

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");
    const [weight, setWeight] = useState("");

    let items = [];

    // Function to add a item to the table
    function addItemToTable(item) {
        const itemTable = document.getElementById("item-table");

        const row = itemTable.insertRow();
        row.insertCell().innerHTML = item.name;
        row.insertCell().innerHTML = item.description;
        row.insertCell().innerHTML = item.quantity;
        row.insertCell().innerHTML = item.price;
        row.insertCell().innerHTML = item.weight;
    }

    // Function to clear fields after submission
    function clearFields(event) {
        document.getElementById("item_name").value = "";
        document.getElementById("item_description").value = "";
        document.getElementById("item_quantity").value = "";
        document.getElementById("item_price").value = "";
        document.getElementById("item_weight").value = "";
    }

    // Function to handle form submission
    function handleFormSubmit(event) {
        event.preventDefault(); // Prevent form from submitting and refreshing the page

        // Send add item packet to backend
        const itemPacket = new Packets.AddItem(name, description, quantity, price, weight, localStorage.getItem('token'));
        console.log("Item add string: " + itemPacket.toString());
        ws.send(itemPacket.toString());

        // Retrieve linked items
        const itemsPacket = new Packets.GetLinkedItems(localStorage.getItem('token'));
        console.log("Item list string: " + itemsPacket.toString());
        ws.send(itemsPacket.toString());

        // Get form data
        const itemName = document.getElementById("item_name").value;
        const itemDescription = document.getElementById("item_description").value;
        const itemQuantity = document.getElementById("item_quantity").value;
        const itemPrice = document.getElementById("item_price").value;
        const itemWeight = document.getElementById("item_weight").value;
        
        // If form is complete
        if (itemName !== "" && itemDescription !== "" && itemQuantity !== "" && itemPrice !== "" && itemWeight !== "")
        {
           // Create item object
        const item = {
            name: itemName,
            description: itemDescription,
            quantity: itemQuantity,
            price: itemPrice,
            weight: itemWeight
        };

        // Add item to items array
        items.push(item);

        // Add item to table
        addItemToTable(item); 

        // Reset form
        clearFields();
        }
    }
    
    return (
        <div className="browse" >
            <h1 class="text-center">Purchased Items</h1>
            <table className="bitem-table">
                <thead>
                    <tr>
                        <th className="bitem-th">Name</th>
                        <th className="bitem-th">Description</th>
                        <th className="bitem-th">Price</th>
                        <th className="bitem-th">Weight</th>
                        <th className="bitem-th">Supplier</th>
                    </tr>
                </thead>
                <tbody id="bitem-table">
                    {/*<!-- item data will be dynamically added here -->*/}
                    <tr>
                        <td>Product 1</td>
                        <td>Food</td>
                        <td>$1</td>
                        <td>1 lbs.</td>
                        <td>Suppler 1</td>
                    </tr>
                    <tr>
                        <td>Product 2</td>
                        <td>Tool</td>
                        <td>$2</td>
                        <td>2 lbs.</td>
                        <td>Suppler 2</td>
                    </tr>
                    <tr>
                        <td>Product 3</td>
                        <td>Clothing</td>
                        <td>$3</td>
                        <td>3 lbs.</td>
                        <td>Suppler 3</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
  
}

export default History;