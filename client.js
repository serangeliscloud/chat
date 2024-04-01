

// client.js

// global constants
// Export the processCommand function
module.exports.processCommand = processCommand;

const net = require('net');
const readline = require('readline');
const fs = require('fs');
const crypto = require('crypto');
const path =  require('path');
const { enc } = require('crypto-js');
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
const userColor = getRandomColor();
// Set up readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// Define username as a constant
let USERNAME;

// functions

// Function to get a random color
function getRandomColor() {
    const colorKeys = Object.keys(colors); // Get keys of the colors object
    const randomIndex = Math.floor(Math.random() * (colorKeys.length - 1)); // Exclude reset key
    return colors[colorKeys[randomIndex]]; // Get random color code
}


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
        const base64Dat = fileData.toString('base64');
        // console.log('File converted to Base64:', base64Data);
        const base64Data = encrypt(base64Dat)  //encrypt base64Data
        return base64Data;
    } catch (error) {
        console.error("Error occurred while converting file to Base64:", error);
        return null;
    }
}

// Function to convert Base64 to file
function base64ToFile(message) {
    try {
            // Create the directory if it doesn't exist
            const folderPath = './ClientDownloads';
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
            const base64Data = decrypt(message.contents) // decrypt contents received from server
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
    const userInfoPath = './usr/userInfo.json'; // Path to the userInfo.json file

    // Check if userInfo.json file exists
    if (fs.existsSync(userInfoPath)) {
        // If the file exists, read the username from it
        fs.readFile(userInfoPath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading userInfo.json file:", err);
                // Prompt the user to enter the username manually
                askForUsername(callback);
            } else {
                try {
                    const userInfo = JSON.parse(data);
                    const username = userInfo.username.trim(); // Trim whitespace from the username
                    if (username !== '') {
                        // Username exists in the file and is not empty
                        USERNAME = username;
                        console.log("Username loaded from userInfo.json:",userColor, USERNAME, colors.reset);
                        callback(USERNAME);
                    } else {
                        // Username in the file is empty, ask for username manually
                        askForUsername(callback);
                    }
                } catch (parseError) {
                    console.error("Error parsing userInfo.json:", parseError);
                    // Prompt the user to enter the username manually
                    askForUsername(callback);
                }
            }
        });
    } else {
        // If userInfo.json file doesn't exist, create it and ask for username manually
        const initialUserInfo = { username: '' }; // Initial user info object
        fs.mkdir('./usr', { recursive: true }, (err) => {
            if (err) {
                console.error("Error creating usr directory:", err);
                // Prompt the user to enter the username manually
                askForUsername(callback);
            } else {
                // Write initial user info to userInfo.json
                fs.writeFile(userInfoPath, JSON.stringify(initialUserInfo), (writeErr) => {
                    if (writeErr) {
                        console.error("Error writing userInfo.json file:", writeErr);
                    } else {
                        // console.log("userInfo.json file created.");
                    }
                    // Ask for username manually
                    askForUsername(callback);
                });
            }
        });
    }
}

// Function to ask for username manually
function askForUsername(callback) {
    rl.question('Please enter your username: ', (username) => {
        if (username.trim() !== '') {
            // If the user enters a non-empty username
            USERNAME = username;
            const userInfo = { username: USERNAME }; // User info object to be written to userInfo.json
            // Save the username to userInfo.json
            fs.writeFile('./usr/userInfo.json', JSON.stringify(userInfo), (err) => {
                if (err) {
                    console.error("Error writing userInfo.json file:", err);
                } else {
                    // console.log("Username saved to userInfo.json file.");
                }
            });
            callback(username);
        } else {
            // Handle case of empty or whitespace-only input
            console.log(colors.red + 'Invalid username. Please enter a non-empty username.' + colors.reset);
            // Ask for username again
            askForUsername(callback);
        }
    });
}

// Function to handle SetStatus command
function setStatus(status) {
    const userInfoPath = './usr/userInfo.json'; // Path to the userInfo.json file

    // Read existing user info from the file
    fs.readFile(userInfoPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading userInfo.json file:", err);
        } else {
            try {
                // Parse the existing user info
                const userInfo = JSON.parse(data);
                // Update the status
                userInfo.status = status;

                // Write the updated user info back to the file
                fs.writeFile(userInfoPath, JSON.stringify(userInfo), (writeErr) => {
                    if (writeErr) {
                        console.error("Error writing userInfo.json file:", writeErr);
                    } else {
                        console.log("Status updated successfully:", status);
                        // Send initial message with updated status
                        sendInitialMessage();
                    }
                });
            } catch (parseError) {
                console.error("Error parsing userInfo.json:", parseError);
            }
        }
    });
}

