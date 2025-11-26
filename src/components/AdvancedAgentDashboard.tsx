/**
 * 🦅 Advanced Agent Dashboard
 * 
 * A comprehensive real-time monitoring and management interface for agent superpowers
 * with performance analytics, collaboration visualization, and security monitoring.
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Battery,
  Brain,
  Cpu,
  Database,
  Globe,
  Lock,
  Monitor,
  Network,
  RefreshCw,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
  Clock,
  Filter,
  Settings,
  Bell,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Download,
  Upload,
  Package,
  DollarSign,
  Star,
  MessageSquare,
  GitBranch,
  Target,
  Award,
  Flame,
  Cloud,
  Server,
  Wifi,
  HardDrive,
  Thermometer,
  Gauge,
  Lightbulb
} from 'lucide-react';

// Import AgentSuperpowersFramework types
import {
  AgentSuperpower,
  AgentMetrics,
  AgentCollaboration,
  MarketplaceAgent,
  AgentSuperpowersFramework,
  AGENT_SUPERPOWERS
} from '../infra/core/AgentSuperpowersFramework';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface DashboardAlert {
  id: string;
  agentId: string;
  type: 'performance' | 'security' | 'resource' | 'collaboration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface PerformanceData {
  timestamp: Date;
  cpu: number;
  memory: number;
  networkLatency: number;
  successRate: number;
  tasksCompleted: number;
}

interface CollaborationNode {
  id: string;
  name: string;
  x: number;
  y: number;
  activeConnections: number;
  knowledgeShared: number;
}

interface SecurityThreat {
  id: string;
  type: 'intrusion' | 'anomaly' | 'vulnerability' | 'breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  timestamp: Date;
  status: 'active' | 'mitigated' | 'investigating';
}

interface ResourceAllocation {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
  energy: number;
}

interface MarketplaceTransaction {
  id: string;
  agentId: string;
  agentName: string;
  type: 'buy' | 'sell' | 'collaborate';
  amount: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

interface TimeRange {
  label: string;
  value: number; // in hours
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockMetrics = (): AgentMetrics => ({
  agentId: `agent_${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date(),
  cpu: Math.random() * 100,
  memory: Math.random() * 100,
  networkLatency: Math.random() * 200,
  tasksCompleted: Math.floor(Math.random() * 1000),
  successRate: 80 + Math.random() * 20,
  userSatisfaction: 70 + Math.random() * 30,
  energyLevel: 20 + Math.random() * 80,
  activeSuperpowers: Object.keys(AGENT_SUPERPOWERS).slice(0, Math.floor(Math.random() * 5))
});

const generateMockAlerts = (): DashboardAlert[] => [
  {
    id: 'alert_1',
    agentId: 'agent_alpha',
    type: 'performance',
    severity: 'high',
    title: 'High CPU Usage',
    message: 'Agent alpha is experiencing CPU usage above 90%',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    acknowledged: false
  },
  {
    id: 'alert_2',
    agentId: 'agent_beta',
    type: 'security',
    severity: 'medium',
    title: 'Unusual Network Activity',
    message: 'Anomalous network patterns detected from agent beta',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    acknowledged: false
  },
  {
    id: 'alert_3',
    agentId: 'agent_gamma',
    type: 'resource',
    severity: 'low',
    title: 'Memory Optimization Available',
    message: 'Agent gamma can optimize memory usage by 15%',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    acknowledged: true
  }
];

const generateMockPerformanceData = (): PerformanceData[] => {
  const data: PerformanceData[] = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp,
      cpu: 20 + Math.random() * 60,
      memory: 30 + Math.random() * 50,
      networkLatency: 10 + Math.random() * 100,
      successRate: 85 + Math.random() * 15,
      tasksCompleted: Math.floor(Math.random() * 50)
    });
  }
  
  return data;
};

const generateMockCollaborationNodes = (): CollaborationNode[] => [
  { id: 'agent_1', name: 'Alpha Agent', x: 200, y: 150, activeConnections: 5, knowledgeShared: 1250 },
  { id: 'agent_2', name: 'Beta Agent', x: 400, y: 100, activeConnections: 3, knowledgeShared: 890 },
  { id: 'agent_3', name: 'Gamma Agent', x: 300, y: 250, activeConnections: 7, knowledgeShared: 1560 },
  { id: 'agent_4', name: 'Delta Agent', x: 500, y: 200, activeConnections: 4, knowledgeShared: 1100 },
  { id: 'agent_5', name: 'Epsilon Agent', x: 150, y: 300, activeConnections: 6, knowledgeShared: 1420 }
];

const generateMockSecurityThreats = (): SecurityThreat[] => [
  {
    id: 'threat_1',
    type: 'anomaly',
    severity: 'medium',
    description: 'Unusual API access patterns detected',
    source: 'agent_network_monitor',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    status: 'investigating'
  },
  {
    id: 'threat_2',
    type: 'intrusion',
    severity: 'high',
    description: 'Failed authentication attempts exceeded threshold',
    source: 'security_gateway',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    status: 'mitigated'
  },
  {
    id: 'threat_3',
    type: 'vulnerability',
    severity: 'low',
    description: 'Outdated dependency detected in agent runtime',
    source: 'vulnerability_scanner',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    status: 'active'
  }
];

const generateMockMarketplaceTransactions = (): MarketplaceTransaction[] => [
  {
    id: 'tx_1',
    agentId: 'agent_market_1',
    agentName: 'Data Analyzer Pro',
    type: 'buy',
    amount: 250,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: 'completed'
  },
  {
    id: 'tx_2',
    agentId: 'agent_market_2',
    agentName: 'Content Creator',
    type: 'collaborate',
    amount: 180,
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: 'pending'
  },
  {
    id: 'tx_3',
    agentId: 'agent_market_3',
    agentName: 'Security Guardian',
    type: 'sell',
    amount: 320,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'failed'
  }
];

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

const AdvancedAgentDashboard: React.FC = () => {
  // State management
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(24);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<DashboardAlert[]>(generateMockAlerts());
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>(generateMockPerformanceData());
  const [collaborationNodes, setCollaborationNodes] = useState<CollaborationNode[]>(generateMockCollaborationNodes());
  const [securityThreats, setSecurityThreats] = useState<SecurityThreat[]>(generateMockSecurityThreats());
  const [marketplaceTransactions, setMarketplaceTransactions] = useState<MarketplaceTransaction[]>(generateMockMarketplaceTransactions());
  const [currentMetrics, setCurrentMetrics] = useState<AgentMetrics>(generateMockMetrics());
  const [resourceAllocation, setResourceAllocation] = useState<ResourceAllocation>({
    cpu: 65,
    memory: 72,
    network: 45,
    storage: 38,
    energy: 82
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    monitoring: true,
    superpowers: true,
    performance: true,
    collaboration: true,
    security: true,
    resources: true,
    marketplace: true,
    alerts: true
  });
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Time range options
  const timeRanges: TimeRange[] = [
    { label: 'Last Hour', value: 1 },
    { label: 'Last 6 Hours', value: 6 },
    { label: 'Last 24 Hours', value: 24 },
    { label: 'Last Week', value: 168 },
    { label: 'Last Month', value: 720 }
  ];

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Update current metrics
      setCurrentMetrics(generateMockMetrics());
      
      // Update performance data (add new data point)
      setPerformanceData(prev => {
        const newData = [...prev.slice(1), {
          timestamp: new Date(),
          cpu: 20 + Math.random() * 60,
          memory: 30 + Math.random() * 50,
          networkLatency: 10 + Math.random() * 100,
          successRate: 85 + Math.random() * 15,
          tasksCompleted: Math.floor(Math.random() * 50)
        }];
        return newData;
      });

      // Update resource allocation
      setResourceAllocation({
        cpu: 50 + Math.random() * 40,
        memory: 60 + Math.random() * 30,
        network: 30 + Math.random() * 50,
        storage: 25 + Math.random() * 45,
        energy: 70 + Math.random() * 25
      });

      // Occasionally add new alerts
      if (Math.random() > 0.8) {
        const newAlert: DashboardAlert = {
          id: `alert_${Date.now()}`,
          agentId: `agent_${Math.random().toString(36).substr(2, 9)}`,
          type: ['performance', 'security', 'resource', 'collaboration'][Math.floor(Math.random() * 4)] as DashboardAlert['type'],
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as DashboardAlert['severity'],
          title: ['Performance Alert', 'Security Warning', 'Resource Alert', 'Collaboration Update'][Math.floor(Math.random() * 4)],
          message: 'New system alert generated',
          timestamp: new Date(),
          acknowledged: false
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Acknowledge alert
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'mitigated': return 'text-blue-500';
      case 'failed': return 'text-red-500';
      case 'completed': return 'text-green-500';
      case 'investigating': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  // Render metric card
  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    trend, 
    color = 'blue' 
  }: {
    title: string;
    value: number;
    unit: string;
    icon: any;
    trend?: 'up' | 'down' | 'stable';
    color?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {value.toFixed(1)}{unit}
      </div>
      <div className="text-sm text-gray-400">{title}</div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} p-6`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
              🦅 Agent Superpowers Dashboard
            </h1>
            <p className="text-gray-400">Real-time monitoring and management of agent capabilities</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(Number(e.target.value))}
                className="bg-transparent text-sm text-white outline-none"
                aria-label="Select time range for dashboard data"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Active Agents"
            value={12}
            unit=""
            icon={Users}
            trend="up"
            color="blue"
          />
          <MetricCard
            title="CPU Usage"
            value={currentMetrics.cpu}
            unit="%"
            icon={Cpu}
            trend="stable"
            color="green"
          />
          <MetricCard
            title="Memory Usage"
            value={currentMetrics.memory}
            unit="%"
            icon={Database}
            trend="down"
            color="yellow"
          />
          <MetricCard
            title="Success Rate"
            value={currentMetrics.successRate}
            unit="%"
            icon={Target}
            trend="up"
            color="purple"
          />
          <MetricCard
            title="Energy Level"
            value={currentMetrics.energyLevel}
            unit="%"
            icon={Battery}
            trend="stable"
            color="orange"
          />
        </div>
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Real-time Agent Status Monitoring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden"
        >
          <div 
            className="flex items-center justify-between p-4 border-b border-gray-700 cursor-pointer"
            onClick={() => toggleSection('monitoring')}
          >
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold">Real-time Agent Status</h2>
            </div>
            {expandedSections.monitoring ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
          
          <AnimatePresence>
            {expandedSections.monitoring && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="p-4"
              >
                <div className="space-y-4">
                  {/* Agent Status List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Alpha', 'Beta', 'Gamma', 'Delta'].map((name, index) => (
                      <div key={name} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              index % 3 === 0 ? 'bg-green-500' : index % 3 === 1 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <span className="font-medium">{name} Agent</span>
                          </div>
                          <span className="text-xs text-gray-400">ID: agent_{name.toLowerCase()}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-gray-400" />
                            <span>{(20 + Math.random() * 60).toFixed(1)}% CPU</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Database className="w-3 h-3 text-gray-400" />
                            <span>{(30 + Math.random() * 50).toFixed(1)}% RAM</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Network className="w-3 h-3 text-gray-400" />
                            <span>{(10 + Math.random() * 100).toFixed(0)}ms</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Battery className="w-3 h-3 text-gray-400" />
                            <span>{(20 + Math.random() * 80).toFixed(0)}%</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Active Powers:</span>
                            <span className="text-blue-400">{Math.floor(Math.random() * 5) + 1}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Health Metrics Summary */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">System Health Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">98.5%</div>
                        <div className="text-xs text-gray-400">Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">142</div>
                        <div className="text-xs text-gray-400">Tasks/Hour</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">12ms</div>
                        <div className="text-xs text-gray-400">Avg Latency</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400">89%</div>
                        <div className="text-xs text-gray-400">Efficiency</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Agent Superpowers Management */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden"
        >
          <div 
            className="flex items-center justify-between p-4 border-b border-gray-700 cursor-pointer"
            onClick={() => toggleSection('superpowers')}
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold">Superpowers</h2>
            </div>
            {expandedSections.superpowers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
          
          <AnimatePresence>
            {expandedSections.superpowers && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="p-4"
              >
                <div className="space-y-3">
                  {/* Energy Level */}
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Energy Level</span>
                      <span className="text-sm text-purple-400">{currentMetrics.energyLevel.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${currentMetrics.energyLevel}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Active Superpowers */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-400">Active Powers</h3>
                    {currentMetrics.activeSuperpowers.slice(0, 3).map(powerId => {
                      const power = AGENT_SUPERPOWERS[powerId];
                      if (!power) return null;
                      
                      return (
                        <div key={powerId} className="bg-gray-900/50 rounded-lg p-2 border border-gray-700">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">{power.name}</div>
                              <div className="text-xs text-gray-400">{power.category}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-400" />
                              <span className="text-xs text-orange-400">{power.energyCost}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 py-2 px-3 rounded-lg text-sm transition-colors">
                      Upgrade Power
                    </button>
                    <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 px-3 rounded-lg text-sm transition-colors">
                      New Power
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Performance Analytics */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden"
        >
          <div 
            className="flex items-center justify-between p-4 border-b border-gray-700 cursor-pointer"
            onClick={() => toggleSection('performance')}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold">Performance Analytics</h2>
            </div>
            {expandedSections.performance ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
          
          <AnimatePresence>
            {expandedSections.performance && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="p-4"
              >
                <div className="space-y-4">
                  {/* Performance Chart */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Performance Trends</h3>
                    <div className="h-48 flex items-end justify-between gap-2">
                      {performanceData.slice(-12).map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t" 
                               style={{ height: `${data.cpu}%` }} />
                          <span className="text-xs text-gray-500">{index % 3 === 0 ? `${index}h` : ''}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded" />
                        <span className="text-gray-400">CPU</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded" />
                        <span className="text-gray-400">Memory</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-purple-500 rounded" />
                        <span className="text-gray-400">Network</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Performance Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 text-center">
                      <div className="text-lg font-bold text-green-400">94.2%</div>
                      <div className="text-xs text-gray-400">Avg Success</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 text-center">
                      <div className="text-lg font-bold text-blue-400">1,247</div>
                      <div className="text-xs text-gray-400">Tasks Today</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 text-center">
                      <div className="text-lg font-bold text-purple-400">23ms</div>
                      <div className="text-xs text-gray-400">Avg Response</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 text-center">
                      <div className="text-lg font-bold text-orange-400">+12%</div>
                      <div className="text-xs text-gray-400">Growth</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Collaboration Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden"
        >
          <div 
            className="flex items-center justify-between p-4 border-b border-gray-700 cursor-pointer"
            onClick={() => toggleSection('collaboration')}
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold">Collaboration</h2>
            </div>
            {expandedSections.collaboration ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
          
          <AnimatePresence>
            {expandedSections.collaboration && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="p-4"
              >
                <div className="space-y-4">
                  {/* Network Visualization */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Active Collaborations</h3>
                    <div className="relative h-48">
                      {collaborationNodes.map((node, index) => (
                        <div key={node.id}>
                          {/* Node */}
                          <motion.div
                            className="absolute w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer"
                            style={{ 
                              left: `${(node.x / 600) * 100}%`, 
                              top: `${(node.y / 400) * 100}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                            whileHover={{ scale: 1.2 }}
                            onClick={() => setSelectedAgent(node.id)}
                          >
                            {node.name.charAt(0)}
                          </motion.div>
                          
                          {/* Connections */}
                          {collaborationNodes.slice(index + 1).map(otherNode => {
                            const distance = Math.sqrt(
                              Math.pow(otherNode.x - node.x, 2) + 
                              Math.pow(otherNode.y - node.y, 2)
                            );
                            
                            if (distance < 200) {
                              return (
                                <svg
                                  key={`${node.id}-${otherNode.id}`}
                                  className="absolute inset-0 pointer-events-none"
                                  style={{ width: '100%', height: '100%' }}
                                >
                                  <line
                                    x1={`${(node.x / 600) * 100}%`}
                                    y1={`${(node.y / 400) * 100}%`}
                                    x2={`${(otherNode.x / 600) * 100}%`}
                                    y2={`${(otherNode.y / 400) * 100}%`}
                                    stroke="rgba(6, 182, 212, 0.3)"
                                    strokeWidth="1"
                                  />
                                </svg>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Collaboration Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 text-center">
                      <div className="text-lg font-bold text-cyan-400">24</div>
                      <div className="text-xs text-gray-400">Active Teams</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 text-center">
                      <div className="text-lg font-bold text-blue-400">142</div>
                      <div className="text-xs text-gray-400">Knowledge Shared</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Security Monitoring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden"
        >
          <div 
            className="flex items-center justify-between p-4 border-b border-gray-700 cursor-pointer"
            onClick={() => toggleSection('security')}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold">Security</h2>
            </div>
            {expandedSections.security ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
          
          <AnimatePresence>
            {expandedSections.security && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="p-4"
              >
                <div className="space-y-3">
                  {/* Threat Level */}
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Threat Level</span>
                      <span className="text-sm text-yellow-400">Medium</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full" 
                           style={{ width: '45%' }} />
                    </div>
                  </div>
                  
                  {/* Recent Threats */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-400">Recent Threats</h3>
                    {securityThreats.slice(0, 3).map(threat => (
                      <div key={threat.id} className="bg-gray-900/50 rounded-lg p-2 border border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm">{threat.description}</div>
                            <div className="text-xs text-gray-400">{formatTimestamp(threat.timestamp)}</div>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${getSeverityColor(threat.severity)}`}>
                            {threat.severity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Security Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-3 rounded-lg text-sm transition-colors">
                      Scan Now
                    </button>
                    <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 px-3 rounded-lg text-sm transition-colors">
                      View Logs
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Resource Management */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden"
        >
          <div 
            className="flex items-center justify-between p-4 border-b border-gray-700 cursor-pointer"
            onClick={() => toggleSection('resources')}
          >
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-semibold">Resources</h2>
            </div>
            {expandedSections.resources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
          
          <AnimatePresence>
            {expandedSections.resources && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="p-4"
              >
                <div className="space-y-4">
                  {/* Resource Usage */}
                  {Object.entries(resourceAllocation).map(([resource, usage]) => (
                    <div key={resource} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">
                          {resource === 'cpu' ? 'CPU' : 
                           resource === 'memory' ? 'Memory' : 
                           resource === 'network' ? 'Network' : 
                           resource === 'storage' ? 'Storage' : 'Energy'}
                        </span>
                        <span className="text-sm text-orange-400">{usage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            usage > 80 ? 'bg-red-500' : 
                            usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${usage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {/* Optimization Suggestions */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Optimization Tip</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Consider reallocating memory resources from idle agents to active tasks for better performance.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Marketplace Integration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden"
        >
          <div 
            className="flex items-center justify-between p-4 border-b border-gray-700 cursor-pointer"
            onClick={() => toggleSection('marketplace')}
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold">Marketplace</h2>
            </div>
            {expandedSections.marketplace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
          
          <AnimatePresence>
            {expandedSections.marketplace && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="p-4"
              >
                <div className="space-y-4">
                  {/* Recent Transactions */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-400">Recent Activity</h3>
                    {marketplaceTransactions.slice(0, 3).map(tx => (
                      <div key={tx.id} className="bg-gray-900/50 rounded-lg p-2 border border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm">{tx.agentName}</div>
                            <div className="text-xs text-gray-400">{formatTimestamp(tx.timestamp)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {tx.type === 'buy' ? '-' : tx.type === 'sell' ? '+' : ''}${tx.amount}
                            </div>
                            <div className={`text-xs ${getStatusColor(tx.status)}`}>
                              {tx.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Marketplace Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 text-center">
                      <div className="text-lg font-bold text-green-400">$1,247</div>
                      <div className="text-xs text-gray-400">Volume Today</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 text-center">
                      <div className="text-lg font-bold text-blue-400">18</div>
                      <div className="text-xs text-gray-400">Active Listings</div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button className="bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 px-3 rounded-lg text-sm transition-colors">
                      Browse
                    </button>
                    <button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 py-2 px-3 rounded-lg text-sm transition-colors">
                      List Agent
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Alert System */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden"
        >
          <div 
            className="flex items-center justify-between p-4 border-b border-gray-700 cursor-pointer"
            onClick={() => toggleSection('alerts')}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold">Alerts & Notifications</h2>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {alerts.filter(a => !a.acknowledged).length}
              </span>
            </div>
            {expandedSections.alerts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
          
          <AnimatePresence>
            {expandedSections.alerts && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="p-4"
              >
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`rounded-lg p-3 border ${getSeverityColor(alert.severity)} ${
                        alert.acknowledged ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium">{alert.title}</span>
                            <span className="text-xs opacity-75">{alert.agentId}</span>
                          </div>
                          <p className="text-sm mb-1">{alert.message}</p>
                          <div className="text-xs opacity-75">{formatTimestamp(alert.timestamp)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!alert.acknowledged && (
                            <button
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                            >
                              Acknowledge
                            </button>
                          )}
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AdvancedAgentDashboard;