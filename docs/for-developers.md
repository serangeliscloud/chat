# `clients.js`

## Understanding Functions in `client.js`

### Global Constants and Libraries

```javascript
const net = require('net');
const readline = require('readline');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { enc } = require('crypto-js');
```

These are the required Node.js libraries and global constants used throughout the script. They include modules for networking (`net`), reading user input (`readline`), file system operations (`fs`), cryptographic functionalities (`crypto`), path manipulation (`path`), and encryption (`crypto-js`).

### getRandomColor()

```javascript
function getRandomColor() {
    const colorKeys = Object.keys(colors);
    const randomIndex = Math.floor(Math.random() * (colorKeys.length - 1));
    return colors[colorKeys[randomIndex]];
}
```

This function randomly selects a color from the predefined color palette for user display.

### encrypt(text)

```javascript
function encrypt(text) {
    let encryptedText = "";
    for (let i = 0; i < text.length; i++) {
        encryptedText += String.fromCharCode(text.charCodeAt(i) + ENCRYPTIONPASSKEY);
    }
    return encryptedText;
}
```

This function encrypts a given text using a simple Caesar cipher algorithm with a predefined encryption key.

### decrypt(encryptedText)

```javascript
function decrypt(encryptedText) {
    let decryptedText = "";
    for (let i = 0; i < encryptedText.length; i++) {
        decryptedText += String.fromCharCode(encryptedText.charCodeAt(i) - ENCRYPTIONPASSKEY);
    }
    return decryptedText;
}
```

This function decrypts an encrypted text using the same Caesar cipher algorithm with the predefined encryption key.

### calculateHash(integer)

```javascript
function calculateHash(integer) {
    const data = integer.toString();
    const hash = crypto.createHash('sha256');
    hash.update(data);
    const hashDigest = hash.digest('hex');
    return hashDigest;
}
```

This function calculates the SHA-256 hash of an integer value using the `crypto` library.

### fileToBase64(filePath)

```javascript
function fileToBase64(filePath) {
    try {
        const fileData = fs.readFileSync(filePath);
        const base64Data = fileData.toString('base64');
        const encryptedBase64Data = encrypt(base64Data);
        return encryptedBase64Data;
    } catch (error) {
        console.error("Error occurred while converting file to Base64:", error);
        return null;
    }
}
```

This function converts a file located at the given file path to Base64 format, encrypts it, and returns the encrypted Base64 data.

### base64ToFile(message)

```javascript
function base64ToFile(message) {
    try {
        const base64Data = decrypt(message.contents);
        const filePath = `./ClientDownloads/${message.fileName}${message.fileExtension}`;
        const binaryData = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, binaryData);
        console.log(`File successfully saved to ${filePath}`);
    } catch (error) {
        console.error("Error occurred while converting Base64 to file:", error);
    }
}
```

This function converts Base64 data received in a message object back to its original file format and saves it to the client's local directory.

### fileExists(filePath)

```javascript
function fileExists(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    } catch (error) {
        return false;
    }
}
```

This function checks if a file exists at the specified file path using `fs.accessSync()`.

### getUsername(callback)

```javascript
function getUsername(callback) {
    const userInfoPath = './usr/userInfo.json';
    if (fs.existsSync(userInfoPath)) {
        fs.readFile(userInfoPath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading userInfo.json file:", err);
                askForUsername(callback);
            } else {
                try {
                    const userInfo = JSON.parse(data);
                    const username = userInfo.username.trim();
                    if (username !== '') {
                        USERNAME = username;
                        console.log("Username loaded from userInfo.json:", userColor, USERNAME, colors.reset);
                        callback(USERNAME);
                    } else {
                        askForUsername(callback);
                    }
                } catch (parseError) {
                    console.error("Error parsing userInfo.json:", parseError);
                    askForUsername(callback);
                }
            }
        });
    } else {
        const initialUserInfo = { username: '' };
        fs.mkdir('./usr', { recursive: true }, (err) => {
            if (err) {
                console.error("Error creating usr directory:", err);
                askForUsername(callback);
            } else {
                fs.writeFile(userInfoPath, JSON.stringify(initialUserInfo), (writeErr) => {
                    if (writeErr) {
                        console.error("Error writing userInfo.json file:", writeErr);
                    }
                    askForUsername(callback);
                });
            }
        });
    }
}
```

