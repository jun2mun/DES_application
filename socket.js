const { io } = require("socket.io-client");

const socket = io("ws://localhost:5000/start");

// send a message to the server
socket.emit("hello from client", 5, "6", { 7: Uint8Array.from([8]) });

