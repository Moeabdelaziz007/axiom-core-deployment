/**
 * 📊 Error Handling Performance Dashboard
 * 
 * Real-time performance monitoring dashboard for error handling paths.
 * Displays metrics, charts, and recommendations for error handling performance.
 * 
 * Features:
 * - Real-time performance metrics
 * - Memory usage visualization
 * - Error handling benchmarks
 * - Performance recommendations
 * - Load testing results
 * - Performance trend analysis
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Memory, 
  Zap, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  Settings,
  Info
} from 'lucide-react';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface PerformanceMetrics {
  timestamp: number;
  duration: number;
  memoryDelta: number;
  errorType: string;
  success: boolean;
  operationType: string;
}

interface MemorySnapshot {
  timestamp: number;
  memory: {
    used: number;
    total: number;
    limit: number;
  };
  activeOperations: number;
}

interface BenchmarkResult {
  name: string;
  averageDuration: number;
  successRate: number;
  averageMemoryDelta: number;
  iterations: number;
}

interface PerformanceRecommendation {
  category: 'performance' | 'memory' | 'reliability';
  priority: 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
}

interface DashboardData {
  metrics: PerformanceMetrics[];
  memorySnapshots: MemorySnapshot[];
  benchmarks: BenchmarkResult[];
  recommendations: PerformanceRecommendation[];
  summary: {
    totalOperations: number;
    successRate: number;
    averageResponseTime: number;
    memoryTrend: 'increasing' | 'decreasing' | 'stable';
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#10b981';
    default: return '#6b7280';
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'performance': return '#3b82f6';
    case 'memory': return '#8b5cf6';
    case 'reliability': return '#f59e0b';
    default: return '#6b7280';
  }
};

// ============================================================================
// DASHBOARD COMPONENTS
// ============================================================================

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}> = ({ title, value, icon, trend, color = '#3b82f6' }) => (
  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className="flex items-center space-x-2">
        {trend && (
          <div className={`flex items-center ${
            trend === 'up' ? 'text-green-400' : 
            trend === 'down' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4" />}
            {trend === 'stable' && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
          </div>
        )}
        <div style={{ color }} className="p-2 rounded-lg bg-opacity-20" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
      </div>
    </div>
  </div>
);

const RecommendationCard: React.FC<{ recommendation: PerformanceRecommendation }> = ({ recommendation }) => (
  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-3">
    <div className="flex items-start space-x-3">
      <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${getCategoryColor(recommendation.category)}20` }}>
        <AlertTriangle className="w-4 h-4" style={{ color: getCategoryColor(recommendation.category) }} />
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-white font-medium">{recommendation.message}</span>
          <span className={`px-2 py-1 rounded text-xs font-medium`} 
                style={{ backgroundColor: `${getPriorityColor(recommendation.priority)}20`, color: getPriorityColor(recommendation.priority) }}>
            {recommendation.priority}
          </span>
        </div>
        <p className="text-gray-400 text-sm">{recommendation.suggestion}</p>
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

const ErrorHandlingPerformanceDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | 'all'>('1h');

  // Simulate data fetching - in real app, this would come from performance analyzer
  const fetchPerformanceData = useCallback(async () => {
    setLoading(true);
    
    try {
      // Simulate API call to performance analyzer
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock data for demonstration
      const now = Date.now();
      const metrics: PerformanceMetrics[] = [];
      const memorySnapshots: MemorySnapshot[] = [];
      
      // Generate sample metrics
      for (let i = 0; i < 100; i++) {
        const timestamp = now - (i * 60000); // 1 minute intervals
        metrics.push({
          timestamp,
          duration: Math.random() * 100 + 20,
          memoryDelta: Math.random() * 1000000 - 500000,
          errorType: ['network', 'service', 'validation', 'timeout'][Math.floor(Math.random() * 4)],
          success: Math.random() > 0.2,
          operationType: ['agent_error', 'recovery', 'metrics'][Math.floor(Math.random() * 3)]
        });
        
        memorySnapshots.push({
          timestamp,
          memory: {
            used: 10 * 1024 * 1024 + Math.random() * 5 * 1024 * 1024,
            total: 20 * 1024 * 1024,
            limit: 50 * 1024 * 1024
          },
          activeOperations: Math.floor(Math.random() * 10)
        });
      }
      
      const benchmarks: BenchmarkResult[] = [
        { name: 'Agent Error Injection', averageDuration: 45, successRate: 98, averageMemoryDelta: 1024000, iterations: 100 },
        { name: 'Agent Recovery', averageDuration: 32, successRate: 100, averageMemoryDelta: 512000, iterations: 100 },
        { name: 'React Query Error', averageDuration: 28, successRate: 95, averageMemoryDelta: 256000, iterations: 100 },
        { name: 'Error Boundary', averageDuration: 15, successRate: 99, averageMemoryDelta: 128000, iterations: 100 }
      ];
      
      const recommendations: PerformanceRecommendation[] = [
        {
          category: 'performance',
          priority: 'medium',
          message: 'Error handling takes 45ms on average for agent error injection',
          suggestion: 'Consider optimizing error injection logic to reduce overhead'
        },
        {
          category: 'memory',
          priority: 'low',
          message: 'Memory usage is stable with minimal growth',
          suggestion: 'Current memory management is effective'
        },
        {
          category: 'reliability',
          priority: 'high',
          message: 'React Query error handling has 95% success rate',
          suggestion: 'Investigate the 5% failure cases to improve reliability'
        }
      ];
      
      const successfulOps = metrics.filter(m => m.success).length;
      const totalOps = metrics.length;
      
      setData({
        metrics,
        memorySnapshots,
        benchmarks,
        recommendations,
        summary: {
          totalOperations: totalOps,
          successRate: (successfulOps / totalOps) * 100,
          averageResponseTime: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length,
          memoryTrend: 'stable'
        }
      });
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchPerformanceData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchPerformanceData]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-8 h-8 mx-auto mb-4 text-red-400" />
          <p>Failed to load performance data</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const performanceChartData = data.metrics.slice(-50).map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    duration: m.duration,
    memoryDelta: m.memoryDelta / 1024, // Convert to KB
    success: m.success ? 1 : 0
  }));

  const memoryChartData = data.memorySnapshots.slice(-50).map(s => ({
    time: new Date(s.timestamp).toLocaleTimeString(),
    used: s.memory.used / 1024 / 1024, // Convert to MB
    total: s.memory.total / 1024 / 1024,
    activeOps: s.activeOperations
  }));

  const errorTypeData = Object.entries(
    data.metrics.reduce((acc, m) => {
      if (!m.success) {
        acc[m.errorType] = (acc[m.errorType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({
    name: type,
    value: count,
    color: type === 'network' ? '#ef4444' : type === 'service' ? '#f59e0b' : type === 'validation' ? '#3b82f6' : '#8b5cf6'
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Error Handling Performance Dashboard</h1>
            <p className="text-gray-400">Real-time monitoring and analysis of error handling performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>{autoRefresh ? 'Auto-refresh' : 'Manual'}</span>
            </button>
            <button
              onClick={fetchPerformanceData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Operations"
            value={data.summary.totalOperations.toLocaleString()}
            icon={<Activity className="w-6 h-6" />}
            color="#3b82f6"
          />
          <MetricCard
            title="Success Rate"
            value={`${data.summary.successRate.toFixed(1)}%`}
            icon={<CheckCircle className="w-6 h-6" />}
            trend={data.summary.successRate > 95 ? 'up' : data.summary.successRate < 90 ? 'down' : 'stable'}
            color={data.summary.successRate > 95 ? '#10b981' : data.summary.successRate < 90 ? '#ef4444' : '#f59e0b'}
          />
          <MetricCard
            title="Avg Response Time"
            value={formatDuration(data.summary.averageResponseTime)}
            icon={<Clock className="w-6 h-6" />}
            trend={data.summary.averageResponseTime < 50 ? 'up' : 'down'}
            color={data.summary.averageResponseTime < 50 ? '#10b981' : '#ef4444'}
          />
          <MetricCard
            title="Memory Trend"
            value={data.summary.memoryTrend}
            icon={<Memory className="w-6 h-6" />}
            trend={data.summary.memoryTrend === 'stable' ? 'stable' : data.summary.memoryTrend === 'increasing' ? 'up' : 'down'}
            color={data.summary.memoryTrend === 'stable' ? '#10b981' : data.summary.memoryTrend === 'increasing' ? '#ef4444' : '#3b82f6'}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Over Time */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Line type="monotone" dataKey="duration" stroke="#3b82f6" name="Duration (ms)" strokeWidth={2} />
                <Line type="monotone" dataKey="memoryDelta" stroke="#8b5cf6" name="Memory Delta (KB)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Memory Usage */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={memoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Area type="monotone" dataKey="used" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Used (MB)" />
                <Area type="monotone" dataKey="total" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Total (MB)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Benchmarks */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Performance Benchmarks</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.benchmarks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Bar dataKey="averageDuration" fill="#3b82f6" name="Avg Duration (ms)" />
                <Bar dataKey="successRate" fill="#10b981" name="Success Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Error Types Distribution */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Error Types Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={errorTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {errorTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Info className="w-5 h-5" />
              <span>Performance Recommendations</span>
            </h3>
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <RecommendationCard key={index} recommendation={rec} />
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Performance Settings</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Refresh Interval
                </label>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value={1000}>1 second</option>
                  <option value={5000}>5 seconds</option>
                  <option value={10000}>10 seconds</option>
                  <option value={30000}>30 seconds</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Time Range
                </label>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="1h">Last hour</option>
                  <option value="6h">Last 6 hours</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="all">All time</option>
                </select>
              </div>

              <button
                onClick={() => {
                  const dataStr = JSON.stringify(data, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `performance-data-${new Date().toISOString()}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Performance Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandlingPerformanceDashboard;