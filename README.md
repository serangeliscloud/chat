
# Chat Server and Client

This repository contains code for a simple chat server and client implemented in Node.js. The chat server allows multiple clients to connect and exchange messages in real-time, while the client provides a command-line interface for interacting with the server.

## Features

- **Server**: Create a TCP server to manage client connections and broadcast messages.
- **Client**: Connect to the server, send messages, and receive messages from other clients.
- **Real-time Communication**: Messages are broadcasted to all connected clients in real-time.
- **File sharing**: You can share files using commands
- **commands**: Use commands to interact with the server and to get informations about other users
- **Private messages**: Send private messages using `!whisper`
## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your system.

### Installation

1. Clone this repository to your local machine:

   ```
   git clone https://github.com/serangeliscloud/chat.git
   ```

2. Navigate to the project directory:

   ```
   cd chat
   ```

3. Install dependencies:

   ```
   npm install
   ```

### Usage

1. Start the chat server:

   ```
   node server.js
   ```

2. Open a new terminal window and run the chat client:

   ```
   node client.js
   ```

3. Follow the prompts to connect to the server and start chatting.

### Configuration

- You can modify the server port and host settings in the `server.js` file.
- The client code (`client.js`) allows you to specify the server host and port as command-line arguments.

## Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvement, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.