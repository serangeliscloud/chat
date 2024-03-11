

// client.js
const net = require('net');
const readline = require('readline');
const fs = require('fs');
const crypto = require('crypto');
const path =  require('path');
const HOST = 'localhost';
const PORT = 8000;
const ENCRYPTIONPASSKEY = 516;
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

// function to translate a file to base64
function fileToBase64(filePath) {
    try {
        // Read file synchronously
        // console.log('Reading file:', filePath);
        const fileData = fs.readFileSync(filePath);
        // console.log('File read successfully');

        // Convert file data to Base64
        const base64Data = fileData.toString('base64');
        // console.log('File converted to Base64:', base64Data);

        return base64Data;
    } catch (error) {
        console.error("Error occurred while converting file to Base64:", error);
        return null;
    }
}

function requestDownloadFile(filePath) {
    const message = {
        sender: USERNAME,
        type: 'command',
        command: 'downloadFile',
        filePath: filePath,
        clientVersionNumber: clientVersion
    };
    client.write(JSON.stringify(message) + '\r\n');
}

// Function to convert Base64 to file
function base64ToFile(message) {
    try {
            // Create the directory if it doesn't exist
            const folderPath = './ClientDownloads';
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
            const base64Data = message.contents
            const filePath = `./ClientDownloads/${message.fileName}${message.fileExtension}`
            // Convert Base64 to binary data
            const binaryData = Buffer.from(base64Data, 'base64');

            // Write binary data to file
            fs.writeFileSync(filePath, binaryData);

            console.log(`File successfully saved to ${filePath}`);
        } catch (error) {
            console.error("Error occurred while converting Base64 to file:", error);
        }2
}

function fileExists(filePath) {
    try {
        // Check if the file exists using fs.accessSync
        fs.accessSync(filePath, fs.constants.F_OK);
        return true; // File exists
    } catch (error) {
        // File does not exist or cannot be accessed
        return false;
    }
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
            console.log(colors.red + 'Invalid username. Please enter a non-empty username.' + colors.reset);
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
    if (message.sender === "Server") {
        if (message.type === "fileContents"){
            // console.log(colors.cyan + `${message.sender}: ${message.contents}` + colors.reset); debug
            base64ToFile(message)
        }
        else{
        console.log(colors.cyan + `${message.sender}: ${message.text}` + colors.reset);}}
    else {
        if (message.publicEncryptioKey === hashValueEncryptionKey) {
            var decrypted = decrypt(message.text)
            console.log(message.usernameColor + `${message.sender}: ` + colors.reset + `${decrypted.toString()}`);
        } else {
            console.log(message.usernameColor + `${message.sender} ` + colors.reset + `is not using the same encryption key as you, you can't see this message.`)
        }
    }
});

// Event listener for server connection closed
client.on('end', () => {
    console.log(colors.red + 'Disconnected from the chat server' + colors.reset);
    rl.close();
});

// Event listener for client error
client.on('error', err => {
    console.error(colors.red + 'Client error:', err + colors.reset);
    rl.close();
});

getUsername((username) => {
    client.connect(PORT, HOST, () => {
        console.log(colors.cyan + 'Connected to the chat server' + colors.reset);
        console.log(colors.green + `Username set as:` + colors.reset + userColor + ` ${USERNAME}` + colors.reset);

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
});rl.on('line', input => {
    // Trim input to remove leading and trailing whitespace
    input = input.trim();

    // Check if the input is not empty
    if (input !== "") {
        // Check if the input starts with '!'
        if (input.startsWith('!')) {
            // Split input by space to separate command, filepath, and filename
            const [command, ...args] = input.slice(1).split(' '); // Remove '!' from the command
            switch(command) {
                case "time":
                    const messageTime = {
                        sender: USERNAME,
                        type: 'command',
                        command: "time",
                        clientVersionNumber: clientVersion
                    };
                    // Send the JSON message to the server
                    client.write(JSON.stringify(messageTime) + '\r\n');
                    break;
                case "sendFile":
                    const [filePath] = args;
                    if (filePath) {
                        if (fileExists(filePath)) {
                            const base64Data = fileToBase64(filePath);
                        if (base64Data) {
                            // Parse the file extension
                            const fileExtension = path.extname(filePath);
                            const fileMessage = {
                                sender: USERNAME,
                                type: 'command',
                                command: "sendFile",
                                filePath: filePath,
                                fileData: base64Data,
                                fileExtension: fileExtension,
                                clientVersionNumber: clientVersion
                            };
                            client.write(JSON.stringify(fileMessage) + '\r\n');
                        }
                    } else {
            console.log("Invalid file path or file does not exist");
        }
    } else {
        console.log("Missing arguments for !sendFile command.");
    }
    break;

                case "downloadFile":
                    const [downloadFilePath] = args;
                    if (downloadFilePath) {
                        const downloadMessage = {
                            sender: USERNAME,
                            type: 'command',
                            command: "downloadFile",
                            filePath: downloadFilePath,
                            clientVersionNumber: clientVersion
                        };
                        client.write(JSON.stringify(downloadMessage) + '\r\n');
                    } else {
                        console.log("Missing arguments for !downloadFile command.");
                    }
                    break;
                default:
                    console.log("Unknown command.");
            }
        } else {
            // If not a command, treat it as a regular message
            const encryptedText = encrypt(input); // Convert encrypted object to string
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
    } else {
        // If message is empty
        console.log(colors.red + "Message cannot be an empty string" + colors.reset);
    }
});




// Handle Ctrl+C to gracefully disconnect from the server
rl.on('SIGINT', () => {
    const finalMessage = {
        sender: USERNAME,
        type: 'leaving',
        clientVersionNumber: clientVersion,
        text: `${USERNAME} left the chat`,
        usernameColor: userColor
    };
    client.write(JSON.stringify(finalMessage) + '\r\n');
    client.end();
    rl.close();
});
