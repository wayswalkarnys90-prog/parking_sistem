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
        let slotId = data.id.toString().replace('slot-', '');

        // Panggil fungsi update UI
        updateSlotUI(slotId, data.distance, data.status);

    } catch (e) {
        console.error("Error parsing JSON", e);
    }
};

// --- BAGIAN BARU: PENANGANAN KONEKSI PUTUS ---
ws.onclose = () => {
    console.log("Koneksi terputus! Mereset tampilan...");
    
    // 1. Reset semua slot jadi hijau/kosong agar tidak nyangkut merah
    resetAllSlots();

    // 2. Refresh halaman otomatis setelah 3 detik untuk mencoba konek ulang
    setTimeout(() => {
        window.location.reload(); 
    }, 3000);
};

ws.onerror = (error) => {
    console.error("WebSocket Error:", error);
    ws.close(); // Tutup koneksi agar trigger onclose
};

// --- FUNGSI UPDATE UI (SATUAN) ---
function updateSlotUI(id, distance, statusOverride) {
    const slotElement = document.getElementById(`slot-${id}`);
    const statusText = document.getElementById(`status-text-${id}`);

    // Jika elemen tidak ditemukan di HTML, stop
    if (!slotElement) return;

    // --- LOGIKA PENENTUAN STATUS ---
    let isOccupied = false;

    // Prioritas 1: Ikuti status text dari ESP32
    if (statusOverride) {
        const s = statusOverride.toLowerCase();
        if (s === 'occupied' || s === 'terisi' || s === 'full') {
            isOccupied = true;
        } else {
            isOccupied = false;
        }
    } 
    // Prioritas 2: Hitung sendiri dari jarak
    else if (distance !== undefined) {
        isOccupied = (distance < 50 && distance > 0);
    }

    // --- UPDATE TAMPILAN ---
    if (isOccupied) {
        // KONDISI: TERISI (MERAH)
        slotElement.classList.remove('free');
        slotElement.classList.add('occupied');
        if(statusText) statusText.innerText = "Terisi";
    } else {
        // KONDISI: KOSONG (HIJAU)
        slotElement.classList.remove('occupied'); 
        slotElement.classList.add('free');
        if(statusText) statusText.innerText = "Kosong";
    }
}

// --- FUNGSI BARU: RESET SEMUA SLOT KE KOSONG ---
function resetAllSlots() {
    // Loop dari 1 sampai 10 (sesuai jumlah slot kamu)
    for (let i = 1; i <= 10; i++) {
        const slotElement = document.getElementById(`slot-${i}`);
        const statusText = document.getElementById(`status-text-${i}`);

        if (slotElement) {
            // Paksa Hapus Merah, Paksa Pasang Hijau
            slotElement.classList.remove('occupied');
            slotElement.classList.add('free');
            
            // Reset Teks
            if(statusText) statusText.innerText = "Kosong";
        }
    }
}