This function retrieves the username from the `userInfo.json` file if it exists, otherwise prompts the user to enter a new username.

### askForUsername(callback)

```javascript
function askForUsername(callback) {
    rl.question('Please enter your username: ', (username) => {
        if (username.trim() !== '') {
            USERNAME = username;
            const userInfo = { username: USERNAME };
            fs.writeFile('./usr/userInfo.json', JSON.stringify(userInfo), (err) => {
                if (err) {
                    console.error("Error writing userInfo.json file:", err);
                }
            });
            callback(username);
        } else {
            console.log(colors.red + 'Invalid username. Please enter a non-empty username.' + colors.reset);
            askForUsername(callback);
        }
    });
}
```

This function prompts the user to enter a username if the `userInfo.json` file is not found or contains an empty username.



## Commands

This documentation provides an overview of the functions implemented in the client-side JavaScript code. These functions are responsible for processing input from the client, executing commands, sending messages, and handling file operations.

## `processInput(input)`

### Overview

Processes the input received from the client, distinguishing between commands and regular messages, and delegates the processing accordingly.

### Function Signature

```javascript
function processInput(input)
```

### Parameters

- `input` (string): The input string received from the client.

### Error Handling

If the input is an empty string, it logs an error message to the console.

## `processCommand(input)`

### Overview

Processes command input received from the client by parsing and executing the corresponding command.

### Function Signature

```javascript
function processCommand(input)
```

### Parameters

- `input` (string): The command input string received from the client.

### Error Handling

If the command is unknown, it logs an error message to the console.

## `processMessage(input)`

### Overview

Processes a regular message input received from the client by encrypting it and sending it to the server.

### Function Signature

```javascript
function processMessage(input)
```

### Parameters

- `input` (string): The message input string received from the client.

## `sendTimeCommand()`

### Overview

Sends a command to retrieve the current time from the server.

### Function Signature

```javascript
function sendTimeCommand()
```

### Parameters

This function does not accept any parameters.

## `sendFileCommand(args)`

### Overview

Sends a command to the server to send a file, along with the file data encoded in Base64.

### Function Signature

```javascript
function sendFileCommand(args)
```

### Parameters

- `args` (Array): An array containing file path as its first element.

### Error Handling

Logs an error message if the file path is invalid or the file does not exist.

## `downloadFileCommand(args)`

### Overview

Sends a command to the server to download a file.

### Function Signature

```javascript
function downloadFileCommand(args)
```

### Parameters

- `args` (Array): An array containing the download file path as its first element.

### Error Handling

Logs an error message if the download file path is missing.

## `getClientIDCommand(args)`

### Overview

Sends a command to the server to get the client's ID.

### Function Signature

```javascript
function getClientIDCommand(args)
```

### Parameters

- `args` (Array): An array containing the requested username as its first element.

### Error Handling

Logs an error message if the requested username is missing.

## `getClientVersionCommand(args)`

### Overview

Sends a command to the server to get the client's version.

### Function Signature

```javascript
function getClientVersionCommand(args)
```

### Parameters

- `args` (Array): An array containing the requested username as its first element.

### Error Handling

Logs an error message if the requested username is missing.

## `getClientStatusCommand(args)`

### Overview

Sends a command to the server to get the client's status.

### Function Signature

```javascript
function getClientStatusCommand(args)
```

### Parameters

- `args` (Array): An array containing the requested username as its first element.

### Error Handling

Logs an error message if the requested username is missing.

## `setStatusCommand(args)`

### Overview

Sets the status of the client.

### Function Signature

```javascript
function setStatusCommand(args)
```

### Parameters

- `args` (Array): An array containing the status message as its elements.

### Error Handling

Logs an error message if the status message is missing.

## `whisperCommand(args)`

### Overview

Sends a whispered message to another user.

### Function Signature

```javascript
function whisperCommand(args)
```

### Parameters

- `args` (Array): An array containing the recipient username as its first element and the message as subsequent elements.

### Error Handling

Logs an error message if the recipient or message is missing, or if the user tries to whisper to themselves.

## `base64ToFile(message)`

### Overview

