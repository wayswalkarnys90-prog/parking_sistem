// public/js/monitor.js

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${protocol}//${window.location.host}`);

ws.onopen = () => {
    console.log("Terhubung ke Sistem Parkir");
};

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        
        // Normalisasi ID: hapus string "slot-" agar sisa angkanya saja
        // Contoh: "slot-1" jadi "1"
        let slotId = data.id.toString().replace('slot-', '');

        // Panggil fungsi update UI
        updateSlotUI(slotId, data.distance, data.status);

    } catch (e) {
        console.error("Error parsing JSON", e);
    }
};

function updateSlotUI(id, distance, statusOverride) {
    const slotElement = document.getElementById(`slot-${id}`);
    const statusText = document.getElementById(`status-text-${id}`);

    // Jika elemen tidak ditemukan di HTML, stop (biar gak error)
    if (!slotElement) return;

    // --- LOGIKA PENENTUAN STATUS ---
    let isOccupied = false;

    // Prioritas 1: Ikuti status text dari ESP32 (occupied/free)
    if (statusOverride) {
        if (statusOverride === 'occupied' || statusOverride === 'terisi') {
            isOccupied = true;
        } else {
            isOccupied = false;
        }
    } 
    // Prioritas 2: Jika ESP32 cuma kirim jarak, hitung sendiri
    else if (distance !== undefined) {
        // Anggap terisi jika jarak kurang dari 50cm
        isOccupied = (distance < 50 && distance > 0);
    }

    // --- UPDATE TAMPILAN (BUG FIX DISINI) ---
    if (isOccupied) {
        // KONDISI: TERISI (MERAH)
        // 1. Hapus class hijau (PENTING!)
        slotElement.classList.remove('free');
        // 2. Tambah class merah
        slotElement.classList.add('occupied');
        
        // Update Teks
        if(statusText) statusText.innerText = "Terisi";

    } else {
        // KONDISI: KOSONG (HIJAU)
        // 1. Hapus class merah (PENTING! Ini yg sering lupa)
        slotElement.classList.remove('occupied'); 
        // 2. Tambah class hijau
        slotElement.classList.add('free');
        
        // Update Teks
        if(statusText) statusText.innerText = "Kosong";
    }
}