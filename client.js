#!/usr/bin/env node

// client.js
const net = require('net');
const readline = require('readline');
const fs = require('fs');

const HOST = 'localhost';
const PORT = 8000;

// Set up readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to get username
function getUsername(callback) {
    rl.question('Please enter your username: ', (username) => {
        callback(username);
    });
}

// Read client version number from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const clientVersion = packageJson.version;

// Create a TCP client
const client = new net.Socket();

// Event listener for receiving data from the server
client.on('data', data => {
    const message = JSON.parse(data.toString());
    console.log(`${message.sender}: ${message.text}`);
});

// Event listener for server connection closed
client.on('end', () => {
    console.log('Disconnected from the chat server');
    rl.close();
});

// Event listener for client error
client.on('error', err => {
    console.error('Client error:', err);
    rl.close();
});

getUsername((USERNAME) => {
    client.connect(PORT, HOST, () => {
        console.log('Connected to the chat server');
        console.log(`Username set as: ${USERNAME}`);

        // Send an initial message to the server for client information gathering 
        const initialMessage = {
            sender: USERNAME,
            type: 'authentication',
            clientVersionNumber: clientVersion,
            text: 'Initial message for authentication or other purposes'
        };
        console.log('Sending initial message to server:', initialMessage);
        client.write(JSON.stringify(initialMessage) + '\r\n');
    });
});

// Event listener for user input
rl.on('line', input => {
    // Create a JSON message object
    const message = {
        sender: USERNAME,
        text: input,
        clientVersionNumber: clientVersion
    };

    // Send the JSON message to the server
    client.write(JSON.stringify(message) + '\r\n');
});

// Handle Ctrl+C to gracefully disconnect from the server
rl.on('SIGINT', () => {
    const finalMessage = {
        sender: USERNAME,
        type: 'leaving',
        clientVersionNumber: clientVersion,
        text: `${USERNAME} left the chat`
    };
    client.write(JSON.stringify(finalMessage) + '\r\n');
    client.end();
    rl.close();
});