Handles the conversion of Base64 data received in a message object back to its original file format and saves it to the client's local directory.

### Function Signature

```javascript
function base64ToFile(message)
```

### Parameters

- `message` (Object): The message object containing Base64 data and file information.

### Error Handling

Logs an error message if any errors occur during the conversion process.


---

## Event Listeners in `client.js`

### 1. `client.on('data', data)`

**Purpose**: This event listener is triggered when the client receives data from the server.

**Explanation**:
- When data is received from the server, it's parsed and processed accordingly.
- If the data represents a message, it's displayed in the console.
- If the data contains file contents, it triggers the `base64ToFile()` function to save the file.

```javascript
client.on('data', data => {
    const message = JSON.parse(data.toString());
    // Process the received message
});
```

### 2. `client.on('end')`

**Purpose**: This event listener is activated when the connection to the chat server is closed.

**Explanation**:
- When the connection is closed, it indicates that the client has disconnected from the server.
- It displays a message in the console indicating disconnection and closes the readline interface.

```javascript
client.on('end', () => {
    // Display disconnection message
    // Close the readline interface
});
```

### 3. `client.on('error', err)`

**Purpose**: This event listener handles errors that occur during the TCP socket connection.

**Explanation**:
- If an error occurs in the connection process or during data transmission, this listener catches it.
- It displays an error message in the console, providing details about the encountered error.
- It closes the readline interface to prevent further interaction.

```javascript
client.on('error', err => {
    // Display error message
    // Close the readline interface
});
```

Certainly! Let's delve deeper into the `rl.on('line', input)` event listener, focusing on command handling:

---

### `rl.on('line', input)` Event Listener

#### Purpose:
This event listener captures user input from the command line and processes the input accordingly.

### 5. `rl.on('SIGINT')`

**Purpose**: This event listener is activated when the user presses Ctrl+C to interrupt the client process.

**Explanation**:
- It handles the interruption gracefully, ensuring a clean exit from the client application.
- It sends a final message to the server indicating the user's departure from the chat.
- It closes the connection to the server and terminates the client process.

```javascript
rl.on('SIGINT', () => {
    // Send final message to server
    // Close connection and readline interface
});
```

---

These event listeners play crucial roles in managing communication with the chat server and handling user interaction in the command line interface. Understanding their functionality is essential for effective development and troubleshooting of the chat client application.

Certainly! Below is the detailed documentation for the `server.js` file:

---

# `server.js` 

#### Purpose:
The `server.js` file serves as the backend server for the chat application, handling incoming connections from clients, managing client interactions, and facilitating communication between clients.

#### Dependencies:
- `net`: Node.js module for creating TCP servers and clients.
- `fs`: Node.js module for interacting with the file system.

#### Constants:
- `PORT`: The port number on which the server listens for incoming connections.
- `ALLOWED_VERSION`: The allowed version of the client application for successful connection.

#### Functions:

1. **`generateUUID()`**
   - **Purpose:** Generates a unique identifier (UUID).
   - **Usage:** Used to assign a unique identifier to each connected client.
    ```javascript
    function generateUUID() {
        // Generate a random hexadecimal string of length 8 characters
        const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);

        // Construct the UUID
        return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    }
    ```
2. **`broadcast(message, sender)`**
   - **Purpose:** Sends a message to all connected clients except the sender.
   - **Parameters:** 
     - `message`: The message to be broadcasted.
     - `sender`: The socket of the client sending the message.
   - **Usage:** Used to broadcast chat messages to all clients.
    ```javascript
    // Function to broadcast messages to all clients
    function broadcast(message, sender) {
        clients.forEach(client => {
            // Send the message to all clients except the sender
            if (client.socket !== sender) {
                client.socket.write(message);
            }
        });
    }
    ```
3. **`whisper(message, RequestedClientSocket)`**
   - **Purpose:** Sends a private message (whisper) to a specific client.
   - **Parameters:** 
     - `message`: The message to be sent.
     - `RequestedClientSocket`: The socket of the target client.
   - **Usage:** Used to send private messages between clients.
    ```javascript
    // whisper
    function whisper(message, RequestedClientSocket) {
        RequestedClientSocket.write(JSON.stringify(message))
    }
    ```
