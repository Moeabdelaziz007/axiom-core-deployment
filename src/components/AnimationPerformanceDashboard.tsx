/**
 * Animation Performance Dashboard
 * 
 * Real-time visualization of animation performance metrics
 * including frame rates, memory usage, and optimization recommendations
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Database,
  Cpu,
  AlertTriangle,
  Eye,
  EyeOff,
  Download,
  Settings
} from 'lucide-react';
import { 
  animationPerformanceMonitor,
  subscribeToPerformanceUpdates,
  type AnimationMetrics
} from '@/utils/animationPerformanceMonitor';

interface AnimationPerformanceDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AnimationPerformanceDashboard: React.FC<AnimationPerformanceDashboardProps> = ({
  isVisible,
  onClose
}) => {
  const [metrics, setMetrics] = useState<AnimationMetrics | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'details' | 'recommendations'>('overview');
  const [history, setHistory] = useState<AnimationMetrics[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);

  // Subscribe to performance updates
  useEffect(() => {
    if (!isVisible) return;

    unsubscribeRef.current = subscribeToPerformanceUpdates((newMetrics) => {
      setMetrics(newMetrics);
      setHistory(prev => [...prev.slice(-99), newMetrics]); // Keep last 100 entries
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isVisible]);

  // Draw performance chart
  useEffect(() => {
    if (!metrics || !chartRef.current || !isExpanded) return;

    const canvas = chartRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 30);
    ctx.lineTo(canvas.width, canvas.height - 30);
    ctx.stroke();
    
    // Draw frame rate line
    ctx.strokeStyle = metrics.frameRate >= 55 ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const maxDataPoints = 50;
    const dataPoints = history.slice(-maxDataPoints);
    
    if (dataPoints.length > 1) {
      const xStep = canvas.width / (maxDataPoints - 1);
      
      dataPoints.forEach((point, index) => {
        const x = index * xStep;
        const y = canvas.height - 30 - (point.frameRate / 60) * (canvas.height - 60);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    }
    
    // Draw target line
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 30 - (60 / 60) * (canvas.height - 60));
    ctx.lineTo(canvas.width, canvas.height - 30 - (60 / 60) * (canvas.height - 60));
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px monospace';
    ctx.fillText('60 FPS', 5, canvas.height - 35);
    ctx.fillText(`${metrics.frameRate} FPS`, canvas.width - 50, canvas.height - 35);
    
  }, [metrics, history, isExpanded]);

  // Format bytes to human readable
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get performance status color
  const getPerformanceColor = (value: number, target: number, inverse = false): string => {
    const ratio = inverse ? target / value : value / target;
    if (ratio >= 0.9) return 'text-green-400';
    if (ratio >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Get trend icon
  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  // Export performance data
  const handleExport = useCallback(() => {
    if (!metrics) return;
    
    const data = {
      currentMetrics: metrics,
      history: history.slice(-50), // Last 50 entries
      timestamp: new Date().toISOString(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        pixelRatio: window.devicePixelRatio,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        colorDepth: window.screen.colorDepth
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `animation-performance-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [metrics, history]);

  if (!isVisible || !metrics) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl"
      style={{ width: isExpanded ? '600px' : '400px', maxHeight: '80vh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Animation Performance</h3>
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

      {/* Main Content */}
      <div className="p-4">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-gray-400">Frame Rate</span>
                </div>
                <div className={`text-2xl font-bold ${getPerformanceColor(metrics.frameRate, 60)}`}>
                  {metrics.frameRate} FPS
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Target: 60 FPS
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">Memory Usage</span>
                </div>
                <div className={`text-2xl font-bold ${getPerformanceColor(metrics.memoryUsage, 30, true)}`}>
                  {formatBytes(metrics.memoryUsage)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {metrics.memoryUsage < 30 * 1024 * 1024 ? 'Good' : 
                   metrics.memoryUsage < 50 * 1024 * 1024 ? 'High' : 'Critical'}
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            {isExpanded && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-400">Frame Rate History</span>
                </div>
                <canvas
                  ref={chartRef}
                  width={500}
                  height={200}
                  className="w-full border border-gray-700 rounded"
                />
              </div>
            )}

            {/* Additional Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Frame Drops</div>
                <div className={`text-lg font-semibold ${getPerformanceColor(100 - metrics.frameDrops, 95, true)}`}>
                  {metrics.frameDrops}
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Avg Frame Time</div>
                <div className={`text-lg font-semibold ${getPerformanceColor(metrics.averageFrameTime, 16.67, true)}`}>
                  {metrics.averageFrameTime.toFixed(1)}ms
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">GPU Acceleration</div>
                <div className={`text-lg font-semibold ${metrics.gpuAcceleration ? 'text-green-400' : 'text-red-400'}`}>
                  {metrics.gpuAcceleration ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Tab */}
        {selectedTab === 'details' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Device Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Pixel Ratio:</span>
                  <span className="text-white">{window.devicePixelRatio || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Screen Resolution:</span>
                  <span className="text-white">{window.screen.width}x{window.screen.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Color Depth:</span>
                  <span className="text-white">{window.screen.colorDepth} bit</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Performance Thresholds</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Target FPS:</span>
                  <span className="text-white">60</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Min Acceptable FPS:</span>
                  <span className="text-white">55</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Frame Time:</span>
                  <span className="text-white">16.67ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Memory Usage:</span>
                  <span className="text-white">50MB</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {selectedTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Performance Recommendations
              </h4>
              
              {animationPerformanceMonitor.getRecommendations().length > 0 ? (
                <div className="space-y-2">
                  {animationPerformanceMonitor.getRecommendations().map((recommendation, index) => (
                    <div key={index} className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
                      <p className="text-yellow-200 text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Settings className="w-8 h-8 mx-auto mb-2" />
                  <p>No performance issues detected</p>
                  <p className="text-sm text-gray-500">Animation performance is optimal</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-t border-gray-700">
        {(['overview', 'details', 'recommendations'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              selectedTab === tab
                ? 'text-purple-400 border-b-2 border-purple-400 bg-gray-800'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default AnimationPerformanceDashboard;