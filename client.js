#!/usr/bin/env node

// client.js
const net = require('net');
const readline = require('readline');
const fs = require('fs');

const HOST = 'localhost';
const PORT = 8000;
const ENCRYPTIONPASSKEY = 516

// Set up readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Define username as a constant
let USERNAME;

// functions to encrypt and decrypt strings
function encrypt(text) {
    let encryptedText = "";
    for (let i = 0; i < text.length; i++) {
        encryptedText += String.fromCharCode(text.charCodeAt(i) + ENCRYPTIONPASSKEY);
    }
    return encryptedText;
}

function decrypt(encryptedText) {
    let decryptedText = "";
    for (let i = 0; i < encryptedText.length; i++) {
        decryptedText += String.fromCharCode(encryptedText.charCodeAt(i) - ENCRYPTIONPASSKEY);
    }
    return decryptedText;
}

// Function to get username
function getUsername(callback) {
    rl.question('Please enter your username: ', (username) => {
        USERNAME = username; // Set the username
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
    if (message.sender=== "Server"){
        console.log(`${message.sender}: ${message.text}`);
    }
    else{
    var decrypted = decrypt(message.text)
    console.log(`${message.sender}: ${decrypted.toString()}`);}
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

getUsername((username) => {
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
        // console.log('Sending initial message to server:', initialMessage); logging
        client.write(JSON.stringify(initialMessage) + '\r\n');
    });
});

// Event listener for user input
rl.on('line', input => {
    // Check if the input starts with '!'
    if (input.startsWith('!')) {
        // If it does, set message type as 'command'
        const message = {
            sender: USERNAME,
            type: 'command',
            command: input.slice(1), // Remove '!' from the text
            clientVersionNumber: clientVersion
        };
        // Send the JSON message to the server
        client.write(JSON.stringify(message) + '\r\n');
    } else {
        // If not a command, treat it as a regular message
        const encryptedText = encrypt(input) // Convert encrypted object to string
        const message = {
            sender: USERNAME,
            text: encryptedText, // Send the encrypted text instead of the encrypted object
            clientVersionNumber: clientVersion
        };
        // Send the JSON message to the server
        client.write(JSON.stringify(message) + '\r\n');
    }
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
