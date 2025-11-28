/**
 * 🕸️ SWARM DASHBOARD - Collaboration Control Center
 * 
 * Main dashboard for agent collaboration with real-time monitoring
 * Integrates with SwarmNetwork visualization and collaboration hub
 * Provides team management, task delegation, and knowledge sharing
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  AlertTriangle,
  Plus,
  Settings,
  BarChart3,
  PieChart,
  Network,
  Eye,
  EyeOff,
  Send,
  CheckCircle,
  XCircle,
  UserPlus,
  Star,
  Hash,
  Filter,
  Search,
  Download,
  Upload,
  Video,
  Calendar,
  Briefcase,
  Award as AwardIcon,
  MessageSquare as MessageIcon,
  UserCheck
} from 'lucide-react';
import SwarmNetwork from '@/components/collaboration/SwarmNetwork';

// ============================================================================
// TYPES
// ============================================================================

interface CollaborationSession {
  id: string;
  name: string;
  description: string;
  type: 'realtime' | 'asynchronous' | 'hybrid';
  status: 'active' | 'paused' | 'completed' | 'failed';
  participants: string[];
  leader: string;
  createdAt: string;
  objectives: string[];
  tasks: Task[];
  knowledge: KnowledgeEntry[];
  metrics: SessionMetrics;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  assignedBy: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'normal' | 'high' | 'critical';
  progress: number;
  deadline?: string;
  createdAt: string;
  sessionId: string;
}

interface KnowledgeEntry {
  id: string;
  title: string;
  type: 'skill' | 'experience' | 'data' | 'pattern' | 'solution';
  contributor: string;
  quality: number;
  usefulness: number;
  createdAt: string;
}

interface SessionMetrics {
  messagesCount: number;
  averageResponseTime: number;
  collaborationEfficiency: number;
  knowledgeShared: number;
  tasksCompleted: number;
}

interface Team {
  id: string;
  name: string;
  description: string;
  type: 'permanent' | 'temporary' | 'project';
  status: 'active' | 'inactive' | 'archived';
  leader: string;
  members: TeamMember[];
  performance: TeamPerformance;
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'busy' | 'away';
  reputation: number;
  contributions: number;
  joinedAt: string;
}

interface TeamPerformance {
  productivity: number;
  quality: number;
  collaboration: number;
  innovation: number;
  efficiency: number;
  satisfaction: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CollaborationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'tasks' | 'teams' | 'knowledge' | 'analytics'>('overview');
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load data on mount
  useEffect(() => {
    loadSessions();
    loadTasks();
    loadTeams();
    loadKnowledge();
  }, []);

  // Load sessions from API
  const loadSessions = async () => {
    try {
      const response = await fetch('/api/collaboration/sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  // Load tasks from API
  const loadTasks = async () => {
    try {
      const response = await fetch('/api/collaboration/tasks');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  // Load teams from API
  const loadTeams = async () => {
    try {
      const response = await fetch('/api/collaboration/teams');
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  // Load knowledge from API
  const loadKnowledge = async () => {
    try {
      const response = await fetch('/api/collaboration/knowledge');
      const data = await response.json();
      setKnowledge(data.knowledge || []);
    } catch (error) {
      console.error('Failed to load knowledge:', error);
    }
  };

  // Create new collaboration session
  const createSession = useCallback(async (sessionData: {
    name: string;
    description: string;
    type: 'realtime' | 'asynchronous' | 'hybrid';
    participants: string[];
    objectives: string[];
  }) => {
    setIsCreatingSession(true);

    try {
      const response = await fetch('/api/collaboration/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      const newSession = await response.json();
      setSessions(prev => [...prev, newSession]);
      setSelectedSession(newSession.id);

      // Load tasks for the new session
      loadTasks();
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsCreatingSession(false);
    }
  }, []);

  // Create new team
  const createTeam = useCallback(async (teamData: {
    name: string;
    description: string;
    type: 'permanent' | 'temporary' | 'project';
    leader: string;
    members: string[];
  }) => {
    setIsCreatingTeam(true);

    try {
      const response = await fetch('/api/collaboration/teams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });

      const newTeam = await response.json();
      setTeams(prev => [...prev, newTeam]);
    } catch (error) {
      console.error('Failed to create team:', error);
    } finally {
      setIsCreatingTeam(false);
    }
  }, []);

  // Filter sessions based on search
  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter tasks based on selected session
  const filteredTasks = tasks.filter(task =>
    !selectedSession || task.sessionId === selectedSession
  );

  // Filter knowledge based on search
  const filteredKnowledge = knowledge.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get session statistics
  const getSessionStats = (session: CollaborationSession) => {
    const totalTasks = tasks.filter(t => t.sessionId === session.id).length;
    const completedTasks = tasks.filter(t =>
      t.sessionId === session.id && t.status === 'completed'
    ).length;
    const activeTasks = tasks.filter(t =>
      t.sessionId === session.id && t.status === 'in_progress'
    ).length;

    return {
      totalTasks,
      completedTasks,
      activeTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
          🕸️ Swarm Collaboration Dashboard
        </h1>
        <p className="text-gray-400">Real-time agent collaboration and coordination center</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'sessions', label: 'Sessions', icon: MessageSquare },
          { id: 'tasks', label: 'Tasks', icon: CheckCircle },
          { id: 'teams', label: 'Teams', icon: Users },
          { id: 'knowledge', label: 'Knowledge', icon: Brain },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${activeTab === tab.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search sessions, tasks, teams, or knowledge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Quick Stats */}
          <div className="lg:col-span-3 grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-400" />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {sessions.length}
                  </div>
                  <div className="text-sm text-gray-400">Active Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {teams.length}
                  </div>
                  <div className="text-sm text-gray-400">Active Teams</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {tasks.length}
                </div>
                <div className="text-sm text-gray-400">Total Tasks</div>
              </div>
            </div>
          </div>


          {/* Swarm Network Visualization */}
          <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Network className="w-6 h-6 text-green-400" />
              Swarm Network
            </h3>
            <div className="h-96">
              <SwarmNetwork />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-orange-400" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {sessions.slice(0, 5).map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${session.status === 'active' ? 'bg-green-400' :
                        session.status === 'completed' ? 'bg-blue-400' :
                          session.status === 'failed' ? 'bg-red-400' : 'bg-gray-400'
                        }`} />
                      <div>
                        <div className="font-medium">{session.name}</div>
                        <div className="text-xs text-gray-400">{session.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">{new Date(session.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'sessions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Create Session Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsCreatingSession(true)}
              disabled={isCreatingSession}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingSession ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  <span>Creating Session...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create New Session</span>
                </>
              )}
            </button>
          </div>

          {/* Sessions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map(session => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedSession(session.id)}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${session.status === 'active' ? 'bg-green-400' :
                        session.status === 'completed' ? 'bg-blue-400' :
                          session.status === 'failed' ? 'bg-red-400' : 'bg-gray-400'
                        }`} />
                      <div>
                        <div className="font-medium">{session.name}</div>
                        <div className="text-xs text-gray-400">{session.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">{new Date(session.createdAt).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{session.participants.length} Agents</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>{session.objectives?.length || 0} Objectives</span>
                    </div>
                  </div>
                </div>

                {/* Session Stats */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Status</div>
                    <div className="font-medium capitalize">{session.status}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Leader</div>
                    <div className="font-medium">{session.leader}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Created</div>
                    <div className="font-medium">{new Date(session.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'tasks' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Task Filters */}
          <div className="flex gap-4 mb-6">
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Tasks List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${task.status === 'completed' ? 'bg-green-400' :
                        task.status === 'in_progress' ? 'bg-blue-400' :
                          task.status === 'failed' ? 'bg-red-400' : 'bg-gray-400'
                        }`} />
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs text-gray-400">ID: {task.id}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${task.priority === 'critical' ? 'bg-red-100 text-white' :
                        task.priority === 'high' ? 'bg-orange-500 text-white' :
                          task.priority === 'normal' ? 'bg-blue-500 text-white' :
                            'bg-gray-500 text-white'
                        }`}>
                        {task.priority.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-400 mb-2">{task.description}</div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-4 h-4 text-gray-400" />
                      <span>{task.assignedTo.length} Assigned</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{task.deadline || 'No deadline'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      <span>{task.progress}% Complete</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'teams' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Create Team Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsCreatingTeam(true)}
              disabled={isCreatingTeam}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingTeam ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  <span>Creating Team...</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>Create New Team</span>
                </>
              )}
            </button>
          </div>

          {/* Teams List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 cursor-pointer hover:border-purple-500 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${team.status === 'active' ? 'bg-green-400' :
                        team.status === 'inactive' ? 'bg-gray-400' :
                          'bg-red-400'
                        }`} />
                      <div>
                        <div className="font-medium">{team.name}</div>
                        <div className="text-xs text-gray-400">{team.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">{new Date(team.createdAt).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{team.members.length} Members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span>Leader: {team.leader}</span>
                    </div>
                  </div>
                </div>

                {/* Team Performance */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Productivity</div>
                    <div className="font-medium">{team.performance?.productivity || 0}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Quality</div>
                    <div className="font-medium">{team.performance?.quality || 0}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Collaboration</div>
                    <div className="font-medium">{team.performance?.collaboration || 0}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Innovation</div>
                    <div className="font-medium">{team.performance?.innovation || 0}%</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div >
      )}

      {
        activeTab === 'knowledge' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Knowledge Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-400" />
                  Knowledge Base Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">
                      {knowledge.length}
                    </div>
                    <div className="text-sm text-gray-400">Total Entries</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {knowledge.filter(k => k.type === 'skill').length}
                  </div>
                  <div className="text-sm text-gray-400">Skills</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {knowledge.filter(k => k.type === 'experience').length}
                </div>
                <div className="text-sm text-gray-400">Experiences</div>
              </div>
            </div>


            {/* Knowledge List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {
                filteredKnowledge.map(entry => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${entry.type === 'skill' ? 'bg-purple-400' :
                            entry.type === 'experience' ? 'bg-blue-400' :
                              entry.type === 'data' ? 'bg-green-400' :
                                entry.type === 'pattern' ? 'bg-orange-400' :
                                  'bg-gray-400'
                            }`} />
                          <div>
                            <div className="font-medium">{entry.title}</div>
                            <div className="text-xs text-gray-400">{entry.type}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>Quality: {entry.quality}/100</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span>Usefulness: {entry.usefulness}/100</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              }
            </div >
          </motion.div >
        )
      }

      {
        activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  Collaboration Analytics
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">247</div>
                      <div className="text-sm text-gray-400">Total Collaborations</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">89%</div>
                      <div className="text-sm text-gray-400">Success Rate</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">1,247</div>
                    <div className="text-sm text-gray-400">Knowledge Shared</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
              <div className="space-y-3">
                {teams.slice(0, 3).map(team => (
                  <div key={team.id} className="bg-gray-900/50 rounded-lg border border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">{team.name}</div>
                        <div className="text-xs text-gray-400">{team.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">{new Date(team.createdAt).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Productivity</div>
                        <div className="font-medium">{team.performance?.productivity || 0}%</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Quality</div>
                        <div className="font-medium">{team.performance?.quality || 0}%</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Collaboration</div>
                        <div className="font-medium">{team.performance?.collaboration || 0}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div >
          </motion.div >
        )
      }
    </div >
  );
};

export default CollaborationDashboard;