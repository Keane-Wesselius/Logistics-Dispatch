import React, { useState, useEffect } from 'react';
import './AddItems.css';
import { useNavbarUpdate } from '../../NavbarContext';
const Packets = require("../../backend/packets");

let ws = null;

function AddItems() {
    
    const updateNavbar = useNavbarUpdate();
    updateNavbar('supplier');
    
    useEffect(() => {
        ws = new WebSocket("ws://localhost:5005/");
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
            } else if(Packets.getPacketType(packet) === Packets.PacketTypes.SET_LINKED_ITEMS){
                // console.log("Linked items packet");
                // TODO fix reading of data
                // console.log(JSON.parse(packet).data.name);
            }
        }; 

        // websocket error
        ws.onerror = (e) => {
            console.error("WebSocket error:", e.message);
        };
    }, []);


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
		// TODO: Replace with setting when desktop receives the SetLinkedItems packet.
        addItemToTable(item); 

        // Reset form
        clearFields();
        }
    }
    
    return (
        <div>
            <h1 class="text-center" >Add Items</h1>
            <form className="add-item" id="add-item">

                <label class="font-weight-bold" for="item_name">Item Name:</label>
                <input type="text" id="item_name" name="item_name" required onChange={e => setName(e.target.value)}/>

                <label class="font-weight-bold" for="item_description">Item Description:</label>
                <input type="text" id="item_description" name="item_description" required onChange={e => setDescription(e.target.value)}/>

                <label class="font-weight-bold" for="item_quantity">Quantity:</label>
                <input type="text" id="item_quantity" name="item_quantity" required onChange={e => setQuantity(e.target.value)}/>

                <label class="font-weight-bold" for="item_price">Price Per Unit:</label>
                <input type="text" id="item_price" name="item_price" required onChange={e => setPrice(e.target.value)}/>

                <label class="font-weight-bold" for="item_weight">Weight:</label>
                <input type="text" id="item_weight" name="item_weight" required onChange={e => setWeight(e.target.value)}/>

                <input className="item-submit" type="submit" value="Add Item" onClick={handleFormSubmit}  />
            </form>

            <table className="item-table">
                <thead>
                    <tr>
                        <th className="item-th">Name</th>
                        <th className="item-th">Description</th>
                        <th className="item-th">Quantity</th>
                        <th className="item-th">Price</th>
                        <th className="item-th">Weight</th>
                    </tr>
                </thead>
                <tbody id="item-table">
                    {/*<!-- item data will be dynamically added here -->*/}
                </tbody>
            </table>
        </div>
    );
  
}

export default AddItems;