#!/usr/bin/env node

// server.js

const net = require('net');

const PORT = 8000;
const ALLOWED_VERSION = "1.2.2";

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

// Function to handle initial messages from clients upon connection
function handleInitialMessage(message, clientSocket) {
    // Check if the client version matches the allowed version
    if (message.type === 'authentication' && message.clientVersionNumber !== ALLOWED_VERSION) {
        console.log(`Connection from client with version ${message.clientVersionNumber} refused.`);
        clientSocket.end(); // Close the connection immediately
        return;
    }

    // Handle the initial message based on its type or content
    console.log(`Received initial message from ${message.sender} - client version: ${message.clientVersionNumber}`);
    // You can authenticate the client, validate its version, etc.

    // Broadcast join message to all clients
    const joinMessage = JSON.stringify({ sender: "Server", text: `${message.sender} joined the chat` }) + '\r\n';
    broadcast(joinMessage, clientSocket);
}

// Function to handle leaving messages from clients
function handleExitingMessage(message, clientSocket) {
    // Broadcast leave message to all clients
    const leaveMessage = JSON.stringify({ sender: "Server", text: `${message.sender} left the chat` }) + '\r\n';
    broadcast(leaveMessage, clientSocket);
    console.log(`${message.sender} left the chat`);
}
function sendServerTime(clientSocket) {
    const now = new Date();

    // Get the current time components
    const hours = now.getHours().toString().padStart(2, '0'); // Add leading zero if needed
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    // Construct the time string in HH:MM:SS format
    const timeString = `${hours}:${minutes}:${seconds}`;
    const message = {
        sender: "Server",
        text: timeString,
    };
    clientSocket.write(JSON.stringify(message)+ '\r\n' )
}
// Create a TCP server
const server = net.createServer(clientSocket => {
    // Generate a unique ID for the client
    const clientId = nextClientId++;

    // Add the new client to the array
    clients.push({ id: clientId, socket: clientSocket });

    // Set up event listeners for data, end, and error events
    clientSocket.on('data', data => {
        const message = JSON.parse(data.toString().trim());
        
        // Check if it's the initial message upon connection
        if (message.clientVersionNumber === ALLOWED_VERSION) {
            if (message.type === 'leaving') {
                handleExitingMessage(message, clientSocket);
            } else if (message.type === 'authentication') {
                handleInitialMessage(message, clientSocket);
            } else if (message.type === 'command') {
                switch(message.command){
                case "time":
                    sendServerTime(clientSocket);   }
            } 
            
            else {
                // Broadcast the message to all clients
                broadcast(data.toString(), clientSocket);
                console.log(`${message.sender} - ${message.clientVersionNumber}:  ${message.text}`);
            }
        } else {
            clientSocket.end(); // Close the connection immediately
        }
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
