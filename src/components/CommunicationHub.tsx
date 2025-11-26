/**
 * 🌐 COMMUNICATION HUB - INTEGRATED DASHBOARD
 * 
 * This component serves as the central hub for all communication systems
 * within the Axiom ecosystem, providing a unified interface for:
 * 
 * - Agent discovery and directory services
 * - Real-time communication sessions
 * - Message passing and routing
 * - Analytics and monitoring
 * - Digital Mandala visualization
 * - Third Eye insights
 * - Duality Engine karma tracking
 * - AxiomID management
 * 
 * The hub implements the microcosm/macrocosm pattern where
 * individual agent behaviors (micro) influence the network state (macro)
 * and network patterns provide insights back to individuals.
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Activity, 
  BarChart3, 
  Settings, 
  Eye,
  Brain,
  Sparkles,
  Shield,
  Globe,
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

// Import communication components
import { DigitalMandala } from './DigitalMandala';
import { ThirdEyeOverlay } from './ThirdEyeOverlay';

// Import types
import { AxiomID } from '@/infra/core/AxiomID';
import { KarmaBalance } from '@/infra/core/DualityEngine';
import { AgentCommunicationIntegration } from '@/infra/core/AgentCommunicationIntegration';
import { RealtimeCommunicationSystem } from '@/infra/core/RealtimeCommunicationSystem';
import { CommunicationMonitoringSystem } from '@/infra/core/CommunicationMonitoringSystem';

// ============================================================================
// COMMUNICATION HUB PROPS
// ============================================================================

interface CommunicationHubProps {
  agentId?: string;
  axiomId?: AxiomID;
  karmaBalance?: KarmaBalance;
  className?: string;
  onAgentSelect?: (agentId: string) => void;
  onSessionCreate?: (sessionData: any) => void;
  onMessageSend?: (messageData: any) => void;
}

interface HubSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  isActive: boolean;
  notifications?: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CommunicationHub: React.FC<CommunicationHubProps> = ({
  agentId,
  axiomId,
  karmaBalance,
  className = '',
  onAgentSelect,
  onSessionCreate,
  onMessageSend
}) => {
  // State management
  const [activeSection, setActiveSection] = useState('overview');
  const [agents, setAgents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isThirdEyeActive, setIsThirdEyeActive] = useState(false);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // System instances
  const communicationIntegration = useRef(new AgentCommunicationIntegration(agentId || 'hub'));
  const realtimeSystem = useRef(new RealtimeCommunicationSystem());
  const monitoringSystem = useRef(new CommunicationMonitoringSystem());
  
  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  
  // Fetch agents directory
  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch('/api/communication/agents');
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.data.agents);
      } else {
        console.error('Failed to fetch agents:', data.error);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  }, []);
  
  // Fetch communication sessions
  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/communication/sessions');
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.data.sessions);
      } else {
        console.error('Failed to fetch sessions:', data.error);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  }, []);
  
  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/communication/analytics');
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        console.error('Failed to fetch analytics:', data.error);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);
  
  // Fetch system health
  const fetchSystemHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring');
      const data = await response.json();
      
      if (data.success) {
        setSystemHealth(data.data);
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  }, []);
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  // Handle agent selection
  const handleAgentSelect = useCallback((agentId: string) => {
    onAgentSelect?.(agentId);
    setActiveSection('agent-detail');
  }, [onAgentSelect]);
  
  // Handle session creation
  const handleSessionCreate = useCallback((sessionData: any) => {
    onSessionCreate?.(sessionData);
    setActiveSection('sessions');
  }, [onSessionCreate]);
  
  // Handle message sending
  const handleMessageSend = useCallback((messageData: any) => {
    onMessageSend?.(messageData);
    
    // Add to local messages for immediate UI update
    setMessages(prev => [...prev, {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'sent'
    }]);
  }, [onMessageSend]);
  
  // Handle third eye activation
  const handleThirdEyeToggle = useCallback((active: boolean) => {
    setIsThirdEyeActive(active);
    
    // Log third eye usage for analytics
    if (active) {
      monitoringSystem.current.trackEvent('third_eye_activated', {
        agentId,
        timestamp: new Date(),
        section: activeSection
      });
    }
  }, [agentId, activeSection, monitoringSystem]);
  
  // Handle insight click from third eye
  const handleInsightClick = useCallback((insight: any) => {
    // Add notification
    setNotifications(prev => [...prev, {
      id: Date.now().toString(),
      type: 'insight',
      title: insight.title,
      message: insight.insight,
      severity: insight.severity,
      timestamp: new Date(),
      read: false
    }]);
    
    // Navigate to relevant section
    if (insight.targetId) {
      handleAgentSelect(insight.targetId);
    }
  }, [handleAgentSelect]);
  
  // ============================================================================
  // HUB SECTIONS
  // ============================================================================
  
  // Define hub sections
  const hubSections: HubSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <Globe className="w-5 h-5" />,
      component: <OverviewSection 
        agents={agents}
        sessions={sessions}
        analytics={analytics}
        systemHealth={systemHealth}
        karmaBalance={karmaBalance}
      />,
      isActive: activeSection === 'overview'
    },
    {
      id: 'agents',
      title: 'Agents',
      icon: <Users className="w-5 h-5" />,
      component: <AgentsSection 
        agents={agents}
        onAgentSelect={handleAgentSelect}
        onRefresh={fetchAgents}
      />,
      isActive: activeSection === 'agents',
      notifications: agents.filter(a => a.status === 'online').length
    },
    {
      id: 'sessions',
      title: 'Sessions',
      icon: <MessageSquare className="w-5 h-5" />,
      component: <SessionsSection 
        sessions={sessions}
        onSessionCreate={handleSessionCreate}
        onRefresh={fetchSessions}
      />,
      isActive: activeSection === 'sessions',
      notifications: sessions.filter(s => s.status === 'active').length
    },
    {
      id: 'messages',
      title: 'Messages',
      icon: <Activity className="w-5 h-5" />,
      component: <MessagesSection 
        messages={messages}
        onMessageSend={handleMessageSend}
        agents={agents}
      />,
      isActive: activeSection === 'messages'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      component: <AnalyticsSection 
        analytics={analytics}
        onRefresh={fetchAnalytics}
      />,
      isActive: activeSection === 'analytics'
    },
    {
      id: 'mandala',
      title: 'Digital Mandala',
      icon: <Sparkles className="w-5 h-5" />,
      component: axiomId ? (
        <DigitalMandala 
          axiomId={axiomId}
          karmaBalance={karmaBalance}
          config={{
            size: 300,
            complexity: 'moderate',
            colorScheme: 'cosmic'
          }}
          showLabels={true}
          interactive={true}
        />
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No AxiomID data available</p>
        </div>
      ),
      isActive: activeSection === 'mandala'
    },
    {
      id: 'karma',
      title: 'Karma Balance',
      icon: <Brain className="w-5 h-5" />,
      component: karmaBalance ? (
        <KarmaSection 
          karmaBalance={karmaBalance}
          axiomId={axiomId}
        />
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No karma data available</p>
        </div>
      ),
      isActive: activeSection === 'karma'
    }
  ];
  
  // ============================================================================
  // INITIAL DATA LOADING
  // ============================================================================
  
  useEffect(() => {
    // Load initial data
    fetchAgents();
    fetchSessions();
    fetchAnalytics();
    fetchSystemHealth();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchSystemHealth();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchAgents, fetchSessions, fetchAnalytics, fetchSystemHealth]);
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className={`communication-hub ${className}`}>
      {/* Header */}
      <header className="hub-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="hub-title">Axiom Communication Hub</h1>
            <p className="hub-subtitle">Microcosm ↔ Macrocosm Interface</p>
          </div>
          
          <div className="header-right">
            {/* System Health Indicator */}
            {systemHealth && (
              <div className={`health-indicator ${systemHealth.overallHealth > 80 ? 'healthy' : systemHealth.overallHealth > 60 ? 'warning' : 'critical'}`}>
                <div className="health-dot" />
                <span className="health-text">{systemHealth.overallHealth}%</span>
              </div>
            )}
            
            {/* Notifications */}
            <div className="notifications">
              <AnimatePresence>
                {notifications.slice(-3).map(notification => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`notification ${notification.severity}`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>{notification.title}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="hub-navigation">
        {hubSections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`nav-item ${section.isActive ? 'active' : ''}`}
          >
            {section.icon}
            <span>{section.title}</span>
            {section.notifications && section.notifications > 0 && (
              <span className="notification-badge">{section.notifications}</span>
            )}
          </button>
        ))}
      </nav>
      
      {/* Main Content */}
      <main className="hub-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="content-container"
          >
            {hubSections.find(s => s.id === activeSection)?.component}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Third Eye Overlay */}
      <ThirdEyeOverlay
        axiomIds={axiomId ? [axiomId] : []}
        karmaBalances={karmaBalance ? new Map([[agentId || '', karmaBalance]]) : new Map()}
        onInsightClick={handleInsightClick}
        config={{
          sensitivity: 75,
          predictionHorizon: 48,
          visualizationIntensity: 80,
          alertThreshold: 70,
          autoReveal: true
        }}
      />
      
      {/* Status Bar */}
      <footer className="hub-status">
        <div className="status-left">
          <div className="status-item">
            <Shield className="w-4 h-4" />
            <span>Security: {systemHealth?.securityStatus || 'Unknown'}</span>
          </div>
          <div className="status-item">
            <Zap className="w-4 h-4" />
            <span>Performance: {systemHealth?.performanceStatus || 'Unknown'}</span>
          </div>
        </div>
        
        <div className="status-right">
          <div className="status-item">
            <TrendingUp className="w-4 h-4" />
            <span>Network: {systemHealth?.networkStatus || 'Unknown'}</span>
          </div>
          <div className="status-item">
            <Users className="w-4 h-4" />
            <span>{agents.filter(a => a.status === 'online').length} Online</span>
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        .communication-hub {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .hub-header {
          padding: 1rem 2rem;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .header-left {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .hub-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hub-subtitle {
          font-size: 0.875rem;
          color: #9ca3af;
          margin: 0;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .health-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          background: rgba(0, 0, 0, 0.3);
        }
        
        .health-indicator.healthy {
          border: 1px solid #10b981;
        }
        
        .health-indicator.warning {
          border: 1px solid #f59e0b;
        }
        
        .health-indicator.critical {
          border: 1px solid #ef4444;
        }
        
        .health-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }
        
        .health-indicator.healthy .health-dot {
          background: #10b981;
        }
        
        .health-indicator.warning .health-dot {
          background: #f59e0b;
        }
        
        .health-indicator.critical .health-dot {
          background: #ef4444;
        }
        
        .health-text {
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .notifications {
          position: relative;
        }
        
        .notification {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          margin-bottom: 0.5rem;
          border-radius: 0.5rem;
          background: rgba(0, 0, 0, 0.5);
          border-left: 3px solid;
        }
        
        .notification.low {
          border-left-color: #3b82f6;
        }
        
        .notification.medium {
          border-left-color: #f59e0b;
        }
        
        .notification.high {
          border-left-color: #ef4444;
        }
        
        .notification.critical {
          border-left-color: #dc2626;
        }
        
        .hub-navigation {
          display: flex;
          padding: 1rem 2rem;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          gap: 0.5rem;
          overflow-x: auto;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
        
        .nav-item.active {
          background: rgba(99, 102, 241, 0.2);
          border-color: #6366f1;
          color: #ffffff;
        }
        
        .notification-badge {
          background: #ef4444;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.125rem 0.375rem;
          border-radius: 1rem;
          min-width: 1.25rem;
          text-align: center;
        }
        
        .hub-main {
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        
        .content-container {
          height: 100%;
          overflow-y: auto;
          padding: 2rem;
        }
        
        .hub-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .status-left, .status-right {
          display: flex;
          gap: 2rem;
        }
        
        .status-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #9ca3af;
          font-size: 0.875rem;
        }
        
        .status-item span {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

/**
 * Overview Section
 */
const OverviewSection: React.FC<{
  agents: any[];
  sessions: any[];
  analytics: any;
  systemHealth: any;
  karmaBalance?: KarmaBalance;
}> = ({ agents, sessions, analytics, systemHealth, karmaBalance }) => {
  const onlineAgents = agents.filter(a => a.status === 'online');
  const activeSessions = sessions.filter(s => s.status === 'active');
  
  return (
    <div className="overview-section">
      <div className="overview-grid">
        <div className="overview-card">
          <h3>Network Status</h3>
          <div className="metric">
            <span className="metric-value">{onlineAgents.length}</span>
            <span className="metric-label">Agents Online</span>
          </div>
          <div className="metric">
            <span className="metric-value">{activeSessions.length}</span>
            <span className="metric-label">Active Sessions</span>
          </div>
        </div>
        
        {karmaBalance && (
          <div className="overview-card">
            <h3>Karma Balance</h3>
            <div className="karma-display">
              <div className="karma-side virtue">
                <span className="karma-label">Virtue</span>
                <span className="karma-value">{karmaBalance.virtuePoints}</span>
              </div>
              <div className="karma-divider" />
              <div className="karma-side vice">
                <span className="karma-label">Vice</span>
                <span className="karma-value">{karmaBalance.vicePoints}</span>
              </div>
            </div>
            <div className="karma-state">
              State: <span className={`state-${karmaBalance.state}`}>{karmaBalance.state}</span>
            </div>
          </div>
        )}
        
        {systemHealth && (
          <div className="overview-card">
            <h3>System Health</h3>
            <div className="health-metrics">
              <div className="health-metric">
                <span className="health-label">Overall</span>
                <div className="health-bar">
                  <div 
                    className="health-fill" 
                    style={{ width: `${systemHealth.overallHealth}%` }}
                  />
                </div>
                <span className="health-value">{systemHealth.overallHealth}%</span>
              </div>
              <div className="health-metric">
                <span className="health-label">Security</span>
                <div className="health-bar">
                  <div 
                    className="health-fill security" 
                    style={{ width: `${systemHealth.securityScore}%` }}
                  />
                </div>
                <span className="health-value">{systemHealth.securityScore}%</span>
              </div>
              <div className="health-metric">
                <span className="health-label">Performance</span>
                <div className="health-bar">
                  <div 
                    className="health-fill performance" 
                    style={{ width: `${systemHealth.performanceScore}%` }}
                  />
                </div>
                <span className="health-value">{systemHealth.performanceScore}%</span>
              </div>
            </div>
          </div>
        )}
        
        {analytics && (
          <div className="overview-card">
            <h3>Quick Analytics</h3>
            <div className="analytics-summary">
              <div className="summary-item">
                <span className="summary-label">Messages Today</span>
                <span className="summary-value">{analytics.communication?.overview?.totalMessages || 0}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Avg Quality</span>
                <span className="summary-value">{analytics.quality?.communication?.overallScore || 0}%</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Uptime</span>
                <span className="summary-value">{analytics.performance?.availability?.uptime || 0}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .overview-section {
          padding: 2rem;
        }
        
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .overview-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 1.5rem;
        }
        
        .overview-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #ffffff;
        }
        
        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: #6366f1;
        }
        
        .metric-label {
          font-size: 0.875rem;
          color: #9ca3af;
        }
        
        .karma-display {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .karma-side {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }
        
        .karma-label {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-bottom: 0.25rem;
        }
        
        .karma-value {
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .karma-side.virtue .karma-value {
          color: #10b981;
        }
        
        .karma-side.vice .karma-value {
          color: #ef4444;
        }
        
        .karma-divider {
          width: 1px;
          height: 2rem;
          background: rgba(255, 255, 255, 0.2);
        }
        
        .karma-state {
          text-align: center;
          font-size: 0.875rem;
          color: #9ca3af;
        }
        
        .state-BLESSED {
          color: #10b981;
        }
        
        .state-PENANCE {
          color: #ef4444;
        }
        
        .state-BALANCED {
          color: #f59e0b;
        }
        
        .health-metrics {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .health-metric {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .health-label {
          font-size: 0.875rem;
          color: #9ca3af;
          min-width: 80px;
        }
        
        .health-bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .health-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        
        .health-fill.security {
          background: #10b981;
        }
        
        .health-fill.performance {
          background: #3b82f6;
        }
        
        .health-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: #ffffff;
          min-width: 40px;
          text-align: right;
        }
        
        .analytics-summary {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .summary-label {
          font-size: 0.875rem;
          color: #9ca3af;
        }
        
        .summary-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: #6366f1;
        }
      `}</style>
    </div>
  );
};

/**
 * Agents Section
 */
const AgentsSection: React.FC<{
  agents: any[];
  onAgentSelect: (agentId: string) => void;
  onRefresh: () => void;
}> = ({ agents, onAgentSelect, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || agent.type === filterType;
    return matchesSearch && matchesType;
  });
  
  return (
    <div className="agents-section">
      <div className="section-header">
        <h2>Agent Directory</h2>
        <div className="header-controls">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="human">Human</option>
            <option value="ai">AI</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <button onClick={onRefresh} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>
      
      <div className="agents-grid">
        {filteredAgents.map(agent => (
          <div
            key={agent.id}
            onClick={() => onAgentSelect(agent.id)}
            className="agent-card"
          >
            <div className="agent-header">
              <div className="agent-info">
                <h3>{agent.name}</h3>
                <span className={`agent-type type-${agent.type}`}>{agent.type}</span>
              </div>
              <div className={`agent-status status-${agent.status}`}>
                <div className="status-dot" />
                <span>{agent.status}</span>
              </div>
            </div>
            
            <div className="agent-details">
              <p className="agent-description">{agent.description}</p>
              <div className="agent-metrics">
                <div className="metric">
                  <span className="metric-label">Reputation</span>
                  <span className="metric-value">{agent.reputation}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Connections</span>
                  <span className="metric-value">{agent.connectionCount}</span>
                </div>
              </div>
              <div className="agent-capabilities">
                {agent.capabilities?.slice(0, 3).map(cap => (
                  <span key={cap} className="capability-tag">{cap}</span>
                ))}
                {agent.capabilities?.length > 3 && (
                  <span className="capability-more">+{agent.capabilities.length - 3} more</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .agents-section {
          padding: 2rem;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .section-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #ffffff;
        }
        
        .header-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .search-input, .filter-select {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 0.875rem;
        }
        
        .refresh-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background: #6366f1;
          color: #ffffff;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .agents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .agent-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .agent-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
        
        .agent-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .agent-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          color: #ffffff;
        }
        
        .agent-type {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-weight: 500;
        }
        
        .type-human {
          background: #10b981;
          color: #ffffff;
        }
        
        .type-ai {
          background: #3b82f6;
          color: #ffffff;
        }
        
        .type-hybrid {
          background: #8b5cf6;
          color: #ffffff;
        }
        
        .agent-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .status-online .status-dot {
          background: #10b981;
        }
        
        .status-away .status-dot {
          background: #f59e0b;
        }
        
        .status-offline .status-dot {
          background: #ef4444;
        }
        
        .agent-description {
          color: #9ca3af;
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0 0 1rem 0;
        }
        
        .agent-metrics {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .agent-metrics .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .agent-metrics .metric-label {
          font-size: 0.75rem;
          color: #9ca3af;
        }
        
        .agent-metrics .metric-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: #6366f1;
        }
        
        .agent-capabilities {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .capability-tag {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          border-radius: 0.25rem;
        }
        
        .capability-more {
          font-size: 0.75rem;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

/**
 * Sessions Section
 */
const SessionsSection: React.FC<{
  sessions: any[];
  onSessionCreate: (sessionData: any) => void;
  onRefresh: () => void;
}> = ({ sessions, onSessionCreate, onRefresh }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const activeSessions = sessions.filter(s => s.status === 'active');
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled');
  const endedSessions = sessions.filter(s => s.status === 'ended');
  
  return (
    <div className="sessions-section">
      <div className="section-header">
        <h2>Communication Sessions</h2>
        <div className="header-controls">
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="create-session-btn"
          >
            Create Session
          </button>
          <button onClick={onRefresh} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>
      
      {showCreateForm && (
        <CreateSessionForm 
          onSubmit={onSessionCreate}
          onClose={() => setShowCreateForm(false)}
        />
      )}
      
      <div className="sessions-tabs">
        <div className="tab">
          <h3>Active ({activeSessions.length})</h3>
          <div className="sessions-list">
            {activeSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
        
        <div className="tab">
          <h3>Scheduled ({scheduledSessions.length})</h3>
          <div className="sessions-list">
            {scheduledSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
        
        <div className="tab">
          <h3>Recent ({endedSessions.slice(0, 5).length})</h3>
          <div className="sessions-list">
            {endedSessions.slice(0, 5).map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .sessions-section {
          padding: 2rem;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .section-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #ffffff;
        }
        
        .create-session-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background: #10b981;
          color: #ffffff;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .sessions-tabs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .tab h3 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          color: #ffffff;
        }
        
        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};

/**
 * Session Card Component
 */
const SessionCard: React.FC<{ session: any }> = ({ session }) => {
  return (
    <div className="session-card">
      <div className="session-header">
        <h4>{session.title}</h4>
        <span className={`session-status status-${session.status}`}>
          {session.status}
        </span>
      </div>
      
      <div className="session-details">
        <p className="session-description">{session.description}</p>
        <div className="session-participants">
          <span className="participants-label">Participants:</span>
          <div className="participants-list">
            {session.participants?.slice(0, 3).map((p: any) => (
              <span key={p.id} className="participant">
                {p.name || p.id}
              </span>
            ))}
            {session.participants?.length > 3 && (
              <span className="participant-more">
                +{session.participants.length - 3} more
              </span>
            )}
          </div>
        </div>
        <div className="session-meta">
          <span className="meta-item">
            Type: <strong>{session.type}</strong>
          </span>
          <span className="meta-item">
            Duration: <strong>{Math.floor((session.duration || 0) / 60)}m</strong>
          </span>
          <span className="meta-item">
            Created: <strong>{new Date(session.createdAt).toLocaleDateString()}</strong>
          </span>
        </div>
      </div>
      
      <style jsx>{`
        .session-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          padding: 1rem;
        }
        
        .session-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .session-header h4 {
          margin: 0;
          font-size: 1.125rem;
          color: #ffffff;
        }
        
        .session-status {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-weight: 500;
        }
        
        .status-active {
          background: #10b981;
          color: #ffffff;
        }
        
        .status-scheduled {
          background: #f59e0b;
          color: #ffffff;
        }
        
        .status-ended {
          background: #6b7280;
          color: #ffffff;
        }
        
        .session-description {
          color: #9ca3af;
          font-size: 0.875rem;
          margin: 0 0 1rem 0;
        }
        
        .session-participants {
          margin-bottom: 1rem;
        }
        
        .participants-label {
          font-size: 0.75rem;
          color: #9ca3af;
        }
        
        .participants-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .participant {
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          border-radius: 0.25rem;
        }
        
        .participant-more {
          font-size: 0.75rem;
          color: #9ca3af;
        }
        
        .session-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.75rem;
          color: #9ca3af;
        }
        
        .meta-item strong {
          color: #ffffff;
        }
      `}</style>
    </div>
  );
};

/**
 * Create Session Form Component
 */
const CreateSessionForm: React.FC<{
  onSubmit: (sessionData: any) => void;
  onClose: () => void;
}> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'chat',
    participants: [],
    scheduledFor: ''
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };
  
  return (
    <div className="create-session-form">
      <div className="form-header">
        <h3>Create New Session</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
          />
        </div>
        
        <div className="form-group">
          <label>Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
          >
            <option value="chat">Chat</option>
            <option value="voice-call">Voice Call</option>
            <option value="video-call">Video Call</option>
            <option value="conference">Conference</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Scheduled For (optional)</label>
          <input
            type="datetime-local"
            value={formData.scheduledFor}
            onChange={(e) => setFormData({...formData, scheduledFor: e.target.value})}
          />
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Create Session
          </button>
        </div>
      </form>
      
      <style jsx>{`
        .create-session-form {
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .form-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #ffffff;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 1.5rem;
          cursor: pointer;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: #ffffff;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 0.875rem;
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
        
        .cancel-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          background: transparent;
          color: #9ca3af;
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
        }
        
        .submit-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          background: #10b981;
          color: #ffffff;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

/**
 * Messages Section
 */
const MessagesSection: React.FC<{
  messages: any[];
  onMessageSend: (messageData: any) => void;
  agents: any[];
}> = ({ messages, onMessageSend, agents }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  
  const handleSend = () => {
    if (newMessage.trim() && selectedAgent) {
      onMessageSend({
        recipientId: selectedAgent,
        content: newMessage,
        type: 'text'
      });
      setNewMessage('');
    }
  };
  
  return (
    <div className="messages-section">
      <div className="messages-container">
        <div className="messages-list">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.status}`}>
              <div className="message-header">
                <span className="message-sender">
                  {message.senderId || 'You'}
                </span>
                <span className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}
        </div>
        
        <div className="message-composer">
          <div className="composer-row">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="agent-select"
            >
              <option value="">Select Agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
          <div className="composer-row">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="message-input"
            />
            <button 
              onClick={handleSend}
              disabled={!newMessage.trim() || !selectedAgent}
              className="send-btn"
            >
              Send
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .messages-section {
          padding: 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .messages-container {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .messages-list {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 1rem;
          padding-right: 1rem;
        }
        
        .message {
          margin-bottom: 1rem;
          padding: 1rem;
          border-radius: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .message.sent {
          border-left: 3px solid #10b981;
        }
        
        .message.received {
          border-left: 3px solid #3b82f6;
        }
        
        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
          color: #9ca3af;
        }
        
        .message-content {
          color: #ffffff;
          line-height: 1.5;
        }
        
        .message-composer {
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem;
        }
        
        .composer-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .agent-select, .message-input {
          flex: 1;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 0.875rem;
        }
        
        .send-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          background: #6366f1;
          color: #ffffff;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .send-btn:disabled {
          background: #374151;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

/**
 * Analytics Section
 */
const AnalyticsSection: React.FC<{
  analytics: any;
  onRefresh: () => void;
}> = ({ analytics, onRefresh }) => {
  if (!analytics) {
    return (
      <div className="analytics-section">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="analytics-section">
      <div className="section-header">
        <h2>Communication Analytics</h2>
        <button onClick={onRefresh} className="refresh-btn">
          Refresh
        </button>
      </div>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Performance Metrics</h3>
          <div className="metrics-list">
            <div className="metric-item">
              <span className="metric-label">Average Latency</span>
              <span className="metric-value">{analytics.performance?.latency?.average || 0}ms</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Throughput</span>
              <span className="metric-value">{analytics.performance?.throughput?.messagesPerSecond || 0} msg/s</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Availability</span>
              <span className="metric-value">{analytics.performance?.availability?.uptime || 0}%</span>
            </div>
          </div>
        </div>
        
        <div className="analytics-card">
          <h3>Quality Metrics</h3>
          <div className="metrics-list">
            <div className="metric-item">
              <span className="metric-label">Communication Score</span>
              <span className="metric-value">{analytics.quality?.communication?.overallScore || 0}/10</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">User Satisfaction</span>
              <span className="metric-value">{analytics.quality?.userSatisfaction?.averageRating || 0}/5</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Content Quality</span>
              <span className="metric-value">{analytics.quality?.contentQuality?.overallQuality || 0}%</span>
            </div>
          </div>
        </div>
        
        <div className="analytics-card">
          <h3>Security Metrics</h3>
          <div className="metrics-list">
            <div className="metric-item">
              <span className="metric-label">Security Score</span>
              <span className="metric-value">{analytics.security?.compliance?.securityScore || 0}/100</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Threats Blocked</span>
              <span className="metric-value">{analytics.security?.threats?.blocked || 0}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Encryption Coverage</span>
              <span className="metric-value">{analytics.security?.encryption?.endToEndEncrypted || 0}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .analytics-section {
          padding: 2rem;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .section-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #ffffff;
        }
        
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .analytics-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 1.5rem;
        }
        
        .analytics-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          color: #ffffff;
        }
        
        .metrics-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .metric-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .metric-label {
          font-size: 0.875rem;
          color: #9ca3af;
        }
        
        .metric-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: #6366f1;
        }
        
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #9ca3af;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top: 3px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

/**
 * Karma Section
 */
const KarmaSection: React.FC<{
  karmaBalance: KarmaBalance;
  axiomId?: AxiomID;
}> = ({ karmaBalance, axiomId }) => {
  const virtuePercentage = karmaBalance.virtuePoints / (karmaBalance.virtuePoints + karmaBalance.vicePoints) * 100;
  const vicePercentage = karmaBalance.vicePoints / (karmaBalance.virtuePoints + karmaBalance.vicePoints) * 100;
  
  return (
    <div className="karma-section">
      <div className="karma-overview">
        <h3>Karma Balance Overview</h3>
        <div className="karma-visualization">
          <div className="karma-bar">
            <div 
              className="karma-fill virtue" 
              style={{ width: `${virtuePercentage}%` }}
            />
            <div 
              className="karma-fill vice" 
              style={{ width: `${vicePercentage}%` }}
            />
          </div>
        </div>
        
        <div className="karma-stats">
          <div className="stat-item">
            <span className="stat-label">Net Balance</span>
            <span className={`stat-value ${karmaBalance.netBalance >= 0 ? 'positive' : 'negative'}`}>
              {karmaBalance.netBalance > 0 ? '+' : ''}{karmaBalance.netBalance}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">State</span>
            <span className={`stat-value state-${karmaBalance.state.toLowerCase()}`}>
              {karmaBalance.state}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Dominance</span>
            <span className="stat-value">{karmaBalance.dominantAgent}</span>
          </div>
        </div>
      </div>
      
      <div className="karma-details">
        <div className="detail-section">
          <h4>Virtue Points</h4>
          <div className="points-display virtue">
            <span className="points-value">{karmaBalance.virtuePoints}</span>
            <div className="points-breakdown">
              {karmaBalance.history
                .filter(h => h.type === 'VIRTUE')
                .slice(0, 5)
                .map((h, i) => (
                  <div key={i} className="history-item">
                    <span className="history-action">{h.action}</span>
                    <span className="history-score">+{h.score}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        <div className="detail-section">
          <h4>Vice Points</h4>
          <div className="points-display vice">
            <span className="points-value">{karmaBalance.vicePoints}</span>
            <div className="points-breakdown">
              {karmaBalance.history
                .filter(h => h.type === 'VICE')
                .slice(0, 5)
                .map((h, i) => (
                  <div key={i} className="history-item">
                    <span className="history-action">{h.action}</span>
                    <span className="history-score">-{h.score}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      
      {karmaBalance.recommendations && karmaBalance.recommendations.length > 0 && (
        <div className="recommendations">
          <h4>Recommendations</h4>
          <ul className="recommendations-list">
            {karmaBalance.recommendations.map((rec, i) => (
              <li key={i} className="recommendation-item">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <style jsx>{`
        .karma-section {
          padding: 2rem;
        }
        
        .karma-overview h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
          color: #ffffff;
        }
        
        .karma-visualization {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .karma-bar {
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
          display: flex;
        }
        
        .karma-fill {
          height: 100%;
          transition: width 0.5s ease;
        }
        
        .karma-fill.virtue {
          background: #10b981;
        }
        
        .karma-fill.vice {
          background: #ef4444;
        }
        
        .karma-stats {
          display: flex;
          gap: 2rem;
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .stat-label {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-bottom: 0.5rem;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .stat-value.positive {
          color: #10b981;
        }
        
        .stat-value.negative {
          color: #ef4444;
        }
        
        .state-blessed {
          color: #10b981;
        }
        
        .state-penance {
          color: #ef4444;
        }
        
        .state-balanced {
          color: #f59e0b;
        }
        
        .karma-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        
        .detail-section h4 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          color: #ffffff;
        }
        
        .points-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .points-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .points-display.virtue .points-value {
          color: #10b981;
        }
        
        .points-display.vice .points-value {
          color: #ef4444;
        }
        
        .points-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .history-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }
        
        .history-action {
          color: #9ca3af;
        }
        
        .history-score {
          font-weight: 600;
        }
        
        .recommendations {
          margin-top: 2rem;
        }
        
        .recommendations h4 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          color: #ffffff;
        }
        
        .recommendations-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .recommendation-item {
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-left: 3px solid #f59e0b;
          border-radius: 0.5rem;
          color: #9ca3af;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default CommunicationHub;