const socket = new WebSocket("ws://localhost:8000/wss");

socket.addEventListener("open", (event) => {
  socket.send("Hello Server!");
});

// Listen for messages
socket.addEventListener("message", (event) => {
  console.log("Message from server ", event.data);
});

socket.addEventListener("close", (event) => {
  console.log("Close", event);
});
