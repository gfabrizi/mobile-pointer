// Import packages
const express = require("express");
const socketIO = require("socket.io");
const fs = require('fs');
const https = require("https");
require('dotenv').config();

// Configuration
const PORT = parseInt(process.env.PORT) || 443;

const app = express()
    // .use((req, res) => res.sendFile(INDEX) );
    .use(express.static('public'));

// Start server
const server = https.createServer(
        // Provide the private and public key to the server by reading each
        // file's content with the readFileSync() method.
        {
            key: fs.readFileSync(process.env.SSL_KEY),
            cert: fs.readFileSync(process.env.SSL_CERT),
        },
        app)
    .listen(PORT, () => console.log("Listening on localhost:" + PORT));

// Initiatlize SocketIO
const io = socketIO(server);

// Register "connection" events to the WebSocket
io.on("connection", function(socket) {
    // Register "join" events, requested by a connected client
    socket.on("join", function (room) {
        // join channel provided by client
        socket.join(room)
        socket.on("message", function(data) {
            // Broadcast the "message" event to all other clients in the room
            socket.broadcast.to(room).emit("message", data);
        });
        socket.on("typing", function() {
            // Broadcast the "typing" event to all other clients in the room
            socket.broadcast.to(room).emit("typing");
        });
        socket.on("image", function(data) {
            // Broadcast the "image" event to all other clients in the room
            socket.broadcast.to(room).emit("image", data);
        });
        socket.on("quaternion", function(msg) {
            // Broadcast the "quaternion" event to all other clients in the room
            socket.broadcast.to(room).emit("quaternion", msg);
        });
        socket.on("click", function() {
            // Broadcast the "click" event to all other clients in the room
            socket.broadcast.to(room).emit("click");
        });
    })
});