// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const indexRoutes = require('./routes/index'); // Import rute

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // Setup WebSocket

// --- SETUP VIEW ENGINE (EJS) ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- SETUP PUBLIC FOLDER (CSS/JS Client) ---
app.use(express.static(path.join(__dirname, 'public')));

// --- ROUTES ---
app.use('/', indexRoutes);

// --- WEBSOCKET LOGIC (REALTIME) ---
wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        // Terima data dari ESP32
        const dataString = message.toString();
        console.log('Data masuk:', dataString);

        // Broadcast: Kirim ulang data ke Frontend (Browser)
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(dataString);
            }
        });
    });
});

// Jalankan Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});