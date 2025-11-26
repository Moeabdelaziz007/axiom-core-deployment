'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import {
    MessageCircle, X, Send, Mic, MicOff, Volume2,
    HelpCircle, BookOpen, Zap, Globe, Brain
} from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'guide';
    timestamp: Date;
    isArabic?: boolean;
}

interface PageContext {
    page: string;
    description: string;
    actions: string[];
    helpTopics: string[];
}

const PAGE_CONTEXTS: Record<string, PageContext> = {
    '/dashboard': {
        page: 'Dashboard',
        description: 'Main control center for managing your AI agent fleet',
        actions: ['Initialize Fleet', 'Deploy Agents', 'View Analytics', 'Manage Wallet'],
        helpTopics: ['Agent Status', 'System Health', 'Performance Metrics']
    },
    '/dashboard/chat/[agent]': {
        page: 'Agent Chat',
        description: 'Interactive conversation with specialized AI agents',
        actions: ['Send Messages', 'Voice Commands', 'Tool Execution', 'Export Chat'],
        helpTopics: ['Agent Capabilities', 'Available Tools', 'Voice Commands']
    },
    '/agents': {
        page: 'Agents Directory',
        description: 'Browse and discover available AI agents',
        actions: ['Filter Agents', 'View Details', 'Compare Features', 'Deploy New'],
        helpTopics: ['Agent Types', 'Capabilities', 'Deployment Process']
    }
};

const KNOWLEDGE_BASE = {
    'what-is-axiom': {
        question: 'What is Axiom?',
        answer: {
            en: 'Axiom is a quantum-powered AI agent fleet management platform that enables businesses to deploy and manage specialized AI agents for various tasks including customer service, property management, e-commerce, and workflow optimization.',
            ar: 'أكسوم هو منصة إدارة أسطول الذكاء الاصطناعي المدعومة بالكموم تمكّن الشركات من نشر وإدارة وكلاء ذكاء اصطناعي متخصصين لمهام متنوعة تشمل خدمة العملاء وإدارة العقارات والتجارة الإلكترونية وتحسين سير العمل.'
        }
    },
    'how-to-deploy-agent': {
        question: 'How do I deploy an agent?',
        answer: {
            en: 'Navigate to the Dashboard and click "Initialize Fleet" to activate your agent management system. Then click "Deploy New Agent" to select and configure your desired agent type.',
            ar: 'انتقل إلى لوحة التحكم وانقر على "تهيئة الأسطول" لتفعيل نظام إدارة الوكلاء الخاص بك. ثم انقر على "نشر وكيل جديد" لاختيار وتكوين نوع الوكيل المطلوب.'
        }
    },
    'voice-commands': {
        question: 'What voice commands are available?',
        answer: {
            en: 'You can use voice commands like "Open chat with [agent name]", "Show system status", "Initialize fleet", "Deploy agent", and "Help me with [task]". The system supports both English and Arabic commands.',
            ar: 'يمكنك استخدام أوامر صوتية مثل "افتح الدردشة مع [اسم الوكيل]"، "أظهر حالة النظام"، "هيئ الأسطول"، "نشر وكيل"، و"ساعدني في [مهمة]". النظام يدعم الأوامر باللغتين الإنجليزية والعربية.'
        }
    }
};