// Function to handle reload command
function reloadConnection() {
    console.log(colors.yellow + 'Reloading connection to the server...' + colors.reset);
    client.end(); // Close the current connection

    // Reconnect to the server
    client.connect(PORT, HOST, () => {
        console.log(colors.cyan + 'Reloaded connection to the chat server' + colors.reset);
        console.log(colors.green + `Username set as:` + colors.reset + userColor + ` ${USERNAME}` + colors.reset);

        // Send initial message with status after reloading connection
        sendInitialMessage();
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

// Function to send the initial message with status
function sendInitialMessage() {
    // Read status from userInfo.json file
    const userInfoPath = './usr/userInfo.json';
    fs.readFile(userInfoPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading userInfo.json file:", err);
        } else {
            try {
                const userInfo = JSON.parse(data);
                const status = userInfo.status;
                // Create initial message with status
                const initialMessage = {
                    sender: USERNAME,
                    type: 'authentication',
                    clientVersionNumber: clientVersion,
                    text: 'Initial message for authentication or other purposes',
                    status: status  // Include status in the message
                };
                // Send the initial message to the server
                client.write(JSON.stringify(initialMessage) + '\r\n');
            } catch (parseError) {
                console.error("Error parsing userInfo.json:", parseError);
            }
        }
    });
}

// Get username and status
getUsername((username) => {
    // Connect to the server
    client.connect(PORT, HOST, () => {
        console.log(colors.cyan + 'Connected to the chat server' + colors.reset);
        console.log(colors.green + `Username set as:` + colors.reset + userColor + ` ${USERNAME}` + colors.reset);

        // Send initial message with status
        sendInitialMessage();
    });
});
rl.on('line', processInput);

function processInput(input) {
    const trimmedInput = input.trim();

    if (trimmedInput !== "") {
        if (trimmedInput.startsWith('!')) {
            processCommand(trimmedInput.slice(1));
        } else {
            processMessage(trimmedInput);
        }
    } else {
        console.log(colors.red + "Message cannot be an empty string" + colors.reset);
    }
}

function processCommand(input) {
    const [command, ...args] = input.split(' ');


    switch (command) {
        case "time":
            sendTimeCommand();
            break;
        case "sendFile":
            sendFileCommand(args);
            break;
        case "downloadFile":
            downloadFileCommand(args);
            break;
        case "ClientID":
            getClientIDCommand(args);
            break;
        case "ClientVersion":
            getClientVersionCommand(args);
            break;
        case "GetStatus":
            getClientStatusCommand(args);
            break;
        case "SetStatus":
            setStatusCommand(args);
            break;
        case "whisper":
            whisperCommand(args);
            break;
        case "Reload":
            reloadConnection();
            break;
        default:
            console.log("Unknown command.");
    }
}

function processMessage(input) {
    const encryptedText = encrypt(input);
    const message = {
        sender: USERNAME,
        text: encryptedText,
        clientVersionNumber: clientVersion,
        publicEncryptioKey: hashValueEncryptionKey,
        usernameColor: userColor
    };
    client.write(JSON.stringify(message) + '\r\n');
}

function sendTimeCommand() {
    const messageTime = {
        sender: USERNAME,
        type: 'command',
        command: "time",
        clientVersionNumber: clientVersion
    };
    client.write(JSON.stringify(messageTime) + '\r\n');
}

function sendFileCommand(args) {
    const [filePath] = args;
    if (filePath && fileExists(filePath)) {
        const base64Data = fileToBase64(filePath);
        if (base64Data) {
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
        } else {
            console.log("Invalid file path or file does not exist");
        }
    } else {
        console.log("Missing arguments for !sendFile command.");
    }
}

function downloadFileCommand(args) {
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
}

// Define other command functions similarly

function getClientIDCommand(args) {
    const [requestedUsernameCID] = args;
    if (requestedUsernameCID) {
        const message = {
            sender: USERNAME,
            type: 'command',
            command: 'getClientID',
            requestedUsername: requestedUsernameCID,
            clientVersionNumber: clientVersion
        };
        client.write(JSON.stringify(message) + '\r\n');
    } else {
        console.log("Missing username for getClientID command.");
    }
}

function getClientVersionCommand(args) {
    const [requestedUsernameCV] = args;
    if (requestedUsernameCV) {
        const message = {
            sender: USERNAME,
            type: 'command',
            command: 'getClientVersion',
            requestedUsername: requestedUsernameCV,
            clientVersionNumber: clientVersion
        };
        client.write(JSON.stringify(message) + '\r\n');
    } else {
        console.log("Missing username for getClientVersion command.");
    }
}

function getClientStatusCommand(args) {
    const [requestedUsernameCS] = args;
    if (requestedUsernameCS) {
        const message = {
            sender: USERNAME,
            type: 'command',
            command: 'GetClientStatus',
            requestedUsername: requestedUsernameCS,
            clientVersionNumber: clientVersion
        };
        client.write(JSON.stringify(message) + '\r\n');
    } else {
        console.log("Missing username for GetClientStatus command.");
    }
}

function setStatusCommand(args) {
    const status = args.join(' ');
    if (status) {
        setStatus(status);
    } else {
        console.log("Missing status for SetStatus command.");
    }
}

function whisperCommand(args) {
    const [recipient, ...whisperMessage] = args;
    if (recipient != USERNAME) {
        if (recipient && whisperMessage.length > 0) {
            const message = {
                sender: USERNAME,
                type: 'command',
                command: "whisper",
                recipient: recipient,
                text: encrypt("whispered: " + whisperMessage.join(' ')),
                clientVersionNumber: clientVersion,
                publicEncryptioKey: hashValueEncryptionKey,
                usernameColor: userColor
            };
            client.write(JSON.stringify(message) + '\r\n');
        } else {
            console.log("Missing recipient or message for !whisper command.");
        }
    } else {
        console.log(colors.red + "You can't whisper to yourself!" + colors.reset);
    }
}





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
