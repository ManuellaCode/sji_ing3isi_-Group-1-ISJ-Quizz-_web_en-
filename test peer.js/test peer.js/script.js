var peer = new Peer();

let localstream;

const inputlocalpeerid = document.getElementById("localpeerid");
const inputremotepeerid = document.getElementById("remotepeerid")
const btncall = document.getElementById("btn-call");

const btnmessage = document.getElementById("btn-send")

navigator.mediaDevices.getUserMedia({video: true})
    .then(stream =>{
        localstream = stream;
        const videoelement = document.getElementById("localvideo");
        videoelement.srcObject = stream
        videoelement.onloadedmetadata = () => videoelement.play();
    });

alert("hello")
peer.on("open", id => {
    inputlocalpeerid.value = id;
})

btncall.addEventListener("click", function(){
    alert("Hello")
    alert("Hi")
    const remotepeerid =  inputremotepeerid.value;
    alert("this is the id of call: " + remotepeerid)
    const call = peer.call(remotepeerid, localstream);
    call.on("stream", stream => {
        const remotevideo = document.getElementById("remotevideo");
        remotevideo.srcObject = stream;
        remotevideo.onloadedmetadata = () => remotevideo.play();
    });
});

peer.on("call", call => {
    call.answer(localstream);
    call.on("stream", stream => {
        const remotevideo = document.getElementById("remotevideo");
        remotevideo.srcObject = stream
        remotevideo.onloadedmetadata = () => remotevideo.play();
    });
});


btnmessage.addEventListener("click", function(){
    alert("sending")
    const remotepeerid =  inputremotepeerid.value;
    const conn = peer.connect(remotepeerid);

    const message = document.getElementById("sentmessage").value
    alert(message)
    conn.on("open", function(){
        conn.send(message);
    })
})

//listen for incoming connections
peer.on("connection", function(conn){
    conn.on("data", function(){
        const remotetext = document.getElementById("message")
        remotetext.value = data
        alert(data);
    })
})