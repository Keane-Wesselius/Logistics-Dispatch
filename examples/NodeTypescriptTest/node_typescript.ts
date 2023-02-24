import { WebSocket } from "ws";

enum AccountTypes {
	DRIVER,
	MERCAHNT,
	SUPPLIER,
}

const wss = new WebSocket.WebSocketServer({ port: 5005, maxPayload: 10 * 1000 * 1000 });

console.log(AccountTypes.DRIVER);