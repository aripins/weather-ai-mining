const CHATBOT_API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api/chatbot'
  : 'https://chatbot-rain-production.up.railway.app';

export const sendToChatbot = async (message) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${CHATBOT_API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (data.reply) return data.reply;
    if (data.response) return data.response;
    if (data.message) return data.message;
    if (typeof data === 'string') return data;

    return "Terima kasih atas pertanyaan Anda.";
  } catch (error) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hujan') || lowerMessage.includes('rain') || lowerMessage.includes('curah')) {
      return "Analisis Hujan untuk Tambang:\n• Hujan ringan (<5mm): Operasi dikurangi 20%\n• Hujan sedang (5-10mm): Tunda pengangkutan\n• Hujan lebat (>10mm): Hentikan semua operasi\nRekomendasi: Periksa kondisi jalan dan drainase.";
    }

    if (lowerMessage.includes('suhu') || lowerMessage.includes('temperature') || lowerMessage.includes('panas')) {
      return "Analisis Suhu:\n• <25°C: Kondisi optimal\n• 25-35°C: Tambah istirahat 15 menit tiap 2 jam\n• >35°C: Hentikan pekerjaan berat\nRekomendasi: Monitor kondisi pekerja.";
    }

    if (lowerMessage.includes('keselamatan') || lowerMessage.includes('safety') || lowerMessage.includes('k3')) {
      return "Standar Keselamatan Tambang:\n1. APD lengkap\n2. Patuhi SOP\n3. Pemeriksaan alat\n4. Komunikasi jelas\n5. Emergency response siap.";
    }

    if (lowerMessage.includes('alat berat') || lowerMessage.includes('excavator') || lowerMessage.includes('dump truck')) {
      return "Operasional Alat Berat:\n• Kondisi basah: Kurangi kecepatan 30%\n• Visibilitas rendah: Nyalakan lampu dan gunakan spotter\n• Medan curam: Brake test\n• Maintenance: Periksa ban, hidrolik, dan rem.";
    }

    if (lowerMessage.includes('produksi') || lowerMessage.includes('target') || lowerMessage.includes('output')) {
      return "Faktor Produksi:\n1. Cuaca\n2. Material\n3. Alat\n4. SDM\nSaran: Optimalkan efisiensi pada kondisi kurang ideal.";
    }

    if (lowerMessage.includes('rekomendasi') || lowerMessage.includes('saran') || lowerMessage.includes('apa yang harus')) {
      return "Rekomendasi Operasional:\n• Hari cerah: Maksimalkan produksi\n• Hujan ringan: Kurangi kecepatan\n• Hujan lebat: Hentikan operasi\n• Suhu tinggi: Tambah istirahat\n• Angin kencang: Hindari kerja ketinggian.";
    }

    return "Saya adalah asisten AI operasional tambang. Silakan ajukan pertanyaan terkait cuaca, keselamatan, alat berat, atau produksi.";
  }
};

export const quickResponses = {
  cuaca:
    "Cuaca mempengaruhi jalan angkut, visibilitas, dan stabilitas lereng. Suhu tinggi berdampak pada pekerja dan alat. Angin kencang membahayakan pekerjaan ketinggian.",
  safety:
    "5 Pilar Keselamatan: Leadership, Hazard ID, Risk Management, Training, Emergency Preparedness. Selalu gunakan APD.",
  produksi:
    "Tips Produksi: Optimasi rute hauling, minimasi waktu tunggu alat, perawatan rutin, manajemen shift efektif.",
  'alat berat':
    "Checklist Harian: Tekanan ban, sistem hidrolik, rem, lampu, radiator, oli mesin.",
  hauling:
    "Faktor Hauling: Kondisi jalan, slope, visibilitas, angin, berat muatan, kondisi alat.",
  blasting:
    "Safety Blasting: Evakuasi area, komunikasi jelas, monitoring cuaca, inspeksi setelah ledakan, dokumentasi lengkap."
};
