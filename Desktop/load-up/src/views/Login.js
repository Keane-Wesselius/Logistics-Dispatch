import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import Welcome from '../components/Welcome'
import './LoginRegister.css'; 

const Packets = require("../backend/packets");

function Login() {
  let ws = new WebSocket("ws://localhost:5005/");
  const navigate = useNavigate();

  // websocket open and close
  ws.onopen = () => console.log("ws opened: login");
  ws.onclose = () => console.log("ws closed: login");

  // when websocket gets resposne back
  ws.onmessage = (res) => {
    const packet = res.data;
    console.log(packet);

    if(Packets.getPacketType(packet) === Packets.PacketTypes.AUTHENTICATION_SUCCESS) {
      alert("Login successful")
      navigate("/home");
		}
    else if (Packets.getPacketType(packet) === Packets.PacketTypes.AUTHENTICATION_FAILED) {
      alert("Wrong username or password");
    }
  };

  // websocket error
  ws.onerror = (e) => {
    console.error("WebSocket error:", e.message);
  };

  // handles login
  const handleLogin = (e) => {
    e.preventDefault();
    //We create a packet to send to the backend using the username and password entered on the screen
    const loginPacket = new Packets.LoginPacket(username, password);
    console.log("Login Packet String: " + loginPacket.toString());

    ws.send(loginPacket.toString());
  };

  // state of username and password
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  return (
    <section class="background-radial-gradient overflow-hidden">
    <div class="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
      <div class="row gx-lg-5 align-items-center mb-5">
      <Welcome />
  
        <div class="col-lg-6 mb-5 mb-lg-0 position-relative">
          <div id="radius-shape-1" class="position-absolute rounded-circle shadow-5-strong"></div>
          <div id="radius-shape-2" class="position-absolute shadow-5-strong"></div>
  
          <div class="card bg-glass">
            <div class="card-body px-4 py-5 px-md-5">
              <form action="/login" method="POST">
                {/*<!-- 2 column grid layout with text inputs for the first and last names -->*/}
                <div class="row">
                  
                 {/* <% if (messages.error) { %>
                    <div class="alert alert-danger">
                      <strong><%= messages.error %> </strong>
                    </div>
                  <% } %> */}

                  <h1 class="mb-3 h3">Login</h1>
                  
                </div>
  
                {/*<!-- Email input -->*/}
                <div class="form-outline mb-4">
                  <input type="email" name="email" id="form3Example3" class="form-control" onChange={e => setUsername(e.target.value)} />
                  <label class="form-label" for="form3Example3">Email address</label>
                </div>
  
                {/*<!-- Password input -->*/}
                <div class="form-outline mb-4">
                  <input type="password" name="password" id="form3Example4" class="form-control" onChange={e => setPassword(e.target.value)} />
                  <label class="form-label" for="form3Example4">Password</label>
                </div>
  
                {/*<!-- Submit button -->*/}
                <button type="submit" class="btn btn-primary btn-block mb-4" onClick={handleLogin}>
                  Sign In
                </button>
  
                {/*<!-- Register buttons -->*/}
                <div class="text-center">
                  <p>Don't have an account yet? <a href="/register">Register</a></p>
                
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  )
}

export default Login;