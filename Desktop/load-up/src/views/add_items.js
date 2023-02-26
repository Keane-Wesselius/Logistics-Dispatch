import './add_items.css';

function Scheduling() {
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
        <div>
            <h1 class="text-center">Add Items</h1>
            <form className="add-item" id="add-item">

                <label class="font-weight-bold" for="item_name">Item Name:</label>
                <input type="text" id="item_name" name="item_name" required />

                <label class="font-weight-bold" for="item_description">Item Description:</label>
                <input type="text" id="item_description" name="item_description" required />

                <label class="font-weight-bold" for="item_quantity">Quantity:</label>
                <input type="text" id="item_quantity" name="item_quantity" required />

                <label class="font-weight-bold" for="item_price">Price Per Unit:</label>
                <input type="text" id="item_price" name="item_price" required />

                <label class="font-weight-bold" for="item_weight">Weight:</label>
                <input type="text" id="item_weight" name="item_weight" required />

                <input className="item-submit" type="submit" value="Add Item" onClick={handleFormSubmit} />
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

export default Scheduling;