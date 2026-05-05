import { io } from "socket.io-client";

// In AI Studio, the app is served on port 3000
const socket = io();

export default socket;