4. **`handleInitialMessage(message, clientSocket)`**
   - **Purpose:** Handles initial messages received from clients upon connection.
   - **Parameters:** 
     - `message`: The initial message received from the client.
     - `clientSocket`: The socket of the connecting client.
   - **Usage:** Validates client version, authenticates clients, and broadcasts join messages.
    ```javascript
    // Function to handle initial messages from clients upon connection
    function handleInitialMessage(message, clientSocket) {
        // Check if the client version matches the allowed version
        if (message.type === 'authentication' && message.clientVersionNumber !== ALLOWED_VERSION) {
            console.log(`Connection from client with version `+colors.yellow+`${message.clientVersionNumber}`+colors.reset+colors.red+` refused.`+colors.red);
            clientSocket.end(); // Close the connection immediately
            return;
        }

        // Check if the sender is already in the clientsList
        if (clientsList.some(client => client.Username === message.sender)) {
            console.log(`Connection from ${message.sender} refused because the user is already connected.`);
            clientSocket.end(); // Close the connection immediately
            return;
        }

        dataForClientsArray = {UserID: (clients.length+1), Username: message.sender, Version: message.clientVersionNumber, status: message.status, SOCKET: clientSocket}
        clientsList.push(dataForClientsArray)
        // console.log(clientsList)//  debug - show all connected clients + the one just connected
        // Handle the initial message based on its type or content
        console.log(colors.green+`accepted connection from ${message.sender}`+colors.reset+` - client version: `+colors.yellow+`${message.clientVersionNumber}`+colors.reset);
        // You can authenticate the client, validate its version, etc.

        // Broadcast join message to all clients
        const joinMessage = JSON.stringify({ sender: "Server", text: `${message.sender} joined the chat` }) + '\r\n';
        broadcast(joinMessage, clientSocket);
    }

    ```
5. **`handleExitingMessage(message, clientSocket)`**
   - **Purpose:** Handles messages indicating a client leaving the chat.
   - **Parameters:** 
     - `message`: The message indicating the client leaving.
     - `clientSocket`: The socket of the exiting client.
   - **Usage:** Removes the client from the list of connected clients and broadcasts leave messages.
    ```javascript
    // Function to handle leaving messages from clients
    function handleExitingMessage(message, clientSocket) {
        // Remove the client from the clientsList array based on message.sender
        clientsList = clientsList.filter(function(client) {
            return client.Username !== message.sender;
        });

        // Broadcast leave message to all clients
        const leaveMessage = JSON.stringify({ sender: "Server", text: `${message.sender} left the chat` }) + '\r\n';
        broadcast(leaveMessage, clientSocket);
        console.log(message.usernameColor + `${message.sender}` + colors.reset + ` left the chat`);

        // console.log("Updated clients list:", clientsList); debug - show all connected clients - the one that just disconnected
    }
    ```
6. **`GetClientIDByUsername(username, clientSocket)`**
   - **Purpose:** Retrieves the client ID (UserID) by username.
   - **Parameters:** 
     - `username`: The username of the client.
     - `clientSocket`: The socket of the requesting client.
   - **Returns:** The UserID of the client with the given username.
   - **Usage:** Used to retrieve the UserID of a client by their username.
    ```javascript
    function GetClientIDByUsername(username, clientSocket) {
        // Iterate through the clientsList array to find the client with the matching username
        for (var i = 0; i < clientsList.length; i++) {
            if (clientsList[i].Username === username) {
                // Return the UserID of the matching client
                const message = {
                    sender: "Server",
                    text: username +"'s clientID: "+clientsList[i].UserID,
                };
                clientSocket.write(JSON.stringify(message)+ '\r\n' )
                return clientsList[i].UserID;
            }
        }
        // If the username is not found, return null or any other appropriate value
        return null;
    }
    ```
