'use client';

import React, { useEffect, useState, useRef } from 'react';
import { messageBus, AgentMessage } from '../core/communication/AgentMessageBus';
import { MessageSquare, Hash, Shield, Activity, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentChatInterface() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load history
    setMessages(messageBus.getHistory());

    // Subscribe to new messages
    const unsubscribe = messageBus.subscribe((msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getChannelIcon = (channel: AgentMessage['channel']) => {
    switch (channel) {
      case 'MARKET': return <DollarSign className="w-3 h-3 text-green-400" />;
      case 'SECURITY': return <Shield className="w-3 h-3 text-red-400" />;
      case 'OPS': return <Activity className="w-3 h-3 text-blue-400" />;
      default: return <Hash className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-md border border-purple-900/30 rounded-xl p-4 h-[300px] flex flex-col">
      <div className="flex items-center gap-2 text-purple-400 font-bold border-b border-purple-900/30 pb-2 mb-2">
        <MessageSquare className="w-4 h-4" />
        NEURAL LINK CHAT
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/30 rounded-lg p-2 border border-white/5"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-400">{msg.senderId}</span>
                  <div className="flex items-center gap-1 bg-white/5 px-1.5 rounded text-[10px] text-gray-400">
                    {getChannelIcon(msg.channel)}
                    {msg.channel}
                  </div>
                </div>
                <span className="text-[10px] text-gray-600">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className={`text-sm font-mono ${
                msg.priority === 'CRITICAL' ? 'text-red-400 animate-pulse' :
                msg.priority === 'HIGH' ? 'text-orange-300' :
                'text-gray-300'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
