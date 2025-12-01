/**
 * 📊 PERFORMANCE DASHBOARD
 * 
 * React component for performance monitoring and alerting
 * Provides real-time visualization of optimization metrics
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { IntegratedPerformanceDashboard, PerformanceIntegrationCoordinator } from './PerformanceIntegration';

// ============================================================================
// PERFORMANCE DASHBOARD COMPONENTS
// ============================================================================

interface PerformanceDashboardProps {
  coordinator: PerformanceIntegrationCoordinator;
  refreshInterval?: number;
  showAlerts?: boolean;
  showRecommendations?: boolean;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: number;
  status?: 'good' | 'warning' | 'critical';
  icon?: string;
}

interface AlertItemProps {
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  message: string;
  timestamp: string;
}

interface RecommendationItemProps {
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImprovement: string;
  implementationEffort: string;
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

/**
 * Metric Card Component
 */
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  unit, 
  trend, 
  status, 
  icon 
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend?: number) => {
    if (!trend) return null;
    if (trend > 0) return '📈';
    if (trend < 0) return '📉';
    return '➡️';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <div>
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            <p className={`text-2xl font-bold ${getStatusColor(status)}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
              {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
            </p>
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center space-x-1">
            <span className="text-lg">{getTrendIcon(trend)}</span>
            <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Alert Item Component
 */
const AlertItem: React.FC<AlertItemProps> = ({ 
  severity, 
  category, 
  message, 
  timestamp 
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 border-blue-400 text-blue-700';
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'error': return 'bg-red-100 border-red-400 text-red-700';
      case 'critical': return 'bg-red-200 border-red-600 text-red-900';
      default: return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'critical': return '🚨';
      default: return '📢';
    }
  };

  return (
    <div className={`p-3 mb-2 rounded border-l-4 ${getSeverityColor(severity)}`}>
      <div className="flex items-start space-x-2">
        <span className="text-lg">{getSeverityIcon(severity)}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{category}</h4>
            <span className="text-xs opacity-75">
              {new Date(timestamp).toLocaleString()}
            </span>
          </div>
          <p className="text-sm mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Recommendation Item Component
 */
const RecommendationItem: React.FC<RecommendationItemProps> = ({ 
  priority, 
  title, 
  description, 
  expectedImprovement, 
  implementationEffort 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low': return '🟢 Low';
      case 'medium': return '🔵 Medium';
      case 'high': return '🟠 High';
      case 'critical': return '🔴 Critical';
      default: return '⚪ Unknown';
    }
  };

  return (
    <div className={`p-4 mb-3 rounded-lg border ${getPriorityColor(priority)}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{title}</h4>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(priority)}`}>
          {getPriorityBadge(priority)}
        </span>
      </div>
      <p className="text-sm mb-2">{description}</p>
      <div className="flex items-center justify-between text-xs">
        <span>💡 Expected: {expectedImprovement}</span>
        <span>⏱️ Effort: {implementationEffort}</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PERFORMANCE DASHBOARD COMPONENT
// ============================================================================

/**
 * Performance Dashboard Component
 */
const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  coordinator, 
  refreshInterval = 30000, // 30 seconds
  showAlerts = true,
  showRecommendations = true
}) => {
  const [dashboard, setDashboard] = useState<IntegratedPerformanceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('hour');

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coordinator.getIntegratedDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [coordinator]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchDashboardData]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Handle time range change
  const handleTimeRangeChange = (range: typeof selectedTimeRange) => {
    setSelectedTimeRange(range);
    // In a real implementation, this would trigger a new data fetch with the time range
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading performance dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-red-600 text-xl">❌</span>
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                🚀 Performance Optimization Dashboard
              </h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                dashboard.system_overview.overall_health_score > 80 ? 'bg-green-100 text-green-800' :
                dashboard.system_overview.overall_health_score > 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                Health: {dashboard.system_overview.overall_health_score.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={selectedTimeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value as typeof selectedTimeRange)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                aria-label="Select time range for dashboard data"
              >
                <option value="hour">Last Hour</option>
                <option value="day">Last 24 Hours</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
              
              {/* Auto-refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-md text-sm font-medium ${
                  autoRefresh 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
              </button>
              
              {/* Manual Refresh */}
              <button
                onClick={handleRefresh}
                className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* System Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Optimization Level"
              value={dashboard.system_overview.total_optimization_level}
              icon="⚙️"
              status="good"
            />
            <MetricCard
              title="Performance Improvement"
              value={`${dashboard.system_overview.performance_improvement_percentage.toFixed(1)}%`}
              unit="%"
              trend={5.2}
              status="good"
              icon="📈"
            />
            <MetricCard
              title="Cost Savings"
              value={`${dashboard.system_overview.cost_savings_percentage.toFixed(1)}%`}
              unit="%"
              trend={2.1}
              status="good"
              icon="💰"
            />
            <MetricCard
              title="Health Score"
              value={dashboard.system_overview.overall_health_score.toFixed(0)}
              unit="%"
              status={dashboard.system_overview.overall_health_score > 80 ? 'good' : 
                     dashboard.system_overview.overall_health_score > 60 ? 'warning' : 'critical'}
              icon="💚"
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Research Performance */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">🔍 Research Performance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard
                title="Queries/Second"
                value={dashboard.research_performance.queries_per_second.toFixed(1)}
                unit="q/s"
                trend={1.5}
                status="good"
                icon="📊"
              />
              <MetricCard
                title="Cache Hit Rate"
                value={`${(dashboard.research_performance.cache_hit_rate * 100).toFixed(1)}%`}
                unit="%"
                trend={3.2}
                status="good"
                icon="🗄️"
              />
              <MetricCard
                title="Avg Latency"
                value={dashboard.research_performance.average_latency_ms.toFixed(0)}
                unit="ms"
                trend={-2.1}
                status={dashboard.research_performance.average_latency_ms < 2000 ? 'good' : 'warning'}
                icon="⏱️"
              />
              <MetricCard
                title="Success Rate"
                value={`${(dashboard.research_performance.success_rate * 100).toFixed(1)}%`}
                unit="%"
                trend={0.8}
                status="good"
                icon="✅"
              />
            </div>
          </div>

          {/* Worker Performance */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">⚖️ Worker Performance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard
                title="Total Workers"
                value={dashboard.worker_performance.total_workers}
                icon="👥"
                status="good"
              />
              <MetricCard
                title="Active Workers"
                value={dashboard.worker_performance.active_workers}
                trend={2}
                status="good"
                icon="🏃"
              />
              <MetricCard
                title="Utilization Rate"
                value={`${(dashboard.worker_performance.utilization_rate * 100).toFixed(1)}%`}
                unit="%"
                trend={-1.2}
                status={dashboard.worker_performance.utilization_rate < 0.8 ? 'good' : 'warning'}
                icon="📊"
              />
              <MetricCard
                title="Load Balance Score"
                value={dashboard.worker_performance.load_balance_score.toFixed(2)}
                trend={1.8}
                status="good"
                icon="⚖️"
              />
            </div>
          </div>
        </div>

        {/* Memory and Network Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Memory Performance */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">🧠 Memory Performance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard
                title="Heap Usage"
                value={dashboard.memory_performance.heap_usage_mb.toFixed(0)}
                unit="MB"
                trend={0.5}
                status={dashboard.memory_performance.heap_usage_mb < 1024 ? 'good' : 'warning'}
                icon="💾"
              />
              <MetricCard
                title="Compression Savings"
                value={dashboard.memory_performance.compression_savings_mb.toFixed(1)}
                unit="MB"
                trend={4.2}
                status="good"
                icon="🗜️"
              />
              <MetricCard
                title="GC Frequency"
                value={dashboard.memory_performance.gc_frequency}
                unit="/min"
                trend={-0.8}
                status="good"
                icon="🗑️"
              />
              <MetricCard
                title="Memory Leaks"
                value={dashboard.memory_performance.memory_leaks_detected}
                trend={0}
                status={dashboard.memory_performance.memory_leaks_detected === 0 ? 'good' : 'critical'}
                icon="🔍"
              />
            </div>
          </div>

          {/* Network Performance */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">🌐 Network Performance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard
                title="Requests/Second"
                value={dashboard.network_performance.requests_per_second.toFixed(1)}
                unit="r/s"
                trend={2.1}
                status="good"
                icon="📡"
              />
              <MetricCard
                title="Avg Response Time"
                value={dashboard.network_performance.average_response_time.toFixed(0)}
                unit="ms"
                trend={-1.5}
                status={dashboard.network_performance.average_response_time < 500 ? 'good' : 'warning'}
                icon="⏱️"
              />
              <MetricCard
                title="Bandwidth Utilization"
                value={`${(dashboard.network_performance.bandwidth_utilization).toFixed(1)}%`}
                unit="%"
                trend={0.3}
                status="good"
                icon="📶"
              />
              <MetricCard
                title="Retry Rate"
                value={`${(dashboard.network_performance.retry_rate * 100).toFixed(1)}%`}
                unit="%"
                trend={-0.5}
                status="good"
                icon="🔄"
              />
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {showAlerts && dashboard.alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">🚨 Active Alerts</h2>
            <div className="space-y-2">
              {dashboard.alerts.map((alert, index) => (
                <AlertItem
                  key={index}
                  severity={alert.severity}
                  category={alert.category}
                  message={alert.message}
                  timestamp={alert.timestamp}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {showRecommendations && dashboard.recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">💡 Optimization Recommendations</h2>
            <div className="space-y-3">
              {dashboard.recommendations.map((rec, index) => (
                <RecommendationItem
                  key={index}
                  priority={rec.priority}
                  title={rec.title}
                  description={rec.description}
                  expectedImprovement={rec.expected_improvement}
                  implementationEffort={rec.implementation_effort}
                />
              ))}
            </div>
          </div>
        )}

        {/* Active Optimizations */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">⚡ Active Optimizations</h2>
          <div className="flex flex-wrap gap-2">
            {dashboard.system_overview.active_optimizations.map((opt, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >
                {opt}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;