7. **`GetClientStatusByUsername(username, clientSocket)`**
   - **Purpose:** Retrieves the status of a client by username.
   - **Parameters:** 
     - `username`: The username of the client.
     - `clientSocket`: The socket of the requesting client.
   - **Returns:** The status of the client with the given username.
   - **Usage:** Used to retrieve the status of a client by their username.
    ```javascript
    function GetClientStatusByUsername(username, clientSocket) {
        // Iterate through the clientsList array to find the client with the matching username
        for (var i = 0; i < clientsList.length; i++) {
            if (clientsList[i].Username === username) {
                // Return the UserID of the matching client
                const message = {
                    sender: "Server",
                    text: username +"'s status: "+clientsList[i].status,
                };
                console.log(message)
                clientSocket.write(JSON.stringify(message)+ '\r\n' )
                return clientsList[i].status;
            }
        }
        // If the username is not found, return null or any other appropriate value
        return null;
    }
    ```
8. **`GetVersionByUsername(username, clientSocket)`**
   - **Purpose:** Retrieves the client version by username.
   - **Parameters:** 
     - `username`: The username of the client.
     - `clientSocket`: The socket of the requesting client.
   - **Returns:** The client version of the client with the given username.
   - **Usage:** Used to retrieve the client version of a client by their username.
    ```javascript
    function GetVersionByUsername(username, clientSocket) {
    // Iterate through the clientsList array to find the client with the matching username
    for (var i = 0; i < clientsList.length; i++) {
        if (clientsList[i].Username === username) {
            // Return the UserID of the matching client
            // console.log(clientsList[i].Version)
            const message = {
                sender: "Server",
                text: username +"'s clientVersion: "+clientsList[i].Version,
            };
            clientSocket.write(JSON.stringify(message)+ '\r\n' )
            return clientsList[i].Version;
        }
    }
    // If the username is not found, return null or any other appropriate value
    console.log("username not found")
    return null;
    }
    ```
9. **`GetClientSocketByUsername(username)`**
   - **Purpose:** Retrieves the socket of a client by username.
   - **Parameters:** 
     - `username`: The username of the client.
   - **Returns:** The socket of the client with the given username.
   - **Usage:** Used to retrieve the socket of a client by their username.
    ```javascript
    function GetClientSocketByUsername(username) {
    // Iterate through the clientsList array to find the client with the matching username
    for (var i = 0; i < clientsList.length; i++) {
        if (clientsList[i].Username === username) {
            // Return the UserID of the matching client
            // console.log(clientsList[i].SOCKET) debug 
            return clientsList[i].SOCKET;
        }
    }
    // If the username is not found, return null or any other appropriate value
    console.log("username not found")
    return null;
    }
    ```
10. **`sendServerTime(clientSocket)`**
    - **Purpose:** Sends the current server time to a client.
    - **Parameters:** 
      - `clientSocket`: The socket of the target client.
    - **Usage:** Used to send the current server time to a client upon request.
    ```javascript
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
    ```
11. **`saveFile(message, clientSocket)`**
    - **Purpose:** Saves a file received from a client to the server.
    - **Parameters:** 
      - `message`: The message containing file information.
      - `clientSocket`: The socket of the client sending the file.
    - **Usage:** Used to save files sent by clients to the server.
    ```javascript
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
    ```
12. **`sendFileContents(filePath, clientSocket)`**
    - **Purpose:** Sends the contents of a file to a client.
    - **Parameters:** 
      - `filePath`: The path to the file.
      - `clientSocket`: The socket of the target client.
    - **Usage:** Used to send the contents of a requested file to a client.
    ```javascript
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
    ```
#### Event Listeners:

1. **`'data'` Event Listener**
   - **Description:** This event listener is triggered when the server receives data from a client.
   - **Usage:** It parses the received data, handles various types of messages (such as initial connection messages, commands, or regular chat messages), and takes appropriate actions based on the message type.
   ```javascript
   clientSocket.on('data', data => {
       const message = JSON.parse(data.toString().trim());
       // Check message type and take appropriate actions
       // Handle initial connection, commands, regular messages, etc.
   });
   ```

2. **`'end'` Event Listener**
   - **Description:** This event listener is triggered when a client disconnects from the server.
   - **Usage:** It removes the disconnected client from the list of connected clients.
   ```javascript
   clientSocket.on('end', () => {
       // Remove the disconnected client from the list
   });
   ```

3. **`'error'` Event Listener**
   - **Description:** This event listener is triggered when an error occurs with a client connection.
   - **Usage:** It logs the error for debugging purposes and handles it gracefully.
   ```javascript
   clientSocket.on('error', err => {
       console.error('Client error:', err);
   });
   ```
