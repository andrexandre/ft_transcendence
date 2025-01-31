const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => {
    console.log("✅ Connected to WebSocket");
    socket.send("Hello, Server!"); // Send test message
};

socket.onmessage = (event) => {
    console.log("📩 Message from server:", event.data);
};

socket.onerror = (error) => {
    console.error("❌ WebSocket error:", error);
};

socket.onclose = () => {
    console.log("🔴 WebSocket connection closed");
};
