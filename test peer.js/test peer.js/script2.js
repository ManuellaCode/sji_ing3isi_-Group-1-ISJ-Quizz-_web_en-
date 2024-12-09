// Create a new Peer instance
var peer = new Peer();

// Get DOM elements
const textInput = document.getElementById('textInput');
const sendButton = document.getElementById('sendButton');
const receivedMessages = document.getElementById('receivedMessages');

// Generate and display the peer ID
peer.on('open', (id) => {
    console.log('My peer ID is: ' + id);
});

// Connect to another peer
const connectToPeer = (peerId) => {
    const conn = peer.connect(peerId);

    // Handle connection open event
    conn.on('open', () => {
        console.log('Connected to ' + peerId);

        // Send message on button click
        sendButton.addEventListener('click', () => {
            const message = textInput.value;
            conn.send(message);
            textInput.value = ''; // Clear input field
        });
    });

    // Handle incoming messages
    conn.on('data', (data) => {
        receivedMessages.innerHTML += `<p>Received: ${data}</p>`;
    });
};

// Listen for incoming connections
peer.on('connection', (conn) => {
    conn.on('data', (data) => {
        receivedMessages.innerHTML += `<p>Received: ${data}</p>`;
    });
});

// Example: Connect to another peer (replace with actual peer ID)
const peerIdToConnect = prompt("Enter Peer ID to connect:");
connectToPeer(peerIdToConnect)