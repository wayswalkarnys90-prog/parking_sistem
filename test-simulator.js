const WebSocket = require('ws');

// Connect ke server lokal kita sendiri
const ws = new WebSocket('ws://localhost:3000');

ws.on('open', function open() {
  console.log('Simulator Connected! Mengirim data acak...');

  // Kirim data acak setiap 2 detik
  setInterval(() => {
    // Pilih slot acak 1 sampai 10
    const randomId = Math.floor(Math.random() * 10) + 1;
    // Tentukan status acak
    const isFull = Math.random() < 0.5; 
    
    const payload = {
        id: randomId,
        status: isFull ? 'occupied' : 'free'
    };

    console.log('Mengirim:', payload);
    ws.send(JSON.stringify(payload));
  }, 1000);
});