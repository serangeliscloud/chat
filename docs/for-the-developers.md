### Server.js Documentation

#### Introduction
The `server.js` file contains the code for a TCP server that facilitates communication between multiple clients in a chat room.

#### Code Snippet
```javascript
const net = require('net');

const PORT = 8000;
let nextClientId = 1;
const clients = [];

// Function to broadcast messages to all clients
function broadcast(message, sender) {
    clients.forEach(client => {
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
    const connectionMessage = JSON.stringify({ sender: "Server", type: 'connection', text: `Client ${clientId} has connected` }) + '\r\n';
    broadcast(connectionMessage, clientSocket);

    // Event listener for receiving data from the client
    clientSocket.on('data', data => {
        const message = data.toString().trim();
        // Broadcast the message to all clients
        broadcast(message, clientSocket);
    });

    // Event listener for client disconnection
    clientSocket.on('end', () => {
        // Remove the client from the array when it disconnects
        const index = clients.findIndex(client => client.socket === clientSocket);
        if (index !== -1) {
            clients.splice(index, 1);
        }
    });

    // Event listener for client errors
    clientSocket.on('error', err => {
        console.error('Client error:', err);
    });
});

// Start listening for connections
server.listen(PORT, () => {
    console.log(`Chat server is running on port ${PORT}`);
});
```

#### Explanation
- The server listens for incoming connections on port 8000.
- Each client is assigned a unique ID upon connection and added to the `clients` array.
- When a client connects, a message is broadcasted to inform others about the new connection.
- Event listeners handle data reception, client disconnection, and error handling.

### Client.js Documentation

#### Introduction
The `client.js` file contains the code for a TCP client that connects to the chat server and allows users to send and receive messages.

#### Code Snippet
```javascript
const net = require('net');
const readline = require('readline');

const HOST = 'localhost';
const PORT = 8000;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to get username from the user
function getUsername(callback) {
    rl.question('Please enter your username: ', (username) => {
        callback(username);
    });
}

// Create a TCP client
getUsername((USERNAME) => {
    const client = net.createConnection({ host: HOST, port: PORT }, () => {
        console.log('Connected to the chat server');
        console.log(`Username set as: ${USERNAME}`);
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

    // Event listener for client errors
    client.on('error', err => {
        console.error('Client error:', err);
    });

    // Event listener for user input
    rl.on('line', input => {
        // Create a JSON message object
        const message = {
            sender: USERNAME,
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
});
```

#### Explanation
- The client prompts the user to enter a username.
- Upon receiving the username, it establishes a connection to the server.
- Incoming messages from the server are displayed to the user.
- Users can input messages via the command line, which are sent to the server.
- Event listeners handle server connection events, data reception, and user input.
