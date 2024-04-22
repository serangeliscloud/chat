# Documentation Layout for client.js

## Overview
This document provides a comprehensive overview of the `client.js` file, which serves as the client-side script for a chat application. It includes functionalities for connecting to a chat server, sending and receiving messages, handling commands, file transfer operations, and more.

## Table of Contents
1. Introduction
2. Global Constants
3. Functions
    - getRandomColor()
    - encrypt()
    - decrypt()
    - calculateHash()
    - fileToBase64()
    - base64ToFile()
    - fileExists()
    - getUsername()
    - askForUsername()
    - setStatus()
    - reloadConnection()
    - sendInitialMessage()
4. Event Listeners
5. Command Handling
6. Conclusion

## 1. Introduction
The `client.js` file is a JavaScript script designed to run in a Node.js environment. It functions as the frontend client for a chat application, facilitating communication with a backend chat server. It utilizes the `net` module for TCP socket communication and various other Node.js built-in modules and third-party libraries.

## 2. Global Constants
- `net`: Node.js module for TCP socket communication.
- `readline`: Node.js module for reading user input.
- `fs`: Node.js module for file system operations.
- `crypto`: Node.js module for cryptographic operations.
- `path`: Node.js module for handling file paths.
- `HOST`: Constant representing the hostname of the chat server.
- `PORT`: Constant representing the port number of the chat server.
- `ENCRYPTIONPASSKEY`: Constant representing the encryption passkey.
- `hashValueEncryptionKey`: Constant representing the hash value of the encryption passkey.
- `colors`: Object containing ANSI escape codes for text colors.
- `userColor`: Constant representing the randomly selected user color.
- `USERNAME`: Variable to store the user's username.

## 3. Functions

### getRandomColor()
- **Description**: This function generates a random color from a predefined palette of ANSI escape codes. It selects a random color code from the available colors to add visual distinction to user messages in the chat interface.

### encrypt(text)
- **Description**: The `encrypt()` function accepts a plaintext string as input and performs a simple encryption algorithm. It iterates over each character in the input string and shifts its Unicode code point by a fixed amount determined by the `ENCRYPTIONPASSKEY`. The resulting encrypted text provides basic obfuscation for sensitive data during transmission.

### decrypt(encryptedText)
- **Description**: This function reverses the encryption process performed by the `encrypt()` function. It takes an encrypted text string as input and decrypts it by shifting back each character's Unicode code point by the same fixed amount as in the encryption process. This allows the original plaintext to be recovered from the encrypted message.

### calculateHash(integer)
- **Description**: The `calculateHash()` function computes the SHA-256 hash of a given integer value. It converts the integer to a string representation, updates a cryptographic hash object with the data, and then computes the hash digest using the SHA-256 algorithm. The resulting hash digest provides a unique and deterministic representation of the input integer.

### fileToBase64(filePath)
- **Description**: This function reads a file from the file system specified by the `filePath` parameter and converts its contents to a Base64-encoded string. It synchronously reads the file data, encodes it in Base64 format, and returns the resulting Base64 string. Additionally, it encrypts the Base64-encoded data for added security.

### base64ToFile(message)
- **Description**: The `base64ToFile()` function performs the reverse operation of `fileToBase64()`. It takes a message object containing Base64-encoded data received from the server and decrypts the data. Then, it decodes the Base64 string to binary data and writes it to a file on the local file system. This function is crucial for handling file transfers from the server to the client.

### fileExists(filePath)
- **Description**: This function checks whether a file exists at the specified file path on the local file system. It uses the `fs.accessSync()` method to attempt to access the file, and if successful, returns `true` indicating that the file exists. If the file does not exist or cannot be accessed, it returns `false`.

### getUsername(callback)
- **Description**: The `getUsername()` function retrieves the user's username from a JSON file (`userInfo.json`) if it exists. If the file exists, it reads the username from it; otherwise, it prompts the user to enter a username manually. Once the username is obtained, it invokes the provided callback function with the retrieved username as an argument.

### askForUsername(callback)
- **Description**: This function prompts the user to enter a username if the `userInfo.json` file does not exist or if the username is missing or empty in the file. It utilizes the `readline` module to asynchronously capture user input from the command line interface. Once a non-empty username is entered, it saves the username to the `userInfo.json` file and invokes the provided callback function with the entered username.

### setStatus(status)
- **Description**: The `setStatus()` function allows the user to set their status, such as "online," "away," or "busy." It updates the user's status in the `userInfo.json` file by modifying the status property. Additionally, it sends an initial message to the server with the updated status information.

