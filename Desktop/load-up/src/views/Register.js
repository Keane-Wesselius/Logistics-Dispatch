import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { useNavbarUpdate } from '../NavbarContext';
import Welcome from '../components/Welcome'
import './LoginRegister.css'; 

const Packets = require("../backend/packets");

function Register() {
  let ws = new WebSocket("ws://localhost:5005/");
  const navigate = useNavigate();
  const updateNavbar = useNavbarUpdate();

  // websocket open and close
  ws.onopen = () => console.log("ws opened: register");
  ws.onclose = () => console.log("ws closed: register");

  // when websocket gets resposne back
  useEffect(() => {
    ws.onmessage = (res) => {
      const packet = res.data;
      console.log(packet);
  
      if (Packets.getPacketType(packet) === Packets.PacketTypes.ACCOUNT_CREATE_SUCCESS) {
        alert("Account created successfully");
        
        if (accType === "merchant") {
          navigate("/merchant_home");
        }
        else {
          navigate("/supplier_home");
        }
  
        updateNavbar(accType);
      }
      else if (Packets.getPacketType(packet) === Packets.PacketTypes.ACCOUNT_CREATE_FAILED) {
        alert("Error creating account");
      }
    };
  });

  // websocket error
  ws.onerror = (e) => {
    console.error("WebSocket error:", e.message);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const accountPacket = new Packets.CreateAccountPacket(name, email, password, accType);
    console.log("Account create string: " + accountPacket.toString());

    ws.send(accountPacket.toString());
  };

  const [name, setName] = useState("");
  const [accType, setAccType] = useState("");
  const [email, setEmail] = useState("");
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
              <form action="/register" method="POST">
                {/*<!-- 2 column grid layout with text inputs for the first and last names -->*/}
                <div class="row">
                  
                  <h1 class="mb-3 h3">Register</h1>
                  <div class="col-md-12 mb-4">
                    <div class="form-outline">
                      <input type="text" name="name" id="form3Example2" class="form-control" required onChange={e => setName(e.target.value)}/>
                      <label class="form-label" for="form3Example2" required>Full Name</label>
                    </div>
                  </div>
                </div>
  
                {/*<!-- Email input -->*/}
                <div class="form-outline mb-4">
                  <input type="email" name="email" id="form3Example3" class="form-control" required onChange={e => setEmail(e.target.value)} />
                  <label class="form-label" for="form3Example3">Email address</label>
                </div>
  
                {/*<!-- Password input -->*/}
                <div class="form-outline mb-4">
                  <input type="password" name="password" id="form3Example4" class="form-control" required onChange={e => setPassword(e.target.value)} />
                  <label class="form-label" for="form3Example4">Password</label>
                </div>

                <div class="form-outline mb-4">
                  <label class="form-label" for="form3Example5">Account Type</label>
                  <select className="account-type" name="type" id="form3Example5" required onChange={e => setAccType(e.target.value)}>
                    <option hidden-value="" disabled selected hidden>Select One</option>
                    <option value="merchant">Merchant</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>

                {/*<!-- Submit button -->*/}
                <button type="submit" class="btn btn-primary btn-block mb-4" onClick={handleCreate}>
                  Sign up
                </button>
  
                {/*<!-- Register buttons -->*/}
                <div class="text-center">
                  <p>Already have an account? <a href="/">Login</a></p>
                
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

export default Register;