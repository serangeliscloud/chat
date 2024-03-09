#!/usr/bin/env node

// client.js
const net = require('net');
const readline = require('readline');
const fs = require('fs');
const crypto = require('crypto');

const HOST = 'localhost';
const PORT = 8000;
const ENCRYPTIONPASSKEY = 516
const hashValueEncryptionKey = calculateHash(ENCRYPTIONPASSKEY);


// ansi codes for colors
const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
};

// Function to get a random color
function getRandomColor() {
    const colorKeys = Object.keys(colors); // Get keys of the colors object
    const randomIndex = Math.floor(Math.random() * (colorKeys.length - 1)); // Exclude reset key
    return colors[colorKeys[randomIndex]]; // Get random color code
}

// Get a random color for the user
const userColor = getRandomColor();

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

// calculate sha256 section

function calculateHash(integer) {
    // Convert integer to string before hashing
    const data = integer.toString();
    
    // Create hash object
    const hash = crypto.createHash('sha256');
    
    // Update hash object with data
    hash.update(data);
    
    // Calculate hash digest in hexadecimal format
    const hashDigest = hash.digest('hex');
    
    return hashDigest;
  }

// Function to get username
function getUsername(callback) {
    rl.question('Please enter your username: ', (username) => {
        // Check if the trimmed username is not an empty string
        if (username.trim() !== '') {
            USERNAME = username; // Set the username
            callback(username);
        } else {
            // Handle case of empty or whitespace-only input
            console.log(colors.red+'Invalid username. Please enter a non-empty username.'+colors.reset);
            // Ask for username again
            getUsername(callback);
        }
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
        console.log(colors.cyan+`${message.sender}: ${message.text}`+colors.reset);
    }
    else{
        if (message.publicEncryptioKey === hashValueEncryptionKey){
            var decrypted = decrypt(message.text)
            console.log(message.usernameColor+`${message.sender}: `+colors.reset+`${decrypted.toString()}`);}
        else {
            console.log(message.usernameColor+`${message.sender} `+colors.reset+`is not using the same encryption key as you, you can't see this message.`)
        }}});

// Event listener for server connection closed
client.on('end', () => {
    console.log(colors.red+'Disconnected from the chat server'+colors.reset);
    rl.close();
});

// Event listener for client error
client.on('error', err => {
    console.error(colors.red+'Client error:', err+colors.reset);
    rl.close();
});

getUsername((username) => {
    client.connect(PORT, HOST, () => {
        console.log(colors.cyan+'Connected to the chat server'+colors.reset);
        console.log(colors.green+`Username set as: ${USERNAME}`+colors.reset);

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
    
    if (input.trim() !== ""){

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
            text: encryptedText, 
            clientVersionNumber: clientVersion,
            publicEncryptioKey: hashValueEncryptionKey,
            usernameColor: userColor
        };
        // Send the JSON message to the server
        client.write(JSON.stringify(message) + '\r\n');
    }
    }
    // if message is empty
    else {
        console.log(colors.red+"message cannot be an empty string"+colors.reset)
    }});


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
