const CHATBOT_API_URL = 'https://chatbot-rain-production.up.railway.app';

export const sendToChatbot = async (message) => {
  try {
    console.log('🤖 Sending to Railway backend:', { 
      url: `${CHATBOT_API_URL}/chat`,
      message: message 
    });

    const response = await fetch(`${CHATBOT_API_URL}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: message 
      }),
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Backend response:', data);

    if (data.reply) {
      return data.reply;
    }

    return "Terima kasih atas pertanyaan Anda. Mohon coba lagi.";

  } catch (error) {
    console.error('❌ Chatbot connection failed:', error.message);
    
    // Fallback ke local responses
    return getEnhancedFallbackResponse(message);
  }
};

// Helper function untuk fallback responses (sama seperti sebelumnya)
function getEnhancedFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hujan')) {
    return `**PROTOKOL HUJAN TAMBANG** 🌧️\n\n1. Hujan ringan: Lanjut operasi dengan pengawasan\n2. Hujan sedang: Tunda pengangkutan\n3. Hujan lebat: HENTIKAN semua operasi luar\n\n**Safety first!** ⛑️`;
  }

  if (lowerMessage.includes('suhu')) {
    return `**PROTOKOL SUHU TINGGI** 🔥\n\n• 25-35°C: Tambah istirahat\n• >35°C: Hentikan pekerjaan berat\n• Pantau gejala heat stroke\n\n**Sediakan air minum yang cukup!**`;
  }

  if (lowerMessage.includes('keselamatan')) {
    return `**5 PILAR KESELAMATAN TAMBANG** ⛑\n\n1. KEPEMIMPINAN\n2. IDENTIFIKASI BAHAYA\n3. PENGENDALIAN RISIKO\n4. KOMPETENSI\n5. EMERGENCY RESPONSE\n\n**APD WAJIB:** Helm, sepatu safety, kacamata.`;
  }

  if (lowerMessage.includes('alat berat')) {
    return `**CHECKLIST ALAT BERAT** 🚜\n\n1. Tekanan ban\n2. Sistem hidrolik\n3. Rem dan lampu\n4. Level fluida\n5. Pre-start inspection\n\n**Safety sebelum produktivitas!**`;
  }

  return `Terima kasih atas pertanyaan tentang **"${message}"**!\n\nSebagai Mining Safety Assistant, saya sarankan:\n1. Konsultasi dengan supervisor K3\n2. Ikuti SOP yang berlaku\n3. Gunakan APD lengkap\n4. Monitor kondisi cuaca\n\n**Safety first!** ⛑️`;
}

export const quickResponses = {
  cuaca: "Cuaca ekstrem dapat menghentikan operasi. Monitor BMKG, siapkan rencana kontingensi.",
  safety: "Selalu gunakan APD lengkap, ikuti prosedur, lapor kondisi tidak aman.",
  produksi: "Optimalkan berdasarkan cuaca, maintenance, dan koordinasi tim.",
  'alat berat': "Checklist harian wajib: ban, rem, hidrolik, lampu, fluida.",
  hauling: "Rute aman & efisien. Pertimbangkan kondisi jalan dan cuaca.",
  blasting: "Area harus dikosongkan, komunikasi aktif, NO blasting saat badai."
};