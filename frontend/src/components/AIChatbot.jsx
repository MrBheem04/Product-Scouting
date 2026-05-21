import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export default function AIChatbot({ productContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hi there! I am your ScoutPrice AI assistant. Ask me anything about price patterns, product value, or coupon structures!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await axios.post('/api/ai/chat', {
        message: userText,
        productId: productContext?._id || undefined
      });
      
      setMessages((prev) => [...prev, { sender: 'bot', text: response.data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "I am having trouble connecting to the network helper. Local index suggests checking back shortly!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[99] font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-purple-blue text-white font-bold rounded-full shadow-neon-glow hover:scale-105 transition-all duration-300 animate-float"
        >
          <Sparkles className="w-5 h-5 fill-white/20" />
          <span>Ask AI Assistant</span>
        </button>
      )}

      {/* Slide-out Panel */}
      {isOpen && (
        <div className="flex flex-col w-[350px] sm:w-[380px] h-[500px] rounded-2xl glass-panel bg-slate-900 border border-brand-500/20 shadow-glass-dark overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-white/5">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-brand-500/20 text-brand-400 rounded-lg">
                <Bot className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1">
                  ScoutPrice AI
                  <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold text-brand-400 bg-brand-400/10 rounded">Smart</span>
                </h4>
                <span className="text-[10px] text-slate-400">Online & ready</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Context box if product details are open */}
          {productContext && (
            <div className="flex items-center gap-2 p-2.5 bg-brand-500/5 border-b border-brand-500/10">
              <AlertTriangle className="w-4 h-4 text-brand-400 shrink-0" />
              <p className="text-[10px] text-slate-300 line-clamp-1">
                Context locked on: <strong>{productContext.title}</strong>
              </p>
            </div>
          )}

          {/* Messages stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-400 border border-white/5 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={scrollRef}></div>
          </div>

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me: 'Is this a good price?'"
              className="flex-1 px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-gradient-purple-blue text-white rounded-xl shadow-neon-glow hover:opacity-90 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
