import { Bot, CloudRain, Send, Shield, Sparkles, Thermometer, User, Wrench, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { quickResponses, sendToChatbot } from '../utils/chatbot-api';

const Chatbot = ({ isOpen, onClose, weatherData }) => {
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      content: 'Halo! Saya **Mining Safety & Operation Assistant** 🤖\n\nSaya bisa membantu Anda dengan:\n• **Keselamatan kerja tambang (K3)** - protokol, APD, emergency response\n• **Operasional tambang** - hauling, loading, blasting, crushing\n• **Dampak cuaca** terhadap aktivitas tambang dan mitigasinya\n• **Rekomendasi teknis** berdasarkan kondisi aktual lokasi\n\n**Contoh pertanyaan:**\n"Bagaimana menangani hujan deras di lokasi?"\n"Apa protokol suhu tinggi untuk pekerja?"\n"Bagaimana safety checklist alat berat?"'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('ready'); // 'ready', 'loading', 'connected', 'fallback', 'error'
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const quickQuestions = [
    { 
      text: 'Bagaimana cuaca mempengaruhi operasi tambang?',
      icon: <CloudRain className="w-3 h-3 mr-1" />
    },
    { 
      text: 'Apa protokol keselamatan untuk alat berat?',
      icon: <Wrench className="w-3 h-3 mr-1" />
    },
    { 
      text: 'Bagaimana jika terjadi hujan deras di lokasi?',
      icon: <CloudRain className="w-3 h-3 mr-1" />
    },
    { 
      text: 'Apa yang harus dilakukan saat suhu >35°C?',
      icon: <Thermometer className="w-3 h-3 mr-1" />
    },
    { 
      text: 'Standar K3 di area tambang?',
      icon: <Shield className="w-3 h-3 mr-1" />
    },
  ];
  
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { 
      type: 'user', 
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setApiStatus('loading');
    
    try {
      console.log(`📤 Sending to chatbot: "${input}"`);
      
      // Tambahkan delay kecil untuk UX yang lebih baik
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const botResponse = await sendToChatbot(input);
      
      // Deteksi apakah ini fallback response atau dari AI
      const isFallback = botResponse.includes('Halo! Saya **Mining Safety') || 
                         botResponse.includes('**HUJAN & OPERASI TAMBANG**') ||
                         botResponse.includes('**MANAJEMEN SUHU TINGGI**') ||
                         botResponse.includes('**5 PILAR KESELAMATAN TAMBANG**');
      
      setApiStatus(isFallback ? 'fallback' : 'connected');
      
      const botMessage = { 
        type: 'bot', 
        content: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: isFallback
      };
      
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('❌ Chatbot error:', error);
      setApiStatus('error');
      
      // Enhanced fallback dengan konteks cuaca jika ada
      let fallbackResponse = "**⚠️ Sementara menggunakan basis pengetahuan lokal**\n\n";
      
      const lowerInput = input.toLowerCase();
      let foundKeyword = false;
      
      // Cek keyword untuk fallback yang lebih spesifik
      for (const [keyword, response] of Object.entries(quickResponses)) {
        if (lowerInput.includes(keyword)) {
          fallbackResponse += response;
          foundKeyword = true;
          break;
        }
      }
      
      // Tambahkan konteks cuaca jika ada data
      if (weatherData && !foundKeyword) {
        fallbackResponse += `\n\n**📊 Konteks Cuaca Saat Ini:**\n`;
        fallbackResponse += `• Lokasi: ${weatherData.location || 'Tidak diketahui'}\n`;
        fallbackResponse += `• Suhu: ${weatherData.temperature || 'N/A'}°C\n`;
        fallbackResponse += `• Curah Hujan: ${weatherData.rainfall || 'N/A'} mm\n`;
        fallbackResponse += `• Kecepatan Angin: ${weatherData.wind_speed || 'N/A'} km/h\n\n`;
        
        if (weatherData.rainfall > 10) {
          fallbackResponse += `**🚨 REKOMENDASI:** Hentikan operasi luar ruangan, aktifkan tim emergency.`;
        } else if (weatherData.temperature > 35) {
          fallbackResponse += `**⚠️ REKOMENDASI:** Tambah frekuensi istirahat, sediakan air minum ekstra.`;
        }
      }
      
      if (!foundKeyword && !weatherData) {
        fallbackResponse += "Silakan tanyakan tentang:\n• Keselamatan tambang (K3)\n• Operasional alat berat\n• Dampak cuaca\n• Optimasi produksi";
      }
      
      const botMessage = { 
        type: 'bot', 
        content: fallbackResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: true
      };
      
      setMessages(prev => [...prev, botMessage]);
      
    } finally {
      setLoading(false);
      // Reset status setelah beberapa detik
      setTimeout(() => {
        if (apiStatus !== 'loading') {
          setApiStatus('ready');
        }
      }, 3000);
    }
  };
  
  const handleQuickQuestion = (question) => {
    setInput(question);
    // Trigger send setelah input terupdate
    setTimeout(() => {
      const sendButton = document.querySelector('button[onClick*=handleSend]');
      if (sendButton) {
        handleSend();
      }
    }, 50);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Tambahkan weather context message
  const addWeatherContext = () => {
    if (!weatherData) return;
    
    let weatherContext = `**🌤️ KONTEKS CUACA UNTUK REKOMENDASI**\n\n`;
    weatherContext += `**Lokasi:** ${weatherData.location || 'Area Tambang'}\n`;
    weatherContext += `**Suhu:** ${weatherData.temperature || 'N/A'}°C\n`;
    weatherContext += `**Curah Hujan:** ${weatherData.rainfall || 'N/A'} mm\n`;
    weatherContext += `**Kelembaban:** ${weatherData.humidity || 'N/A'}%\n`;
    weatherContext += `**Kecepatan Angin:** ${weatherData.wind_speed || 'N/A'} km/h\n\n`;
    
    // Tambahkan rekomendasi berdasarkan kondisi
    if (weatherData.rainfall > 10) {
      weatherContext += `**🚨 STATUS:** HUJAN LEBAT - Hentikan operasi luar ruangan\n`;
      weatherContext += `**📋 TINDAKAN:**\n1. Aktifkan tim emergency\n2. Evakuasi area rendah\n3. Periksa sistem drainase\n4. Pantau kondisi lereng`;
    } else if (weatherData.temperature > 35) {
      weatherContext += `**⚠️ STATUS:** SUHU EKSTREM - Heat warning\n`;
      weatherContext += `**📋 TINDAKAN:**\n1. Tambah istirahat setiap jam\n2. Sediakan zona teduh\n3. Pantau gejala heat stress\n4. Atur shift ke pagi hari`;
    } else if (weatherData.wind_speed > 40) {
      weatherContext += `**💨 STATUS:** ANGIN KENCANG\n`;
      weatherContext += `**📋 TINDAKAN:**\n1. Hentikan crane operation\n2. Amankan material ringan\n3. Gunakan komunikasi radio\n4. Batasi kerja di ketinggian`;
    } else {
      weatherContext += `**✅ STATUS:** KONDISI NORMAL\n`;
      weatherContext += `**📋 TINDAKAN:** Lanjutkan operasi dengan monitoring rutin`;
    }
    
    const contextMessage = { 
      type: 'bot', 
      content: weatherContext,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isWeatherContext: true
    };
    
    setMessages(prev => [...prev, contextMessage]);
  };
  
  const clearChat = () => {
    setMessages([
      { 
        type: 'bot', 
        content: 'Halo! Saya **Mining Safety & Operation Assistant** 🤖\n\nPercakapan telah direset. Ada yang bisa saya bantu?'
      }
    ]);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl h-[85vh] bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-white/20 shadow-2xl flex flex-col m-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 p-6 rounded-t-3xl border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Mining Safety Assistant</h3>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-sm text-amber-300 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Powered by AI & Mining Expertise
                  </p>
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
                    apiStatus === 'connected' ? 'bg-green-500/20 text-green-300' :
                    apiStatus === 'fallback' ? 'bg-yellow-500/20 text-yellow-300' :
                    apiStatus === 'error' ? 'bg-red-500/20 text-red-300' :
                    apiStatus === 'loading' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-1.5 ${
                      apiStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                      apiStatus === 'fallback' ? 'bg-yellow-400' :
                      apiStatus === 'error' ? 'bg-red-400' :
                      apiStatus === 'loading' ? 'bg-blue-400 animate-pulse' :
                      'bg-gray-400'
                    }`} />
                    <span className="font-medium">
                      {apiStatus === 'connected' ? 'AI Connected' :
                       apiStatus === 'fallback' ? 'Local Knowledge' :
                       apiStatus === 'error' ? 'Connection Error' :
                       apiStatus === 'loading' ? 'Thinking...' :
                       'Ready'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {weatherData && (
                <button
                  onClick={addWeatherContext}
                  className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs rounded-lg border border-blue-500/30 transition-all flex items-center"
                  title="Tambahkan konteks cuaca saat ini"
                >
                  <CloudRain className="w-3 h-3 mr-1.5" />
                  Cuaca
                </button>
              )}
              <button
                onClick={clearChat}
                className="px-3 py-1.5 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 text-xs rounded-lg border border-gray-500/30 transition-all"
                title="Reset percakapan"
              >
                Clear
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Messages Container */}
        <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-900/50 to-gray-800/50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex mb-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'bot' 
                      ? (message.isWeatherContext 
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                        : message.isFallback
                        ? 'bg-gradient-to-br from-yellow-500 to-amber-500'
                        : 'bg-gradient-to-br from-amber-500 to-orange-500')
                      : 'bg-gradient-to-br from-cyan-500 to-blue-500'
                  }`}>
                    {message.type === 'bot' ? (
                      message.isWeatherContext ? (
                        <CloudRain className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
                <div className={`rounded-2xl p-4 ${
                  message.type === 'bot' 
                    ? (message.isWeatherContext
                      ? 'bg-blue-500/10 border border-blue-500/30 rounded-tl-none'
                      : message.isFallback
                      ? 'bg-yellow-500/10 border border-yellow-500/30 rounded-tl-none'
                      : 'bg-white/10 border border-white/20 rounded-tl-none')
                    : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-tr-none'
                }`}>
                  <div className="text-white whitespace-pre-line text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-400">
                      {message.timestamp}
                    </div>
                    {message.type === 'bot' && message.isFallback && (
                      <div className="text-xs text-yellow-300 flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Local Knowledge Base
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center animate-pulse">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl rounded-tl-none p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-300"></div>
                    <span className="text-sm text-gray-400 ml-2">Menganalisis pertanyaan...</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Menghubungkan ke AI Mining Assistant...
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick Questions */}
        <div className="px-4 pt-4 border-t border-white/10 bg-gray-900/30">
          <p className="text-xs text-gray-400 mb-2">💡 Pertanyaan cepat:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {quickQuestions.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(item.text)}
                disabled={loading}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white text-xs rounded-lg transition-all border border-white/10 hover:border-amber-500/30 flex items-center"
              >
                {item.icon}
                <span className="truncate max-w-[180px]">{item.text}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-gray-900/50">
          <div className="flex space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Tanyakan tentang keselamatan, operasional, atau dampak cuaca pada tambang..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none text-white placeholder-gray-400 resize-none"
              disabled={loading}
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all flex-shrink-0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              Tekan <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">Enter</kbd> untuk kirim •{' '}
              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">Shift+Enter</kbd> untuk baris baru
            </p>
            <p className="text-xs text-gray-500">
              {messages.filter(m => m.type === 'user').length} pesan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;