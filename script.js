let peer;
let conn;
let messageArea = document.getElementById("chatMessages");
let messageInput = document.getElementById("messageInput");
let chatArea = document.getElementById("chatArea");
let generatedPeerIdDisplay = document.getElementById("generatedPeerIdDisplay");

// Create a new Peer object and generate the Peer ID
function generatePeerId() {
  // Initialize PeerJS
  peer = new Peer({
    key: 'peerjs',
    host: 'peerjs.com',  // Or use a custom server if needed
    port: 9000,
    path: '/myapp',
  });

  peer.on('open', function (id) {
    // Display the generated Peer ID on the page
    document.getElementById("peerId").value = id;
    generatedPeerIdDisplay.textContent = `Your Peer ID is: ${id}`;
    console.log("Your Peer ID: " + id);
  });

  // Listen for incoming connection
  peer.on('connection', function (connection) {
    conn = connection;
    setupChat();
  });

  // Listen for incoming messages
  peer.on('data', function (data) {
    displayMessage("Friend: " + data);
  });
}

// Connect to another peer by their ID
function connectToPeer() {
  let otherPeerId = document.getElementById("otherPeerId").value;
  if (otherPeerId && peer) {
    conn = peer.connect(otherPeerId);
    conn.on('open', function () {
      setupChat();
    });
    conn.on('data', function (data) {
      displayMessage("Friend: " + data);
    });
  }
}

// Set up the chat interface
function setupChat() {
  chatArea.style.display = 'block';
  document.getElementById("otherPeerId").disabled = true;
}

// Send a message to the connected peer
function sendMessage() {
  let message = messageInput.value;
  if (message && conn) {
    conn.send(message);
    displayMessage("You: " + message);
    messageInput.value = '';  // Clear input
  }
}

// Display messages in the chat window
function displayMessage(message) {
  let div = document.createElement("div");
  div.textContent = message;
  messageArea.appendChild(div);
  messageArea.scrollTop = messageArea.scrollHeight;  // Scroll to the latest message
}