### reloadConnection()
- **Description**: This function gracefully closes the current connection to the chat server and reconnects to establish a fresh connection. It is triggered when the user requests to reload the connection, ensuring uninterrupted communication with the server. Upon reconnection, it sends an initial message with the updated status to the server.

### sendInitialMessage()
- **Description**: The `sendInitialMessage()` function constructs and sends an initial message to the chat server upon establishing a connection. It retrieves the user's status from the `userInfo.json` file, creates a message object with the user's username, status, and client version information, and sends it to the server. This message serves for authentication and informs the server of the client's status.

## 4. Event Listeners


### `client.on('data', data)`
- **Description**: This event listener is activated whenever the client receives data from the server through the established TCP socket connection. Upon activation, it processes the received data, typically parsing and handling incoming messages from the server or other users. Depending on the content of the message, it may display chat messages in the console, initiate file downloads, or handle other server responses.

### `client.on('end')`
- **Description**: Triggered when the TCP socket connection to the chat server is terminated or closed. This event marks the disconnection of the client from the server. Upon activation, it displays a message indicating disconnection from the server and closes the readline interface, signaling the end of the client's interaction.

### `client.on('error', err)`
- **Description**: This event listener is invoked when an error occurs during the TCP socket connection between the client and the server. It handles various types of errors that may arise, such as connection failures, network issues, or server-side errors. When an error is detected, it outputs an error message to the console, providing details about the encountered error, and terminates the readline interface to prevent further interaction.

### `rl.on('line', input)`
- **Description**: This event listener captures user input from the command line interface. It triggers whenever the user submits a line of text. Upon activation, it processes the input text, distinguishing between regular chat messages and commands. If the input starts with '!', it interprets it as a command and executes the corresponding functionality, such as sending files or changing user status. If the input is a regular message, it encrypts the message and sends it to the server for distribution to other chat participants.

### `rl.on('SIGINT')`
- **Description**: Activated when the user interrupts the client process by pressing Ctrl+C. This event listener handles the interruption gracefully, ensuring that the client exits cleanly without leaving any lingering connections or resources open. It sends a final message to the server, indicating the user's departure from the chat, closes the connection to the server, and terminates the client process.

## 5. Command Handling
Here's a comprehensive guide to all the commands available in the chat client application:

---

### Chat Client Command Guide

#### Regular Chat Commands:

1. **Send Message**:
   - **Syntax**: Simply type your message and press Enter.
   - **Usage**: Send a regular message to the chat room. Your message will be visible to all participants.

2. **Whisper**:
   - **Syntax**: `!whisper <recipient> <message>`
   - **Usage**: Send a private message to a specific user (`<recipient>`) without others seeing it. Your message will be encrypted for privacy.

3. **Set Status**:
   - **Syntax**: `!setStatus <status>`
   - **Usage**: Set your current status (e.g., "online," "away," "busy"). This status will be visible to other users in the chat room.

#### File Transfer Commands:

4. **Send File**:
   - **Syntax**: `!sendFile <file_path>`
   - **Usage**: Send a file to the chat room. Specify the file path (`<file_path>`) of the file you want to send. The file will be encrypted before transmission.

5. **Download File**:
   - **Syntax**: `!downloadFile <file_path>`
   - **Usage**: Download a file sent by another user. Specify the file path (`<file_path>`) of the file you want to download.

#### Informational Commands:

6. **Get Client ID**:
   - **Syntax**: `!ClientID <username>`
   - **Usage**: Retrieve the unique client ID associated with a specific user (`<username>`).

7. **Get Client Version**:
   - **Syntax**: `!ClientVersion <username>`
   - **Usage**: Retrieve the version number of the chat client used by a specific user (`<username>`).

8. **Get Client Status**:
   - **Syntax**: `!GetStatus <username>`
   - **Usage**: Retrieve the current status of a specific user (`<username>`) in the chat room.

#### Miscellaneous Commands:

9. **Reload Connection**:
   - **Syntax**: `!Reload`
   - **Usage**: Reload the connection to the chat server. Useful for troubleshooting, reestablishing a lost connection or updating your profile.

10. **Check Time**:
    - **Syntax**: `!time`
    - **Usage**: Check the current time. This command can be used to synchronize activities or simply for informational purposes.

---

**Note**: 
- Commands are prefixed with '!' to distinguish them from regular chat messages.
- Ensure to provide appropriate arguments with each command to execute them successfully.
- Some commands may require specific permissions or conditions to execute properly.
- To test locally allow multiple clients from settings.conf
