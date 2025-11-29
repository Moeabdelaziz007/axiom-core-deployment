import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Mic, Image as ImageIcon, Search } from 'lucide-react';
import { getGeminiChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

export const NeuralTerminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: 'AXIOM QCC v1.0 ONLINE. AWAITING COMMAND.', timestamp: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare history for API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await getGeminiChatResponse(history, input);
    
    const botMsg: ChatMessage = { 
      id: (Date.now() + 1).toString(), 
      role: 'model', 
      text: responseText, 
      timestamp: Date.now() 
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 backdrop-blur-md border border-gray-700/50 cyber-border relative overflow-hidden group">
      {/* Header */}
      <div className="p-3 border-b border-gray-700/50 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-2 text-neon">
          <Terminal size={16} />
          <span className="font-display text-xs tracking-widest">NEURAL TERMINAL</span>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-neon animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-gray-600"></div>
          <div className="w-2 h-2 rounded-full bg-gray-600"></div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-sm border ${
              msg.role === 'user' 
                ? 'bg-cyan-900/20 border-cyan-500/30 text-cyan-50' 
                : 'bg-gray-800/40 border-gray-600/30 text-gray-300'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              <div className="text-[10px] opacity-40 mt-1 uppercase text-right">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-gray-800/40 border border-gray-600/30 p-3 rounded-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neon animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-neon animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-neon animate-bounce delay-200"></span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/60 border-t border-gray-700/50">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="EXECUTE COMMAND..."
            className="w-full bg-gray-900/50 border border-gray-600 text-neon placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-neon transition-colors font-sans"
          />
          <button className="p-2 text-gray-500 hover:text-neon transition-colors">
            <Mic size={18} />
          </button>
           <button className="p-2 text-gray-500 hover:text-neon transition-colors">
            <ImageIcon size={18} />
          </button>
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-neon/10 hover:bg-neon/20 border border-neon/50 text-neon p-2 transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      
      {/* Decorative scanline */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>
    </div>
  );
};
