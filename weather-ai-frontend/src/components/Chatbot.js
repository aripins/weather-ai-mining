import { Bot, Send, Sparkles, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { sendToChatbot } from '../utils/chatbot-api';

const Chatbot = ({ isOpen, onClose, weatherData }) => {
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      content: 'Halo! Saya Mining Safety Assistant 🤖\n\nTanyakan tentang keselamatan tambang, operasional, atau dampak cuaca.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Check API connection when chatbot opens
  useEffect(() => {
    const checkAPIConnection = async () => {
      if (isOpen) {
        console.log('🔍 Memeriksa koneksi API...');
        setConnectionStatus('Checking connection...');
        
        try {
          // Simple test request
          const testResponse = await fetch('https://chatbot-rain-production.up.railway.app/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'ping' })
          });
          
          if (testResponse.ok) {
            setConnectionStatus('Connected ✓');
            console.log('✅ API Connected');
          } else {
            setConnectionStatus('Connected (with issues)');
            console.warn('⚠️ API responded but with status:', testResponse.status);
          }
        } catch (error) {
          setConnectionStatus('Connection failed');
          console.error('❌ API Connection failed:', error.message);
        }
      }
    };
    
    if (isOpen) {
      checkAPIConnection();
    }
  }, [isOpen]);
  
  // Quick questions
  const quickQuestions = [
    'Bagaimana cuaca mempengaruhi operasi tambang?',
    'Apa protokol keselamatan alat berat?',
    'Bagaimana jika hujan deras?',
    'Apa yang harus dilakukan saat suhu >35°C?',
  ];
  
  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userInput = input; // Save before resetting
    
    const userMessage = { 
      type: 'user', 
      content: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      console.log('📤 Mengirim:', userInput);
      
      // Call API
      const botResponse = await sendToChatbot(userInput);
      
      console.log('✅ Dapat response:', botResponse.substring(0, 100));
      
      const botMessage = { 
        type: 'bot', 
        content: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('❌ Error:', error);
      
      const botMessage = { 
        type: 'bot', 
        content: `Error: ${error.message}\n\nCoba lagi atau refresh halaman.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMessage]);
      
    } finally {
      setLoading(false);
    }
  };
  
  // Handle quick question
  const handleQuickQuestion = (question) => {
    setInput(question);
    // Small delay to ensure state is updated
    setTimeout(() => handleSend(), 50);
  };
  
  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Clear chat
  const clearChat = () => {
    setMessages([
      { 
        type: 'bot', 
        content: 'Halo! Saya Mining Safety Assistant 🤖\n\nTanyakan tentang keselamatan tambang, operasional, atau dampak cuaca.'
      }
    ]);
  };
  
  // Don't render if not open
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
                <p className="text-sm text-amber-300 flex items-center mt-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {connectionStatus}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={clearChat}
                className="px-3 py-1.5 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 text-xs rounded-lg border border-gray-500/30 transition-all"
              >
                Clear Chat
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close chatbot"
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
                  <div className="text-white whitespace-pre-line text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {message.timestamp}
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
                    <span className="text-sm text-gray-400 ml-2">Memproses...</span>
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
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                disabled={loading}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-gray-300 hover:text-white text-xs rounded-lg transition-all border border-white/10"
              >
                {question}
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
              placeholder="Tanyakan tentang tambang..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none text-white placeholder-gray-400 resize-none"
              disabled={loading}
              rows={1}
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white p-3 rounded-xl transition-all flex-shrink-0"
              aria-label="Send message"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;