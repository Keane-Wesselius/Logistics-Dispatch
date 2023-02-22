import { GoogleMap } from '@react-google-maps/api';
import './Dashboard.css';

function Dashboard() {
    return (
    <div>
        <div class="nav">
            <a class="active" href="#">Dashboard</a>
            <a href="#">Tracking and Coordination</a>
            <a href="#">Dispatch Service</a>
            <a href="#">Optimization</a>
            <a href="#">Scheduling</a>
        </div>
        <div class="container">
            <h1>Delivery Dashboard</h1>
            <table className="dash-table">
            <tr>
                <th>Delivery ID</th>
                <th>Delivery Address</th>
                <th>Delivery Status</th>
                <th>Driver</th>
                <th>Vehicle</th>
            </tr>
            <tr>
                <td>001</td>
                <td>123 Main St.</td>
                <td>Pending</td>
                <td>John Doe</td>
                <td>Truck 1</td>
            </tr>
            <tr>
                <td>002</td>
                <td>456 Elm St.</td>
                <td>Pending</td>
                <td>Jane Smith</td>
                <td>Truck 2</td>
            </tr>
            <tr>
                <td>003</td>
                <td>789 Oak St.</td>
                <td>In Transit</td>
                <td>John Doe</td>
                <td>Truck 1</td>
            </tr>
            </table>
            <GoogleMap class="map"
            center={{lat: 37.7749, lng: -122.4194}}
            zoom={13}
        >
            <h2>Delivery Route</h2>
            </GoogleMap>
        </div>
    </div>
  );
}

export default Dashboard;
