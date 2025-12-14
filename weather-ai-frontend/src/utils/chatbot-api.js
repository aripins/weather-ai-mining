// chatbot-api.js - VERSI TERPERBAIKI
const CHATBOT_API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api/chatbot'
  : 'https://chatbot-rain-production.up.railway.app';

export const sendToChatbot = async (message) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 detik timeout

    console.log('🤖 Sending to chatbot:', { 
      endpoint: `${CHATBOT_API_URL}/ask`, 
      question: message 
    });

    // PERUBAHAN PENTING: Gunakan endpoint /ask dan field question (bukan message)
    const response = await fetch(`${CHATBOT_API_URL}/ask`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        question: message, // Field HARUS "question", bukan "message"
        context: 'mining_safety' // Tambahkan context untuk hasil lebih baik
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Chatbot API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Chatbot API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Chatbot response received:', data);

    // Ekstrak jawaban berdasarkan struktur yang mungkin
    // Coba berbagai kemungkinan field yang mungkin dikembalikan
    if (data.answer) return data.answer;
    if (data.response) return data.response;
    if (data.message) return data.message;
    if (data.reply) return data.reply;
    if (typeof data === 'string') return data;
    
    // Jika ada objek tapi tidak ada field yang dikenali
    if (data && typeof data === 'object') {
      // Coba ambil field pertama yang berisi string
      for (const key in data) {
        if (typeof data[key] === 'string') {
          return data[key];
        }
      }
      return JSON.stringify(data);
    }
    
    return "Terima kasih atas pertanyaan Anda. Untuk informasi lebih lanjut, silakan lihat panduan keselamatan di dashboard.";

  } catch (error) {
    console.error('❌ Chatbot fetch failed:', error.message);
    
    // Fallback ke rule-based responses yang lebih baik
    return getEnhancedFallbackResponse(message);
  }
};

