
// server.js

const net = require('net');
const fs = require('fs');

const PORT = 8000;
const ALLOWED_VERSION = "1.3.1";

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

// Counter for generating unique client IDs
let nextClientId = 1;

// Array to hold connected clients, each with an ID
const clients = [];

function generateUUID() {
    // Generate a random hexadecimal string of length 8 characters
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);

    // Construct the UUID
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

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
        console.log(`Connection from client with version `+colors.yellow+`${message.clientVersionNumber}`+colors.reset+colors.red+` refused.`+colors.red);
        clientSocket.end(); // Close the connection immediately
        return;
    }

    // Handle the initial message based on its type or content
    console.log(colors.green+`accepted connection from ${message.sender}`+colors.reset+` - client version: `+colors.yellow+`${message.clientVersionNumber}`+colors.reset);
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
    console.log(message.usernameColor+`${message.sender}`+colors.reset+` left the chat`);
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

function saveFile(message, clientSocket) {
    // Create the directory if it doesn't exist
    const folderPath = './savedFiles';
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
    const uuid = generateUUID()
    // Generate a unique filename using sender name and file extension
    const fileName = `${message.sender}_${uuid}.json`;

    // Construct the file path
    const filePath = `${folderPath}/${fileName}`;

    // Write the file data to a JSON file
    const jsonData = {
        sender: message.sender,
        fileName: `${message.sender}_${uuid}`,
        fileExtension: message.fileExtension,
        fileData: message.fileData

    };

    fs.writeFile(filePath, JSON.stringify(jsonData), (err) => {
        if (err) {
            console.error(`Error saving file: ${err}`);
        } else {
            console.log(`File saved successfully: ${filePath}`);
        }
    });
    broadcastMessage = {
        sender: "Server",
        text: `message saved succesfully at ${filePath}`
    }
    clientSocket.write(JSON.stringify(broadcastMessage))
}

// Function to send file contents to client
function sendFileContents(filePath, clientSocket) {
    // console.log(colors.magenta+"senfFileContents function started"+colors.reset)
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const fileInfo = JSON.parse(fileContents);
        const fileData = fileInfo.fileData
        const fileExtension = fileInfo.fileExtension
        const fileName = fileInfo.fileName
        const message = {
            sender: "Server",
            type: 'fileContents',
            contents: fileData,
            fileName: fileName, 
            fileExtension: fileExtension
        };
        // console.log(message.contents)
        console.log(`${filePath} sent`)
        clientSocket.write(JSON.stringify(message) + '\r\n');
    } catch (error) {
        console.error("Error occurred while reading file:", error);
        // Handle the error as needed, e.g., send an error message to the client
    }
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
                    sendServerTime(clientSocket);
                    break
                case "sendFile":
                    console.log("send file case")
                    saveFile(message, clientSocket)
                    
                    break
                case "downloadFile":
                    // console.log(colors.magenta+"downloadFile command received"+colors.reset)
                    sendFileContents(message.filePath, clientSocket);
                    break;
                     }
                    
                
            } 
            
            else {
                const messageSizeBytes = Buffer.byteLength(JSON.stringify(message), 'utf8');
                const messageSizeMB = messageSizeBytes / (1024 * 1024); // Convert bytes to megabytes
                // Broadcast the message to all clients
                broadcast(data.toString(), clientSocket);
                console.log(`${message.sender} - ${colors.yellow}${message.clientVersionNumber}:${colors.reset}  ${message.text} ${messageSizeMB} MB`);
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
        console.error(colors.red+'Client error:', err+colors.reset);
    });
});

// Start listening for connections
server.listen(PORT, () => {
    console.log(`Chat server is running on port`+colors.yellow+` ${PORT}`+colors.reset);
});
