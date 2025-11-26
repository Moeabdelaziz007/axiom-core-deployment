/**
 * 🕸️ THE SWARM NETWORK - Real-time Collaboration Visualization
 * 
 * Interactive network graph showing agent collaborations in real-time
 * Visualizes nodes (agents) and edges (collaborations) with animations
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Activity,
  Zap,
  TrendingUp,
  Clock,
  Shield,
  Brain,
  GitBranch,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface NetworkNode {
  id: string;
  name: string;
  type: 'tajer' | 'aqar' | 'mawid' | 'sofra';
  x: number;
  y: number;
  reputation: number;
  status: 'active' | 'idle' | 'busy' | 'offline';
  capabilities: string[];
  activeConnections: number;
  knowledgeShared: number;
  tasksCompleted: number;
}

interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  strength: number; // 0-100 based on collaboration frequency
  type: 'active_collaboration' | 'knowledge_sharing' | 'task_delegation';
  lastActivity: number;
  messageCount: number;
}

interface CollaborationMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  type: 'CONSULTATION' | 'TASK_DELEGATION' | 'DATA_REQUEST' | 'VOTE';
  timestamp: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface SwarmMetrics {
  activeAgents: number;
  activeCollaborations: number;
  messagesPerMinute: number;
  averageResponseTime: number;
  knowledgeSharingRate: number;
  collaborationEfficiency: number;
}

// ============================================================================
// AGENT CONFIGURATION
// ============================================================================

const AGENT_CONFIG = {
  tajer: {
    name: 'Tajer',
    color: '#8B5CF6',
    icon: '🤝',
    capabilities: ['negotiation', 'deal_analysis', 'business_coordination']
  },
  aqar: {
    name: 'Aqar',
    color: '#06B6D4',
    icon: '🏢',
    capabilities: ['property_valuation', 'market_analysis', 'real_estate_expertise']
  },
  mawid: {
    name: 'Mawid',
    color: '#10B981',
    icon: '📅',
    capabilities: ['appointment_scheduling', 'resource_optimization', 'time_management']
  },
  sofra: {
    name: 'Sofra',
    color: '#F59E0B',
    icon: '🍽',
    capabilities: ['customer_experience', 'quality_audit', 'service_optimization']
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SwarmNetwork: React.FC = () => {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [edges, setEdges] = useState<NetworkEdge[]>([]);
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SwarmMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [animatingMessage, setAnimatingMessage] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize network with default agents
  useEffect(() => {
    const initialNodes: NetworkNode[] = [
      {
        id: 'tajer',
        name: 'Tajer Agent',
        type: 'tajer',
        x: 150,
        y: 200,
        reputation: 85,
        status: 'active',
        capabilities: AGENT_CONFIG.tajer.capabilities,
        activeConnections: 2,
        knowledgeShared: 45,
        tasksCompleted: 127
      },
      {
        id: 'aqar',
        name: 'Aqar Agent',
        type: 'aqar',
        x: 400,
        y: 150,
        reputation: 92,
        status: 'active',
        capabilities: AGENT_CONFIG.aqar.capabilities,
        activeConnections: 3,
        knowledgeShared: 78,
        tasksCompleted: 89
      },
      {
        id: 'mawid',
        name: 'Mawid Agent',
        type: 'mawid',
        x: 650,
        y: 250,
        reputation: 78,
        status: 'busy',
        capabilities: AGENT_CONFIG.mawid.capabilities,
        activeConnections: 1,
        knowledgeShared: 32,
        tasksCompleted: 156
      },
      {
        id: 'sofra',
        name: 'Sofra Agent',
        type: 'sofra',
        x: 300,
        y: 400,
        reputation: 88,
        status: 'active',
        capabilities: AGENT_CONFIG.sofra.capabilities,
        activeConnections: 2,
        knowledgeShared: 56,
        tasksCompleted: 203
      }
    ];

    const initialEdges: NetworkEdge[] = [
      {
        id: 'edge-1',
        source: 'tajer',
        target: 'aqar',
        strength: 85,
        type: 'active_collaboration',
        lastActivity: Date.now() - 300000,
        messageCount: 24
      },
      {
        id: 'edge-2',
        source: 'tajer',
        target: 'mawid',
        strength: 65,
        type: 'task_delegation',
        lastActivity: Date.now() - 180000,
        messageCount: 15
      },
      {
        id: 'edge-3',
        source: 'aqar',
        target: 'sofra',
        strength: 72,
        type: 'knowledge_sharing',
        lastActivity: Date.now() - 120000,
        messageCount: 18
      },
      {
        id: 'edge-4',
        source: 'mawid',
        target: 'sofra',
        strength: 58,
        type: 'active_collaboration',
        lastActivity: Date.now() - 90000,
        messageCount: 12
      }
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
    setMetrics({
      activeAgents: 4,
      activeCollaborations: 4,
      messagesPerMinute: 3.2,
      averageResponseTime: 145,
      knowledgeSharingRate: 78,
      collaborationEfficiency: 89
    });
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // WebSocket connection with environment variable fallback
        const wsUrl = process.env.NEXT_PUBLIC_COLLAB_HUB_WS || 'wss://collaboration-hub-production.amrikyy.workers.dev/connect';
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          console.log('🔌 Connected to Collaboration Hub');
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'NETWORK_UPDATE':
              setNodes(data.nodes);
              setEdges(data.edges);
              break;
            case 'NEW_MESSAGE':
              setMessages(prev => [data.message, ...prev.slice(0, 49)]);
              animateMessage(data.message.from, data.message.to);
              break;
            case 'NODE_UPDATE':
              setNodes(prev => prev.map(node => 
                node.id === data.nodeId ? { ...node, ...data.updates } : node
              ));
              break;
            case 'EDGE_UPDATE':
              setEdges(prev => prev.map(edge => 
                edge.id === data.edgeId ? { ...edge, ...data.updates } : edge
              ));
              break;
            case 'METRICS_UPDATE':
              setMetrics(data.metrics);
              break;
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.log('🔌 Disconnected from Collaboration Hub');
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Failed to connect to Collaboration Hub:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Animate message traveling between agents
  const animateMessage = useCallback((from: string, to: string) => {
    setAnimatingMessage(`${from}-${to}`);
    setTimeout(() => setAnimatingMessage(null), 2000);
  }, []);

  // Handle node selection
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
  }, [selectedNode]);

  // Get node color based on agent type
  const getNodeColor = (type: string) => {
    return AGENT_CONFIG[type as keyof typeof AGENT_CONFIG]?.color || '#6B7280';
  };

  // Get edge color based on strength and type
  const getEdgeColor = (strength: number, type: string) => {
    const opacity = strength / 100;
    const baseColors = {
      active_collaboration: `rgba(34, 197, 94, ${opacity})`, // green
      knowledge_sharing: `rgba(59, 130, 246, ${opacity})`, // blue
      task_delegation: `rgba(168, 85, 247, ${opacity})` // purple
    };
    return baseColors[type as keyof typeof baseColors] || `rgba(107, 114, 128, ${opacity})`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
          🕸️ Swarm Network Visualization
        </h1>
        <p className="text-gray-400">Real-time agent collaboration network</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Network Visualization */}
        <div className="col-span-9 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden relative">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
              isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Metrics */}
            {metrics && (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>{metrics.activeAgents} agents</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  <span>{metrics.activeCollaborations} collabs</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-green-400" />
                  <span>{metrics.messagesPerMinute}/min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-orange-400" />
                  <span>{metrics.averageResponseTime}ms</span>
                </div>
              </div>
            )}
          </div>

          {/* SVG Network */}
          <div 
            ref={canvasRef}
            className="w-full h-full relative"
            style={{ minHeight: '600px' }}
          >
            <svg className="w-full h-full">
              {/* Define gradients */}
              <defs>
                <radialGradient id="node-gradient-tajer">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
                </radialGradient>
                <radialGradient id="node-gradient-aqar">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.2" />
                </radialGradient>
                <radialGradient id="node-gradient-mawid">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
                </radialGradient>
                <radialGradient id="node-gradient-sofra">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.2" />
                </radialGradient>
              </defs>

              {/* Render edges */}
              {edges.map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                
                if (!sourceNode || !targetNode) return null;

                return (
                  <g key={edge.id}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={getEdgeColor(edge.strength, edge.type)}
                      strokeWidth={Math.max(1, edge.strength / 25)}
                      strokeOpacity={0.6}
                      strokeDasharray={edge.type === 'knowledge_sharing' ? '5,5' : '0'}
                    />
                    
                    {/* Animated message pulse */}
                    {animatingMessage === `${edge.source}-${edge.target}` && (
                      <circle r="8" fill="#FFD700" opacity="0.8">
                        <animateMotion
                          dur="2s"
                          repeatCount="1"
                          path={`M${sourceNode.x},${sourceNode.y} L${targetNode.x},${targetNode.y}`}
                        />
                      </circle>
                    </circle>
                    )}
                  </g>
                );
              })}

              {/* Render nodes */}
              {nodes.map(node => (
                <g key={node.id}>
                  {/* Node circle */}
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={20 + node.reputation / 10}
                    fill={`url(#node-gradient-${node.type})`}
                    stroke={getNodeColor(node.type)}
                    strokeWidth="2"
                    opacity={node.status === 'offline' ? 0.4 : 1}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onTap={() => handleNodeClick(node.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Agent icon */}
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="20"
                    fill="white"
                    pointerEvents="none"
                    style={{ userSelect: 'none' }}
                  >
                    {AGENT_CONFIG[node.type as keyof typeof AGENT_CONFIG]?.icon}
                  </text>
                  
                  {/* Status indicator */}
                  <circle
                    cx={node.x + 15}
                    cy={node.y - 15}
                    r="5"
                    fill={
                      node.status === 'active' ? '#10B981' :
                      node.status === 'busy' ? '#F59E0B' :
                      node.status === 'idle' ? '#6B7280' : '#EF4444'
                    }
                    opacity="0.9"
                  />
                  
                  {/* Reputation indicator */}
                  <text
                    x={node.x}
                    y={node.y + 35}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#9CA3AF"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {node.reputation}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Side Panel */}
        <div className="col-span-3 space-y-4">
          {/* Selected Node Details */}
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
            >
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>{AGENT_CONFIG[nodes.find(n => n.id === selectedNode)?.type as keyof typeof AGENT_CONFIG]?.icon}</span>
                {nodes.find(n => n.id === selectedNode)?.name}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-400">Status</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      nodes.find(n => n.id === selectedNode)?.status === 'active' ? 'bg-green-400' :
                      nodes.find(n => n.id === selectedNode)?.status === 'busy' ? 'bg-yellow-400' :
                      'bg-gray-400'
                    }`} />
                    <span className="text-sm capitalize">
                      {nodes.find(n => n.id === selectedNode)?.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Reputation</div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-blue-400">
                      {nodes.find(n => n.id === selectedNode)?.reputation}
                    </div>
                    <div className="text-xs text-gray-500">/100</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Capabilities</div>
                  <div className="flex flex-wrap gap-1">
                    {nodes.find(n => n.id === selectedNode)?.capabilities.map(cap => (
                      <span key={cap} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Active Connections</div>
                  <div className="text-lg font-semibold text-purple-400">
                    {nodes.find(n => n.id === selectedNode)?.activeConnections}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Tasks Completed</div>
                  <div className="text-lg font-semibold text-green-400">
                    {nodes.find(n => n.id === selectedNode)?.tasksCompleted}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recent Messages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-400" />
              Recent Messages
            </h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {messages.slice(0, 10).map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-gray-900/50 rounded-lg p-3 border border-gray-700"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        message.from === 'tajer' ? 'bg-purple-600' :
                        message.from === 'aqar' ? 'bg-blue-600' :
                        message.from === 'mawid' ? 'bg-green-600' :
                        'bg-orange-600'
                      }`}>
                        {message.from.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-400">
                            {AGENT_CONFIG[message.from as keyof typeof AGENT_CONFIG]?.icon} {message.from}
                          </span>
                          <span className="text-xs text-gray-500">→</span>
                          <span className="text-xs text-gray-400">
                            {AGENT_CONFIG[message.to as keyof typeof AGENT_CONFIG]?.icon} {message.to}
                          </span>
                          <span className={`ml-auto px-2 py-1 rounded text-xs ${
                            message.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                            message.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                            message.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {message.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-200">
                          {message.content}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Quick Actions
            </h3>
            
            <div className="space-y-2">
              <button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 px-3 rounded-lg text-sm transition-colors flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Create Collaboration
              </button>
              <button className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 py-2 px-3 rounded-lg text-sm transition-colors flex items-center gap-2">
                <Users className="w-4 h-4" />
                Form Team
              </button>
              <button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 px-3 rounded-lg text-sm transition-colors flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Share Knowledge
              </button>
              <button className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 py-2 px-3 rounded-lg text-sm transition-colors flex items-center gap-2">
                <Target className="w-4 h-4" />
                Delegate Task
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SwarmNetwork;