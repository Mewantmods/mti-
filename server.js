// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const server = require("http").createServer(app);

// Serve the HTML file from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Store current stream status
let isStreamLive = false;
let currentStreamer = null;

io.on('connection', (socket) => {
    console.log('A user connected');

    // 1. Send current stream status to new users
    if (isStreamLive) {
        socket.emit('stream-started', currentStreamer);
    }

    // 2. Handle Chat Messages
    socket.on('send-chat', (data) => {
        // Broadcast this message to everyone including the sender
        io.emit('receive-chat', data);
    });

    // 3. Handle Stream Starting
    socket.on('start-stream', (streamerName) => {
        isStreamLive = true;
        currentStreamer = streamerName;
        // Tell everyone else a stream started
        socket.broadcast.emit('stream-started', streamerName);
    });

    // 4. Handle Video Data (The "Streaming" part)
    // We receive an image frame and send it to everyone else
    socket.on('stream-data', (image) => {
        socket.broadcast.emit('stream-data', image);
    });

    // 5. Handle Stream Stopping
    socket.on('stop-stream', () => {
        isStreamLive = false;
        currentStreamer = null;
        socket.broadcast.emit('stream-ended');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Listen on port 3000
http.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});