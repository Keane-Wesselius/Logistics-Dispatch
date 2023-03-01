import './Scheduling.css';

function Scheduling() {
    let deliveries = [];

    // Function to add a delivery to the table
    function addDeliveryToTable(delivery) {
        const deliveryTable = document.getElementById("delivery_table");

        const row = deliveryTable.insertRow();
        row.insertCell().innerHTML = delivery.date;
        row.insertCell().innerHTML = delivery.time;
        row.insertCell().innerHTML = delivery.address;
        row.insertCell().innerHTML = delivery.type;
    }

    // Function to clear fields after submission
    function clearFields(event) {
        document.getElementById("delivery_date").value = "";
        document.getElementById("delivery_time").value = "";
        document.getElementById("delivery_address").value = "";
        document.getElementById("delivery_type").value = "";
    }

    // Function to handle form submission
    function handleFormSubmit(event) {
        event.preventDefault(); // Prevent form from submitting and refreshing the page

        // Get form data
        const deliveryDate = document.getElementById("delivery_date").value;
        const deliveryTime = document.getElementById("delivery_time").value;
        const deliveryAddress = document.getElementById("delivery_address").value;
        const deliveryType = document.getElementById("delivery_type").value;

        // If form is complete
        if (deliveryDate !== "" && deliveryTime !== "" && deliveryAddress !== "" && deliveryType !== "")
        {
           // Create delivery object
        const delivery = {
            date: deliveryDate,
            time: deliveryTime,
            address: deliveryAddress,
            type: deliveryType
        };

        // Add delivery to deliveries array
        deliveries.push(delivery);

        // Add delivery to table
        addDeliveryToTable(delivery); 

        // Reset form
        clearFields();
        }
    }
    
    return (
        <div>
            <h1 class="text-center">Delivery Scheduling</h1>
            <form className="delivery-schedule" id="delivery-schedule">
                <label class="font-weight-bold" for="delivery_date">Delivery Date:</label>
                <input type="date" id="delivery_date" name="delivery_date" required />

                <label class="font-weight-bold" for="delivery_time">Delivery Time:</label>
                <input type="time" id="delivery_time" name="delivery_time" required />

                <label class="font-weight-bold" for="delivery_address">Delivery Address:</label>
                <input type="text" id="delivery_address" name="delivery_address" required />

                <label for="delivery_type">Delivery Type:</label>
                <select className="delivery-input" id="delivery_type" name="delivery_type" required>
                    <option value="">Select Delivery Type</option>
                    <option value="Standard">Standard</option>
                    <option value="Express">Express</option>
                    <option value="Next Day">Next Day</option>
                </select>

                <input className="delivery-submit" type="submit" value="Schedule Delivery" onClick={handleFormSubmit} />
            </form>

            <table className="delivery-table">
                <thead>
                    <tr>
                        <th className="delivery-th">Date</th>
                        <th className="delivery-th">Time</th>
                        <th className="delivery-th">Address</th>
                        <th className="delivery-th">Type</th>
                    </tr>
                </thead>
                <tbody id="delivery_table">
                    {/*<!-- Delivery data will be dynamically added here -->*/}
                </tbody>
            </table>
        </div>
    );
  
}

export default Scheduling;