'use client';

import React, { useEffect, useState, useRef } from 'react';
import { wsClient } from '../services/WebSocketClient';
import { Terminal } from 'lucide-react';

export default function StreamingResponseHandler() {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = wsClient.subscribe((event) => {
      if (event.type === 'LLM_TOKEN') {
        setText(prev => prev + event.payload.token);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [text]);

  return (
    <div className="bg-black/80 border border-green-900/50 rounded-lg p-4 font-mono text-sm h-48 overflow-y-auto custom-scrollbar shadow-[0_0_15px_rgba(0,255,0,0.1)]">
      <div className="flex items-center gap-2 text-green-500 mb-2 border-b border-green-900/30 pb-1">
        <Terminal className="w-3 h-3" />
        <span>SYSTEM_STREAM</span>
      </div>
      <div className="text-green-400/90 whitespace-pre-wrap leading-relaxed">
        {text}
        <span className="animate-pulse inline-block w-2 h-4 bg-green-500 ml-1 align-middle"></span>
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
