'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  Send,
  Bot,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Globe,
  Shield,
  Clock
} from 'lucide-react';
import { useTranslation } from '@/lib/translations';
import { Language } from '@/types/reset';
import { QuantumCryptoService } from '@/services/quantum-crypto-service';

interface TelegramMiniAppProps {
  language?: Language;
  onAgentTaskUpdate?: (taskId: string, status: string) => void;
}

interface TelegramMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

interface FieldTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgent?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: Date;
  updatedAt: Date;
  quantumVerified?: boolean;
}

export const TelegramMiniApp: React.FC<TelegramMiniAppProps> = ({
  language = 'en',
  onAgentTaskUpdate
}) => {
  const { t } = useTranslation(language);
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [tasks, setTasks] = useState<FieldTask[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [quantumMode, setQuantumMode] = useState(false);

  // Initialize quantum crypto service
  const quantumCrypto = QuantumCryptoService.getInstance();

  useEffect(() => {
    // Simulate initial data load
    const initialTasks: FieldTask[] = [
      {
        id: '1',
        title: t('telegram.tasks.verifyLocation'),
        description: t('telegram.tasks.verifyLocationDesc'),
        status: 'pending',
        priority: 'high',
        location: { lat: 24.7136, lng: 46.6753, address: 'Riyadh, Saudi Arabia' },
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        title: t('telegram.tasks.collectData'),
        description: t('telegram.tasks.collectDataDesc'),
        status: 'in_progress',
        priority: 'medium',
        assignedAgent: 'Agent-Alpha',
        createdAt: new Date(Date.now() - 7200000),
        updatedAt: new Date(Date.now() - 1800000)
      },
      {
        id: '3',
        title: t('telegram.tasks.deliverPackage'),
        description: t('telegram.tasks.deliverPackageDesc'),
        status: 'completed',
        priority: 'low',
        location: { lat: 24.7236, lng: 46.6753, address: 'Riyadh, KSA' },
        createdAt: new Date(Date.now() - 10800000),
        updatedAt: new Date(Date.now() - 3600000),
        quantumVerified: true
      }
    ];

    setTasks(initialTasks);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location access denied:', error);
        }
      );
    }

    // Initialize quantum crypto
    quantumCrypto.initializeQuantumKeys(768).then(result => {
      if (result.success) {
        console.log('🔐 Quantum crypto initialized for Telegram Mini App');
        setQuantumMode(true);
      }
    });
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: TelegramMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
      location: currentLocation || undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate agent response
    setTimeout(() => {
      const agentResponse = await generateAgentResponse(inputText);
      const responseMessage: TelegramMessage = {
        id: (Date.now() + 1).toString(),
        text: agentResponse.text,
        sender: 'agent',
        timestamp: new Date(),
        status: 'delivered',
        location: agentResponse.location
      };

      setMessages(prev => [...prev, responseMessage]);

      if (onAgentTaskUpdate && agentResponse.taskId) {
        onAgentTaskUpdate(agentResponse.taskId, 'completed');
      }
    }, 1500);
  };

  const generateAgentResponse = async (userMessage: string): Promise<{
    text: string;
    taskId?: string;
    location?: { lat: number; lng: number; address: string };
  }> => {
    // Simulate AI agent response based on message content
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('location') || lowerMessage.includes('where')) {
      return {
        text: `📍 ${t('telegram.agent.locationResponse')}: ${currentLocation?.lat || 24.7136}, ${currentLocation?.lng || 46.6753}`,
        location: currentLocation || undefined
      };
    }

    if (lowerMessage.includes('task') || lowerMessage.includes('status')) {
      const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
      return {
        text: `📋 ${t('telegram.agent.taskStatus')}: ${pendingTasks.length} ${t('telegram.agent.pendingTasks')}`,
        taskId: pendingTasks[0]?.id
      };
    }

    if (lowerMessage.includes('quantum') || lowerMessage.includes('secure')) {
      if (quantumMode) {
        return {
          text: `🔐 ${t('telegram.agent.quantumStatus')}: ${t('telegram.agent.quantumActive')}`,
          taskId: 'quantum-verify'
        };
      } else {
        return {
          text: `⚠️ ${t('telegram.agent.quantumStatus')}: ${t('telegram.agent.quantumInactive')}`
        };
      }
    }

    if (lowerMessage.includes('verify') || lowerMessage.includes('complete')) {
      return {
        text: `✅ ${t('telegram.agent.verifyTask')}: ${t('telegram.agent.taskVerified')}`,
        taskId: tasks.find(t => t.status === 'pending')?.id
      };
    }

    return {
      text: `🤖 ${t('telegram.agent.defaultResponse')}: ${t('telegram.agent.readyToHelp')}`
    };
  };

  const handleTaskAction = (taskId: string, action: 'start' | 'complete' | 'verify') => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task };

        switch (action) {
          case 'start':
            updatedTask.status = 'in_progress';
            updatedTask.updatedAt = new Date();
            break;
          case 'complete':
            updatedTask.status = 'completed';
            updatedTask.updatedAt = new Date();
            updatedTask.quantumVerified = quantumMode;
            break;
          case 'verify':
            updatedTask.status = 'verified';
            updatedTask.updatedAt = new Date();
            updatedTask.quantumVerified = true;
            break;
        }

        return updatedTask;
      }
      return task;
    }));
  };

  const handleQuantumToggle = async () => {
    if (!quantumMode) {
      const result = await quantumCrypto.initializeQuantumKeys(768);
      if (result.success) {
        setQuantumMode(true);
        console.log('🔐 Quantum mode activated');
      }
    } else {
      console.error('Failed to activate quantum mode');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white">
      {/* Telegram Header */}
      <div className="bg-blue-600 border-b border-blue-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="w-6 h-6 text-white" />
            <span className="text-white font-semibold">Axiom RESET Field Agent</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-white text-sm ml-2">
                {isConnected ? t('telegram.status.connected') : t('telegram.status.disconnected')}
              </span>
            </div>

            <Button
              onClick={handleQuantumToggle}
              size="sm"
              variant={quantumMode ? "default" : "outline"}
              className="ml-4"
            >
              <Shield className="w-4 h-4 mr-2" />
              {quantumMode ? t('telegram.quantum.on') : t('telegram.quantum.off')}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-screen">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-white border border-gray-700'
                }`}>
                <div className="flex items-center space-x-2 mb-1">
                  {message.sender === 'agent' && <Bot className="w-4 h-4 text-blue-400" />}
                  {message.sender === 'user' && <Users className="w-4 h-4 text-green-400" />}
                  <span className="text-xs text-gray-400">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-sm whitespace-pre-wrap">{message.text}</p>

                {message.location && (
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <div className="flex items-center text-xs text-gray-400">
                      <MapPin className="w-3 h-3 mr-1" />
                      {message.location.address}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tasks Panel */}
        <div className="w-full lg:w-96 bg-gray-800 border-l border-gray-700 p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
            {t('telegram.tasks.title')}
          </h3>

          <div className="space-y-3">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-700 rounded-lg p-3 border border-gray-600"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm">{task.title}</h4>
                    <p className="text-gray-300 text-xs mt-1">{task.description}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${task.status === 'completed' ? 'bg-green-600 text-white' :
                        task.status === 'in_progress' ? 'bg-yellow-600 text-white' :
                          task.status === 'verified' ? 'bg-blue-600 text-white' :
                            'bg-gray-600 text-gray-200'
                      }`}>
                      {task.status === 'pending' && t('telegram.tasks.status.pending')}
                      {task.status === 'in_progress' && t('telegram.tasks.status.inProgress')}
                      {task.status === 'completed' && t('telegram.tasks.status.completed')}
                      {task.status === 'verified' && t('telegram.tasks.status.verified')}
                    </span>

                    {task.quantumVerified && (
                      <Shield className="w-4 h-4 text-purple-400" title="Quantum Verified" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(task.updatedAt).toLocaleString()}
                  </div>

                  <div className="flex space-x-1">
                    {task.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleTaskAction(task.id, 'start')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {t('telegram.tasks.start')}
                      </Button>
                    )}

                    {task.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => handleTaskAction(task.id, 'complete')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {t('telegram.tasks.complete')}
                      </Button>
                    )}

                    {task.status === 'completed' && !task.quantumVerified && (
                      <Button
                        size="sm"
                        onClick={() => handleTaskAction(task.id, 'verify')}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {t('telegram.tasks.verify')}
                      </Button>
                    )}
                  </div>
                </div>

                {task.location && (
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <div className="flex items-center text-xs text-gray-400">
                      <MapPin className="w-3 h-3 mr-1" />
                      {task.location.address}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSendMessage();
              }
            }}
            placeholder={t('telegram.input.placeholder')}
            className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <Button
            onClick={handleSendMessage}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};