// Helper function untuk fallback responses yang lebih baik
function getEnhancedFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hujan') || lowerMessage.includes('rain') || lowerMessage.includes('curah') || lowerMessage.includes('basah')) {
    return `**HUJAN & OPERASI TAMBANG** 🌧️
    
• **Hujan Ringan (<5mm/jam):** 
  - Kurangi kecepatan alat berat 20%
  - Periksa kondisi jalan angkut
  - Lanjutkan operasi dengan pengawasan ketat

• **Hujan Sedang (5-10mm/jam):**
  - Tunda pengangkutan material
  - Fokus pada pekerjaan dalam ruangan
  - Siapkan pompa dewatering

• **Hujan Lebat (>10mm/jam):**
  - HENTIKAN semua operasi luar ruangan
  - Evakuasi area rendah dan rawan banjir
  - Aktifkan tim emergency response

**Rekomendasi:** Pantau radar BMKG, periksa sistem drainase, pastikan komunikasi radio berfungsi.`;
  }

  if (lowerMessage.includes('suhu') || lowerMessage.includes('temperature') || lowerMessage.includes('panas') || lowerMessage.includes('heat')) {
    return `**MANAJEMEN SUHU TINGGI DI TAMBANG** 🔥

• **<25°C:** Kondisi optimal untuk operasi tambang
• **25-35°C:** 
  - Tambah istirahat 15 menit setiap 2 jam
  - Sediakan air minum yang cukup
  - Rotasi pekerja di area terbuka
• **>35°C:** 
  - HENTIKAN pekerjaan berat
  - Buat zona teduh untuk istirahat
  - Pantau gejala heat stroke: pusing, mual, kelelahan ekstrem

**Protokol APD:** Gunakan kacamata anti-silau, pakaian katun lembab, topi lebar, dan tabir surya.`;
  }

  if (lowerMessage.includes('keselamatan') || lowerMessage.includes('safety') || lowerMessage.includes('k3') || lowerMessage.includes('aman')) {
    return `**5 PILAR KESELAMATAN TAMBANG (K3)** ⛑

1. **KEPEMIMPINAN:** Komitmen manajemen terhadap zero accident
2. **IDENTIFIKASI BAHAYA:** Risk assessment harian (JSA - Job Safety Analysis)
3. **PENGENDALIAN RISIKO:** Hierarchy of Control (eliminasi, substitusi, engineering control)
4. **KOMPETENSI:** Training & sertifikasi berkelanjutan
5. **EMERGENCY RESPONSE:** Tim siap 24/7, alat emergency lengkap

**APD WAJIB:** Helm, sepatu safety, kacamata, pelindung telinga, masker, safety harness (jika kerja di ketinggian).`;
  }

  if (lowerMessage.includes('alat berat') || lowerMessage.includes('excavator') || lowerMessage.includes('dump truck') || lowerMessage.includes('loader')) {
    return `**OPERASIONAL ALAT BERAT** 🚜

• **PRE-START CHECKLIST:**
  1. Tekanan ban sesuai spesifikasi
  2. Sistem hidrolik tidak bocor
  3. Rem dan parkir brake berfungsi
  4. Semua lampu dan sirene beroperasi
  5. Level oli, coolant, dan hydraulic fluid

• **KONDISI CUACA EKSTREM:**
  - Basah: Kurangi kecepatan 30%, gunakan chains jika perlu
  - Visibilitas rendah: Nyalakan semua lampu, gunakan spotter
  - Medan curam: Lakukan brake test, gunakan gear rendah

• **MAINTENANCE:** Laporan harian, service terjadwal, tracking jam operasi.`;
  }

  if (lowerMessage.includes('produksi') || lowerMessage.includes('target') || lowerMessage.includes('output') || lowerMessage.includes('tonase')) {
    return `**OPTIMASI PRODUKSI TAMBANG** 📊

**FAKTOR PENENTU:**
1. **CUACA:** 30% pengaruh pada produktivitas
2. **KETERSEDIAAN ALAT:** MTBF (Mean Time Between Failure)
3. **EFISIENSI OPERASI:** Cycle time, wait time, repair time
4. **KUALITAS MATERIAL:** ROM (Run of Mine) characteristics

**STRATEGI:**
• **Hauling Optimization:** Optimal route planning
• **Preventive Maintenance:** Scheduled downtime
• **Shift Management:** Effective crew rotation
• **Real-time Monitoring:** Fleet management system`;
  }

  if (lowerMessage.includes('rekomendasi') || lowerMessage.includes('saran') || lowerMessage.includes('apa yang harus') || lowerMessage.includes('tips')) {
    return `**REKOMENDASI OPERASIONAL BERDASARKAN KONDISI** 📋

• **PAGI HARI (06:00-10:00):** Optimal untuk pekerjaan fisik berat
• **SIANG (10:00-14:00):** Hindari kerja di area terbuka, fokus pada maintenance
• **HUJAN:** Prioritaskan pekerjaan dalam ruangan, workshop, training
• **ANGIN KENCANG (>40km/j):** Hentikan crane operation, amankan material ringan
• **VISIBILITAS RENDAH:** Gunakan spotter, tambah lampu, kurangi kecepatan

**Always: Plan-Do-Check-Act (PDCA) cycle.**`;
  }

  if (lowerMessage.includes('cuaca') && lowerMessage.includes('pengaruh') || lowerMessage.includes('dampak')) {
    return `**DAMPAK CUACA PADA OPERASI TAMBANG** ⚡

**HUJAN:**
✓ Jalan angkut licin & banjir
✓ Stabilitas lereng menurun
✓ Visibilitas berkurang
✓ Material basah sulit diangkut

**SUHU TINGGI:**
✓ Heat stress pada pekerja
✓ Overheating alat berat
✓ Material expansion
✓ Increased fuel consumption

**ANGIN:**
✓ Dust dispersion
✓ Crane operation hazard
✓ Material flying hazard
✓ Communication interference

**Mitigasi:** Weather monitoring system, flexible scheduling, emergency protocols.`;
  }

  // Default response jika tidak ada keyword yang cocok
  return `Halo! Saya **Mining Safety & Operation Assistant** 🤖

Saya bisa membantu Anda dengan:
• **Keselamatan kerja tambang (K3)** - protokol, APD, emergency response
• **Operasional tambang** - hauling, loading, blasting, crushing
• **Dampak cuaca** terhadap aktivitas tambang dan mitigasinya
• **Rekomendasi teknis** berdasarkan kondisi aktual lokasi

**Silakan tanyakan hal spesifik seperti:**
"Bagaimana menangani hujan deras di lokasi tambang?"
"Apa protokol keselamatan untuk alat berat?"
"Bagaimana mengoptimalkan produksi saat cuaca buruk?"`;
}

export const quickResponses = {
  cuaca:
    "**Cuaca mempengaruhi:** 1) Jalan angkut (licin/banjir), 2) Stabilitas lereng (risiko longsor), 3) Visibilitas (kabut/hujan), 4) Kinerja alat (overheating), 5) Produktivitas pekerja (heat stress). **Mitigasi:** Monitoring BMKG real-time, drainage system, flexible scheduling.",
  safety:
    "**K3 Tambang:** 1) Leadership & commitment, 2) Hazard identification (JSA), 3) Risk control hierarchy, 4) Competence & training, 5) Emergency preparedness. **APD wajib:** Helm, safety shoes, goggles, ear protection, mask, harness (working at height).",
  produksi:
    "**Produktivitas dipengaruhi oleh:** 1) Weather conditions (30%), 2) Equipment availability (MTBF), 3) Operator skill, 4) Material characteristics. **Optimasi:** Hauling route planning, preventive maintenance, real-time monitoring, effective shift rotation.",
  'alat berat':
    "**Daily Checklist:** Tire pressure, hydraulic leaks, brakes, lights, fluid levels. **Operational Safety:** Speed limits, signaling, load capacity, ground conditions. **Maintenance:** Scheduled services, component tracking, failure analysis.",
  hauling:
    "**Faktor Hauling Efficiency:** 1) Road condition (grade, surface), 2) Truck payload (optimal loading), 3) Cycle time (loading-hauling-dumping-return), 4) Traffic management, 5) Weather impact. **Target:** Minimize empty haul, optimize route, reduce wait time.",
  blasting:
    "**Blasting Safety Protocol:** 1) Area evacuation & barricading, 2) Communication network, 3) Weather monitoring (no blasting during thunderstorms), 4) Charge calculation & placement, 5) Post-blast inspection (misfire check), 6) Documentation & reporting."
};