// Create a new Peer instance
var peer = new Peer();

let localStream;

// Get DOM elements
const inputLocalPeerId = document.getElementById("localpeerid");
const inputRemotePeerId = document.getElementById("remotepeerid");
const btnCall = document.getElementById("btn-call");
const btnSend = document.getElementById("btn-send");
const localVideo = document.getElementById("localvideo");
const remoteVideo = document.getElementById("remotevideo");
const sentMessageInput = document.getElementById("sentmessage");

// Access the user's webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = stream;
        localVideo.onloadedmetadata = () => localVideo.play();
    })
    .catch(err => {
        console.error('Error accessing media devices.', err);
    });

// Display the local peer ID
peer.on("open", id => {
    inputLocalPeerId.value = id;
});

// Call another peer
btnCall.addEventListener("click", function() {
    const remotePeerId = inputRemotePeerId.value;
    const call = peer.call(remotePeerId, localStream);

    call.on("stream", stream => {
        remoteVideo.srcObject = stream;
        remoteVideo.onloadedmetadata = () => remoteVideo.play();
    });
});

// Answer an incoming call
peer.on("call", call => {
    call.answer(localStream);
    call.on("stream", stream => {
        remoteVideo.srcObject = stream;
        remoteVideo.onloadedmetadata = () => remoteVideo.play();
    });
});

// Sending messages
btnSend.addEventListener("click", function() {
    const remotePeerId = inputRemotePeerId.value;
    const conn = peer.connect(remotePeerId);

    const message = sentMessageInput.value;
    conn.on("open", function() {
        conn.send(message);
        sentMessageInput.value = ''; // Clear the input field after sending
    });
});

// Listen for incoming connections
peer.on("connection", function(conn) {
    conn.on("data", function(data) {
        const messageDisplay = document.createElement('span');
        messageDisplay.textContent = `Received: ${data}`;
        document.body.appendChild(messageDisplay);
    });
});