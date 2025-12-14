// chatbot-api.js
const CHATBOT_API_URL = 'https://chatbot-rain-production.up.railway.app';

export const sendToChatbot = async (message) => {
  try {
    console.log('🚀 Mengirim ke API:', message);
    
    // Pastikan URL benar
    const response = await fetch(`${CHATBOT_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ message: message })
    });

    console.log('📡 Status:', response.status);
    
    // Cek jika response tidak OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response tidak OK:', errorText);
      
      // Handle error spesifik
      if (response.status === 404) {
        throw new Error('Endpoint tidak ditemukan (404). Pastikan URL benar.');
      } else if (response.status === 500) {
        throw new Error('Server error (500). Silakan coba lagi nanti.');
      }
      
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    // Parse response
    const data = await response.json();
    console.log('📦 Data response:', data);
    
    // SESUAIKAN DENGAN FORMAT RESPONSE BARU
    // Response: {"message": "..."}
    if (data.message) {
      // Jika isinya "Use POST /chat", berarti endpoint menerima request tapi tidak memproses
      if (data.message === "Use POST /chat") {
        return "✅ Koneksi berhasil! Silakan tanyakan sesuatu tentang mining safety.";
      }
      return data.message.replace(/\*\*/g, '');
    } 
    // Fallback untuk format lama (jika ada)
    else if (data.reply) {
      return data.reply.replace(/\*\*/g, '');
    } 
    // Fallback lainnya
    else {
      console.warn('⚠️ Format response tidak dikenali:', data);
      return JSON.stringify(data).replace(/\*\*/g, '');
    }
    
  } catch (error) {
    console.error('🔥 Error total:', error);
    
    // Handle error lebih spesifik
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return '⏱️ Timeout: Server tidak merespons. Coba lagi.';
    } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return '🌐 Error koneksi: Pastikan Anda terhubung ke internet.';
    } else if (error.message.includes('CORS')) {
      return '🔒 CORS Error: Server tidak mengizinkan request dari domain ini.';
    }
    
    return `Error: ${error.message}\n\nCoba refresh halaman atau hubungi administrator.`;
  }
};

// Quick responses untuk button (optional)
export const quickResponses = {
  cuaca: "Cuaca mempengaruhi operasi tambang: jalan licin, stabilitas lereng, visibilitas.",
  safety: "Keselamatan tambang: APD lengkap, ikuti SOP, komunikasi, emergency response.",
};