/* public/js/monitor.js */

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${protocol}//${window.location.host}`);

// Elemen Status
const indicator = document.getElementById('server-indicator');
const connectionText = document.getElementById('connection-text');

// Timer untuk mendeteksi ESP32 mati
let espWatchdog;

ws.onopen = () => {
    console.log("Terhubung ke Server (Menunggu Data ESP32...)");
    // Saat baru buka, kita set WAITING dulu sampai ada data pertama masuk
    setEspStatus("WAITING");
};

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        
        // 1. DATA MASUK! Berarti ESP32 Hidup -> Set Status ONLINE
        setEspStatus("ONLINE");

        // 2. Reset Timer Kematian (Watchdog)
        // Kalau 5 detik ke depan gak ada data lagi, anggap OFFLINE
        clearTimeout(espWatchdog);
        espWatchdog = setTimeout(() => {
            setEspStatus("OFFLINE");
            resetAllSlots(); // Hapus status slot karena data sudah basi
        }, 5000); // 5 Detik toleransi

        // 3. Update Slot Parkir seperti biasa
        let slotId = data.id.toString().replace('slot-', '');
        updateSlotUI(slotId, data.distance, data.status);

    } catch (e) {
        console.error("Error data:", e);
    }
};

ws.onclose = () => {
    console.log("Koneksi Server Putus");
    setEspStatus("OFFLINE");
    resetAllSlots();
    setTimeout(() => window.location.reload(), 3000);
};

// --- FUNGSI UPDATE SLOT UI ---
function updateSlotUI(id, distance, statusOverride) {
    const slotElement = document.getElementById(`slot-${id}`);
    const statusText = document.getElementById(`status-text-${id}`);
    if (!slotElement) return;

    let isOccupied = false;
    if (statusOverride) {
        const s = statusOverride.toLowerCase();
        isOccupied = (s === 'occupied' || s === 'terisi' || s === 'full');
    } else if (distance !== undefined) {
        isOccupied = (distance < 50 && distance > 0);
    }

    if (isOccupied) {
        slotElement.classList.remove('free');
        slotElement.classList.add('occupied');
        if(statusText) statusText.innerText = "TERISI";
    } else {
        slotElement.classList.remove('occupied'); 
        slotElement.classList.add('free');
        if(statusText) statusText.innerText = "KOSONG";
    }
}

// --- FUNGSI UBAH WARNA INDIKATOR ---
function setEspStatus(status) {
    if(!indicator || !connectionText) return;

    // Reset Class dulu
    indicator.classList.remove('online', 'offline');

    if (status === "ONLINE") {
        indicator.classList.add('online'); // Hijau
        connectionText.innerText = "TERHUBUNG"; // Atau "ESP32 LIVE"
    } 
    else if (status === "WAITING") {
        indicator.classList.add('offline'); // Merah (tapi teks beda)
        connectionText.innerText = "MENUNGGU DATA";
    }
    else {
        // OFFLINE
        indicator.classList.add('offline'); // Merah
        connectionText.innerText = "TERPUTUS"; // Atau "ESP32 DOWN"
    }
}

// --- FUNGSI RESET TAMPILAN ---
function resetAllSlots() {
    for (let i = 1; i <= 10; i++) {
        const slotElement = document.getElementById(`slot-${i}`);
        const statusText = document.getElementById(`status-text-${i}`);
        if (slotElement) {
            slotElement.classList.remove('occupied');
            slotElement.classList.add('free');
            if(statusText) statusText.innerText = "KOSONG";
        }
    }
}