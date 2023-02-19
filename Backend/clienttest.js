const Packets = require("../Common/packets");
const WebSocket = require("ws");
const ws = new WebSocket((address = "ws://127.0.0.1:5005"));

ws.on("error", console.error);

// console.log(PacketDefinitions.Packet.toString());
// const testAuthenticatioNPacket = new PacketDefinitions.AuthenticationPacket("test");
// console.log(testAuthenticatioNPacket);
// console.log(PacketDefinitions.Constants.AUTHENTICATION);

ws.on("open", function open() {
  setInterval(() => {
    const loginPacket = new Packets.LoginPacket("Test1", "password1");
    console.log("Login Packet String: " + loginPacket.toString());

    ws.send(loginPacket.toString());

    const checkIfUserExists = new Packets.DoesUserExistPacket(
      "test@cwu.edu",
      "password1"
    );
    console.log(
      "checkIfUserExists Packet String: " + checkIfUserExists.toString()
    );

    ws.send(checkIfUserExists.toString());
  }, 1000);
});

ws.on("message", function message(data) {
  console.log("received: %s", data);
});
