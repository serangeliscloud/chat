#!/usr/bin/env node

const net = require('net');

const PORT = 8000;
const DELIMITER = '\r\n';

// Array to hold connected clients
const clients = [];

// Function to broadcast messages to all clients
function broadcast(message, sender) {
    clients.forEach(client => {
        // Send the message to all clients except the sender
        if (client !== sender) {
            client.write(message);
        }
    });
}

// Create a TCP server
const server = net.createServer(client => {
    // Add the new client to the array
    clients.push(client);

    // Set up event listeners for data, end, and error events
    client.on('data', data => {
        const message = data.toString().trim();

        // Broadcast the message to all clients
        broadcast(message, client);
    });

    client.on('end', () => {
        // Remove the client from the array when it disconnects
        const index = clients.indexOf(client);
        if (index !== -1) {
            clients.splice(index, 1);
        }
    });

    client.on('error', err => {
        console.error('Client error:', err);
    });
});

// Start listening for connections
server.listen(PORT, () => {
    console.log(`Chat server is running on port ${PORT}`);
});
