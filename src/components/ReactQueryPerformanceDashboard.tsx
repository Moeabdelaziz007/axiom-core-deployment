/**
 * React Query Performance Dashboard
 * 
 * Real-time visualization of React Query performance metrics
 * including response times, memory usage, polling efficiency, and recommendations
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Database,
  RefreshCw,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { useReactQueryPerformanceMonitor } from '@/hooks/useReactQueryPerformanceMonitor';

interface PerformanceDashboardProps {
  isVisible: boolean;
  onClose: () => void;
  pollingQueries?: Array<{
    queryKey: string[];
    interval: number;
  }>;
}

const ReactQueryPerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isVisible,
  onClose,
  pollingQueries = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'queries' | 'memory' | 'polling'>('overview');
  
  const { performanceData, exportMetrics } = useReactQueryPerformanceMonitor({
    componentName: 'PerformanceDashboard',
    enableRenderTracking: false,
    pollingQueries
  });

  // Format bytes to human readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format response time with color coding
  const formatResponseTime = (ms: number): { text: string; color: string } => {
    if (ms < 50) return { text: `${ms.toFixed(1)}ms`, color: 'text-green-400' };
    if (ms < 100) return { text: `${ms.toFixed(1)}ms`, color: 'text-yellow-400' };
    return { text: `${ms.toFixed(1)}ms`, color: 'text-red-400' };
  };

  // Get trend icon based on memory trend
  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  // Export performance data
  const handleExport = () => {
    const data = exportMetrics();
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `react-query-performance-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!isVisible || !performanceData) return null;

  const { summary, metrics, recommendations } = performanceData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-md"
      style={{ maxHeight: isExpanded ? '80vh' : 'auto' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">React Query Performance</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            title="Export metrics"
          >
            <Download className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Avg Response</span>
          </div>
          <div className={`text-lg font-semibold ${formatResponseTime(summary.averageResponseTime).color}`}>
            {formatResponseTime(summary.averageResponseTime).text}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Memory Trend</span>
          </div>
          <div className="flex items-center gap-1">
            {getTrendIcon(summary.memoryTrend)}
            <span className="text-lg font-semibold capitalize text-white">
              {summary.memoryTrend}
            </span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Polling Efficiency</span>
          </div>
          <div className={`text-lg font-semibold ${
            summary.pollingEfficiency >= 90 ? 'text-green-400' : 
            summary.pollingEfficiency >= 70 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {summary.pollingEfficiency.toFixed(1)}%
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-400">Slow Queries</span>
          </div>
          <div className={`text-lg font-semibold ${
            summary.slowQueries > 0 ? 'text-red-400' : 'text-green-400'
          }`}>
            {summary.slowQueries}
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {(['overview', 'queries', 'memory', 'polling'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  selectedTab === tab
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            <AnimatePresence mode="wait">
              {selectedTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Recommendations
                      </h4>
                      <div className="space-y-2">
                        {recommendations.map((rec, index) => (
                          <div key={index} className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
                            <p className="text-sm text-yellow-200">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Quick Stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Queries:</span>
                        <span className="text-white">{summary.totalQueries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Memory Samples:</span>
                        <span className="text-white">{metrics.memory.length}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'queries' && (
                <motion.div
                  key="queries"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <h4 className="font-semibold text-gray-300 mb-3">Recent Queries</h4>
                  {metrics.queries.slice(-10).reverse().map((query, index) => {
                    const responseTime = formatResponseTime(query.responseTime);
                    return (
                      <div key={index} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400 font-mono">
                            {JSON.stringify(query.queryKey)}
                          </span>
                          <span className={`text-xs font-semibold ${responseTime.color}`}>
                            {responseTime.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Size: {formatBytes(query.dataSize)}</span>
                          <span>Cache: {query.cacheHit ? 'Hit' : 'Miss'}</span>
                          <span>Stale: {query.stale ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {selectedTab === 'memory' && (
                <motion.div
                  key="memory"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <h4 className="font-semibold text-gray-300 mb-3">Memory Usage</h4>
                  {metrics.memory.slice(-10).reverse().map((memory, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">
                          {new Date(memory.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatBytes(memory.heapUsed)} / {formatBytes(memory.heapTotal)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                          style={{ width: `${(memory.heapUsed / memory.heapTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {selectedTab === 'polling' && (
                <motion.div
                  key="polling"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <h4 className="font-semibold text-gray-300 mb-3">Polling Metrics</h4>
                  {metrics.polling.map((polling, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 font-mono">
                          {JSON.stringify(polling.queryKey)}
                        </span>
                        <span className={`text-xs font-semibold ${
                          polling.pollingEfficiency >= 90 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {((polling.totalPolls - polling.missedIntervals) / polling.totalPolls * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Interval: {polling.interval}ms</span>
                        <span>Actual: {polling.actualInterval.toFixed(0)}ms</span>
                        <span>Missed: {polling.missedIntervals}</span>
                        <span>Total: {polling.totalPolls}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ReactQueryPerformanceDashboard;