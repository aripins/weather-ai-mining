import { Bot, Send, Sparkles, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { quickResponses, sendToChatbot } from '../utils/chatbot-api';

const Chatbot = ({ isOpen, onClose, weatherData }) => {
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      content: 'Halo! Saya **Mining Safety & Operation Assistant** 🤖\n\nSaya bisa membantu Anda dengan:\n• Keselamatan kerja tambang (K3)\n• Operasional tambang (hauling, loading, blasting)\n• Dampak cuaca terhadap aktivitas tambang\n• Rekomendasi mitigasi risiko\n\nSilakan bertanya apa saja!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const quickQuestions = [
    'Bagaimana cuaca mempengaruhi operasi tambang?',
    'Apa saja standar keselamatan di area tambang?',
    'Bagaimana jika terjadi hujan deras di lokasi tambang?',
    'Apa yang harus dilakukan saat suhu sangat tinggi?',
  ];
  
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Kirim ke chatbot ML di Railway
      const botResponse = await sendToChatbot(input);
      setMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Fallback ke quick responses
      const lowerInput = input.toLowerCase();
      let fallbackResponse = "Maaf, saya sedang tidak bisa terhubung ke server. Coba lagi nanti.";
      
      // Cek keyword untuk fallback
      for (const [keyword, response] of Object.entries(quickResponses)) {
        if (lowerInput.includes(keyword)) {
          fallbackResponse = response;
          break;
        }
      }
      
      setMessages(prev => [...prev, { type: 'bot', content: fallbackResponse }]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuickQuestion = (question) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl h-[80vh] bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-white/20 shadow-2xl flex flex-col m-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 p-6 rounded-t-3xl border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Mining Safety Assistant</h3>
                <p className="text-sm text-amber-300 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Powered by GIYU Dataset & AI
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-900/50 to-gray-800/50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex mb-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'bot' 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                      : 'bg-gradient-to-br from-cyan-500 to-blue-500'
                  }`}>
                    {message.type === 'bot' ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
                <div className={`rounded-2xl p-4 ${
                  message.type === 'bot' 
                    ? 'bg-white/10 border border-white/20 rounded-tl-none' 
                    : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-tr-none'
                }`}>
                  <div className="text-white whitespace-pre-line">{message.content}</div>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl rounded-tl-none p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-150"></div>
                    <span className="text-sm text-gray-400 ml-2">AI sedang berpikir...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick Questions */}
        <div className="px-4 pt-4 border-t border-white/10">
          <div className="flex flex-wrap gap-2 mb-4">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs rounded-full transition-all border border-white/10 hover:border-amber-500/30"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-gray-900/50">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tanyakan tentang keselamatan, operasional, atau cuaca tambang..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none text-white placeholder-gray-400"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white p-3 rounded-xl transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;