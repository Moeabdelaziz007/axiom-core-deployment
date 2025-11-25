'use client';

import React, { useState } from 'react';
import { Send, X, Bot, MessageSquare } from 'lucide-react';
import { NeonButton } from './AxiomUI';

interface AgentChatProps {
    agentId: string;
    agentName: string;
    agentType: string;
    onClose: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    tool_calls?: any[];
}

export const AgentChat = ({ agentId, agentName, agentType, onClose }: AgentChatProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/agent/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    agentId,
                    agentType
                })
            });

            const data = await response.json();

            if (data.reply || data.tool_calls) {
                const assistantMessage: Message = {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: data.reply || 'Processing your request...',
                    timestamp: new Date(),
                    tool_calls: data.tool_calls
                };

                setMessages(prev => [...prev, assistantMessage]);
            }
        } catch (error) {
            console.error('❌ Chat Error:', error);
            const errorMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMessage();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{agentName}</h3>
                            <p className="text-sm text-gray-400">{agentType}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${message.role === 'user'
                                        ? 'bg-primary text-white'
                                        : 'bg-white/10 border border-white/20 text-white'
                                    }`}
                            >
                                {message.role === 'assistant' && message.tool_calls && message.tool_calls.length > 0 && (
                                    <div className="mb-2 p-2 bg-primary/10 border border-primary/30 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MessageSquare className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-mono text-primary">Tools Used</span>
                                        </div>
                                        {message.tool_calls.map((tool, toolIndex) => (
                                            <div key={toolIndex} className="text-xs text-gray-300 mb-1">
                                                <div className="font-mono text-primary">{tool.tool}:</div>
                                                <div className="bg-black/50 p-2 rounded border border-white/10">
                                                    <pre className="text-xs text-gray-300 overflow-x-auto">
                                                        {JSON.stringify(tool.result || tool.execution_time, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-sm leading-relaxed">{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                    <span className="text-sm text-gray-400">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="border-t border-white/10 pt-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Ask ${agentName} something...`}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                            disabled={isLoading}
                        />
                        <NeonButton
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isLoading}
                            className="px-6"
                        >
                            <Send className="w-4 h-4" />
                        </NeonButton>
                    </div>
                </div>
            </div>
        </div>
    );
};