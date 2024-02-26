#!/usr/bin/env node

// server.js

const net = require('net');

const PORT = 8000;

// Counter for generating unique client IDs
let nextClientId = 1;

// Array to hold connected clients, each with an ID
const clients = [];

// Function to broadcast messages to all clients
function broadcast(message, sender) {
    clients.forEach(client => {
        // Send the message to all clients except the sender
        if (client.socket !== sender) {
            client.socket.write(message);
        }
    });
}

// Create a TCP server
const server = net.createServer(clientSocket => {
    // Generate a unique ID for the client
    const clientId = nextClientId++;

    // Add the new client to the array
    clients.push({ id: clientId, socket: clientSocket });

    // Broadcast a message to all clients to inform about the new connection
    const message = JSON.stringify({ sender: "Server",type: 'connection', text: `Client ${clientId} has connected` }) + '\r\n';
    broadcast(message, clientSocket);

    // Set up event listeners for data, end, and error events
    clientSocket.on('data', data => {
        const message = data.toString().trim();

        // Broadcast the message to all clients
        broadcast(message, clientSocket);
    });

    clientSocket.on('end', () => {
        // Remove the client from the array when it disconnects
        const index = clients.findIndex(client => client.socket === clientSocket);
        if (index !== -1) {
            clients.splice(index, 1);
        }
    });

    clientSocket.on('error', err => {
        console.error('Client error:', err);
    });
});

// Start listening for connections
server.listen(PORT, () => {
    console.log(`Chat server is running on port ${PORT}`);
});
