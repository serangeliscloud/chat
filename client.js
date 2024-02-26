#!/usr/bin/env node

const net = require('net');
const readline = require('readline');

const HOST = 'localhost';
const PORT = 8000;

// Create a TCP client
const client = net.createConnection({ host: HOST, port: PORT }, () => {
    console.log('Connected to the chat server');
});

// Set up readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Event listener for receiving data from the server
client.on('data', data => {
    const message = JSON.parse(data.toString());
    console.log(`${message.sender}: ${message.text}`);
});

// Event listener for server connection closed
client.on('end', () => {
    console.log('Disconnected from the chat server');
});

// Event listener for client error
client.on('error', err => {
    console.error('Client error:', err);
});

// Event listener for user input
rl.on('line', input => {
    // Create a JSON message object
    const message = {
        sender: 'Me',
        text: input
    };

    // Send the JSON message to the server
    client.write(JSON.stringify(message) + '\r\n');
});

// Handle Ctrl+C to gracefully disconnect from the server
rl.on('SIGINT', () => {
    client.end();
    rl.close();
});