export function QuantumGuide() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [currentContext, setCurrentContext] = useState<PageContext | null>(null);

    const pathname = usePathname();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Detect page context
    useEffect(() => {
        const contextKey = Object.keys(PAGE_CONTEXTS).find(key =>
            pathname.includes(key.replace('[agent]', ''))
        ) || '/dashboard';

        setCurrentContext(PAGE_CONTEXTS[contextKey]);
    }, [pathname]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Welcome message on first open
    useEffect(() => {
        if (isOpen && messages.length === 0 && currentContext) {
            const welcomeMessage: Message = {
                id: 'welcome',
                text: getBilingualResponse(
                    `🌟 Welcome to Quantum Guide! I'm here to help you navigate ${currentContext.page}.`,
                    `🌟 مرحباً بك في المرشد الكمومي! أنا هنا لمساعدتك في التنقل في ${currentContext.page}.`
                ),
                sender: 'guide',
                timestamp: new Date(),
                isArabic: false
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, currentContext]);

    const getBilingualResponse = (enText: string, arText: string): string => {
        return `${enText}\n\n${arText}`;
    };

    const detectLanguage = (text: string): 'en' | 'ar' => {
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(text) ? 'ar' : 'en';
    };

    const generateResponse = async (userMessage: string): Promise<string> => {
        const language = detectLanguage(userMessage);
        const lowerMessage = userMessage.toLowerCase();

        // Check knowledge base first
        for (const [key, entry] of Object.entries(KNOWLEDGE_BASE)) {
            if (lowerMessage.includes(entry.question.toLowerCase()) ||
                lowerMessage.includes(key.replace(/-/g, ' '))) {
                return language === 'ar' ? entry.answer.ar : entry.answer.en;
            }
        }

        // Context-aware responses
        if (currentContext) {
            if (lowerMessage.includes('help') || lowerMessage.includes('مساعدة')) {
                const helpTopics = currentContext.helpTopics.join(', ');
                return language === 'ar'
                    ? `يمكنني مساعدتك في: ${helpTopics}. ما الذي تريد معرفته؟`
                    : `I can help you with: ${helpTopics}. What would you like to know?`;
            }

            if (lowerMessage.includes('action') || lowerMessage.includes('إجراء')) {
                const actions = currentContext.actions.join(', ');
                return language === 'ar'
                    ? `الإجراءات المتاحة في هذه الصفحة: ${actions}`
                    : `Available actions on this page: ${actions}`;
            }
        }

        // Default intelligent response
        if (language === 'ar') {
            return 'أنا المرشد الكمومي الخاص بك. يمكنني الإجابة على أسئلتك حول Axiom، مساعدتك في التنقل، وتقديم إرشادات حول استخدام الوكلاء. كيف يمكنني مساعدتك اليوم؟';
        } else {
            return 'I am your Quantum Guide. I can answer questions about Axiom, help you navigate, and provide guidance on using agents. How can I assist you today?';
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
            isArabic: detectLanguage(inputText) === 'ar'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Generate response
        try {
            const responseText = await generateResponse(inputText);

            const guideMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'guide',
                timestamp: new Date(),
                isArabic: detectLanguage(responseText) === 'ar'
            };

            setTimeout(() => {
                setMessages(prev => [...prev, guideMessage]);
                setIsTyping(false);
            }, 1000);
        } catch (error) {
            console.error('Error generating response:', error);
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const toggleVoiceInput = () => {
        if (isListening) {
            setIsListening(false);
            // TODO: Stop speech recognition
        } else {
            setIsListening(true);
            // TODO: Start speech recognition
            setTimeout(() => {
                setIsListening(false);
                setInputText(prev => prev + (detectLanguage(prev) === 'ar' ? ' (صوتي)' : ' (voice input)'));
            }, 2000);
        }
    };

    const speakResponse = async (text: string) => {
        // Zero-Cost Launch: Use Browser TTS exclusively
        const language = detectLanguage(text);

        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;

            // Select a better voice if available
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice =>
                voice.lang.includes(language === 'ar' ? 'ar' : 'en') &&
                (voice.name.includes('Google') || voice.name.includes('Samantha') || voice.name.includes('Maged'))
            );

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('Text-to-speech not supported in this browser');
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-gradient-to-r from-primary to-cyan-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group"
                    title="Open Quantum Guide"
                    aria-label="Open Quantum Guide"
                >
                    <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </button>
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="fixed bottom-24 right-6 w-96 h-[600px] bg-surface border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary to-cyan-500 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <Brain className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">Quantum Guide</h3>
                                    <p className="text-white/80 text-xs">AI Assistant • Bilingual</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                                    title="Minimize"
                                    aria-label="Minimize chat"
                                >
                                    <MinimizeIcon className="w-4 h-4 text-white" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                                    title="Close"
                                    aria-label="Close chat"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Context Bar */}
                                {currentContext && (
                                    <div className="bg-white/5 border-b border-white/10 p-3">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                                            <Globe className="w-3 h-3" />
                                            <span>Current Page: {currentContext.page}</span>
                                        </div>
                                        <p className="text-xs text-gray-300">{currentContext.description}</p>
                                    </div>
                                )}

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] p-3 rounded-2xl ${message.sender === 'user'
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white/10 text-gray-200'
                                                    }`}
                                            >
                                                <p className="text-sm whitespace-pre-line">{message.text}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {message.sender === 'guide' && (
                                                        <button
                                                            onClick={() => speakResponse(message.text)}
                                                            className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                                                            title="Speak response"
                                                            aria-label="Speak response"
                                                        >
                                                            <Volume2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                    <span className="text-xs opacity-60">
                                                        {message.timestamp.toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/10 p-3 rounded-2xl">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Quick Actions */}
                                <div className="p-3 border-t border-white/10">
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            onClick={() => setInputText('What is Axiom?')}
                                            className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 hover:bg-white/10 transition-colors"
                                            title="Ask about Axiom"
                                            aria-label="Ask about Axiom"
                                        >
                                            <HelpCircle className="w-3 h-3 inline mr-1" />
                                            About
                                        </button>
                                        <button
                                            onClick={() => setInputText('How do I deploy an agent?')}
                                            className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 hover:bg-white/10 transition-colors"
                                            title="Ask about agent deployment"
                                            aria-label="Ask about agent deployment"
                                        >
                                            <Zap className="w-3 h-3 inline mr-1" />
                                            Deploy
                                        </button>
                                        <button
                                            onClick={() => setInputText('Help with this page')}
                                            className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 hover:bg-white/10 transition-colors"
                                            title="Get help with current page"
                                            aria-label="Get help with current page"
                                        >
                                            <BookOpen className="w-3 h-3 inline mr-1" />
                                            Help
                                        </button>
                                    </div>

                                    {/* Input */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder={detectLanguage(inputText) === 'ar' ? 'اكتب سؤالك...' : 'Type your question...'}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                        <button
                                            onClick={toggleVoiceInput}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isListening
                                                ? 'bg-red-500 hover:bg-red-600'
                                                : 'bg-white/10 hover:bg-white/20'
                                                }`}
                                            title={isListening ? "Stop voice input" : "Start voice input"}
                                            aria-label={isListening ? "Stop voice input" : "Start voice input"}
                                        >
                                            {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
                                        </button>
                                        <button
                                            onClick={sendMessage}
                                            disabled={!inputText.trim()}
                                            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Send message"
                                            aria-label="Send message"
                                        >
                                            <Send className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Helper component for minimize icon
const MinimizeIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
);