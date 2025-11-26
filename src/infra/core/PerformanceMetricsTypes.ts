/**
 * 🎯 AGENT PERFORMANCE METRICS & ANALYTICS TYPES
 * 
 * Comprehensive type definitions for the agent performance monitoring system
 * including metrics collection, analytics, scoring, and visualization.
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

// ============================================================================
// CORE METRICS INTERFACES
// ============================================================================

/**
 * Real-time agent performance metrics
 */
export interface AgentPerformanceMetrics {
  agentId: string;
  timestamp: Date;
  
  // System Resources
  cpu: number; // 0-100%
  memory: number; // 0-100%
  networkLatency: number; // milliseconds
  diskIO: number; // MB/s
  
  // Performance Indicators
  tasksCompleted: number;
  tasksFailed: number;
  successRate: number; // 0-100%
  averageResponseTime: number; // milliseconds
  throughput: number; // tasks/minute
  
  // Quality Metrics
  userSatisfaction: number; // 0-100%
  errorRate: number; // 0-100%
  accuracy: number; // 0-100%
  
  // Agent-Specific
  energyLevel: number; // 0-100%
  activeSuperpowers: string[];
  skillMasteryLevel: number; // 0-100%
  
  // Business Metrics
  revenueGenerated: number;
  costPerTask: number;
  efficiency: number; // output/input ratio
}

/**
 * Historical performance data point
 */
export interface HistoricalDataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

/**
 * Performance trend analysis
 */
export interface PerformanceTrend {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  changeRate: number; // percentage change
  confidence: number; // 0-100%
  prediction: {
    nextHour: number;
    nextDay: number;
    nextWeek: number;
  };
}

/**
 * Anomaly detection result
 */
export interface AnomalyDetection {
  metric: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  anomalyScore: number; // 0-100%
  expectedValue: number;
  actualValue: number;
  deviation: number;
  description: string;
  recommendations: string[];
}

/**
 * Performance alert configuration
 */
export interface PerformanceAlert {
  id: string;
  agentId?: string; // undefined = all agents
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  cooldown: number; // minutes
  notificationChannels: string[];
  lastTriggered?: Date;
}

/**
 * Performance score breakdown
 */
export interface PerformanceScore {
  overall: number; // 0-100
  efficiency: number; // 0-100
  reliability: number; // 0-100
  quality: number; // 0-100
  scalability: number; // 0-100
  costEffectiveness: number; // 0-100
  
  breakdown: {
    cpu: number;
    memory: number;
    responseTime: number;
    successRate: number;
    userSatisfaction: number;
    errorRate: number;
  };
  
  rank: {
    current: number;
    previous: number;
    change: number;
  };
}

/**
 * Agent comparison data
 */
export interface AgentComparison {
  agentId: string;
  agentName: string;
  metrics: {
    [key: string]: number;
  };
  score: PerformanceScore;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

/**
 * Performance benchmark
 */
export interface PerformanceBenchmark {
  category: string;
  metric: string;
  baseline: number;
  target: number;
  excellent: number;
  unit: string;
  description: string;
}

/**
 * Resource utilization report
 */
export interface ResourceUtilizationReport {
  agentId: string;
  period: {
    start: Date;
    end: Date;
  };
  
  cpu: {
    average: number;
    peak: number;
    min: number;
    utilizationRate: number;
  };
  
  memory: {
    average: number;
    peak: number;
    min: number;
    utilizationRate: number;
  };
  
  network: {
    latency: {
      average: number;
      peak: number;
      min: number;
    };
    bandwidth: {
      total: number; // MB
      average: number; // MB/s
    };
  };
  
  cost: {
    compute: number;
    storage: number;
    network: number;
    total: number;
  };
}

/**
 * Performance optimization recommendation
 */
export interface OptimizationRecommendation {
  id: string;
  agentId: string;
  category: 'performance' | 'cost' | 'reliability' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: {
    performance: number; // percentage improvement
    cost: number; // cost reduction percentage
    reliability: number; // reliability improvement
  };
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: string;
    steps: string[];
  };
  status: 'pending' | 'in_progress' | 'implemented' | 'rejected';
}

/**
 * Analytics dashboard configuration
 */
export interface DashboardConfig {
  id: string;
  name: string;
  layout: 'grid' | 'list' | 'cards';
  widgets: DashboardWidget[];
  filters: {
    timeRange: {
      start: Date;
      end: Date;
    };
    agents: string[];
    metrics: string[];
  };
  refreshInterval: number; // seconds
}

/**
 * Dashboard widget definition
 */
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'alert' | 'comparison';
  title: string;
  size: {
    width: number; // grid units
    height: number; // grid units
  };
  position: {
    x: number;
    y: number;
  };
  config: {
    chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
    metrics: string[];
    agents?: string[];
    aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
    timeRange?: string;
  };
}

/**
 * Performance-based superpower unlock
 */
export interface SuperpowerUnlock {
  agentId: string;
  superpowerId: string;
  requirements: {
    performanceScore: number;
    metrics: {
      [key: string]: {
        min: number;
        max?: number;
        duration: number; // days
      };
    };
    achievements: string[];
  };
  progress: {
    currentScore: number;
    metricsProgress: {
      [key: string]: number; // 0-100%
    };
    achievementsCompleted: string[];
    estimatedTime: string;
  };
  unlocked: boolean;
  unlockedAt?: Date;
}

/**
 * WebSocket message types for real-time updates
 */
export interface WebSocketMessage {
  type: 'metrics_update' | 'alert_triggered' | 'anomaly_detected' | 'score_updated' | 'system_status';
  timestamp: Date;
  data: any;
  agentId?: string;
}

/**
 * Export data format
 */
export interface PerformanceExport {
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  data: {
    agents: string[];
    metrics: string[];
    timeRange: {
      start: Date;
      end: Date;
    };
    aggregation?: 'raw' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  };
  options: {
    includeCharts: boolean;
    includeRecommendations: boolean;
    includeAnomalies: boolean;
  };
}

/**
 * System health status
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  agents: {
    total: number;
    healthy: number;
    degraded: number;
    critical: number;
    offline: number;
  };
  metrics: {
    collectionRate: number; // % of expected metrics
    storageUtilization: number; // %
    processingLatency: number; // ms
    errorRate: number; // %
  };
  alerts: {
    active: number;
    resolved: number;
    critical: number;
  };
  lastUpdate: Date;
}

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export enum MetricCategory {
  SYSTEM = 'system',
  PERFORMANCE = 'performance',
  QUALITY = 'quality',
  BUSINESS = 'business',
  CUSTOM = 'custom'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum TrendDirection {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  VOLATILE = 'volatile'
}

export enum TimeRange {
  LAST_HOUR = '1h',
  LAST_6_HOURS = '6h',
  LAST_24_HOURS = '24h',
  LAST_7_DAYS = '7d',
  LAST_30_DAYS = '30d',
  LAST_90_DAYS = '90d',
  CUSTOM = 'custom'
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_PERFORMANCE_THRESHOLDS = {
  cpu: { warning: 70, critical: 90 },
  memory: { warning: 75, critical: 90 },
  responseTime: { warning: 500, critical: 1000 }, // ms
  errorRate: { warning: 5, critical: 15 }, // %
  successRate: { warning: 90, critical: 80 }, // %
  userSatisfaction: { warning: 80, critical: 60 } // %
};

export const DEFAULT_BENCHMARKS: PerformanceBenchmark[] = [
  {
    category: 'system',
    metric: 'cpu',
    baseline: 50,
    target: 30,
    excellent: 20,
    unit: '%',
    description: 'CPU utilization should remain below target for optimal performance'
  },
  {
    category: 'system',
    metric: 'memory',
    baseline: 60,
    target: 40,
    excellent: 30,
    unit: '%',
    description: 'Memory usage should be optimized to prevent swapping'
  },
  {
    category: 'performance',
    metric: 'responseTime',
    baseline: 300,
    target: 200,
    excellent: 100,
    unit: 'ms',
    description: 'Response time should be minimized for better user experience'
  },
  {
    category: 'quality',
    metric: 'successRate',
    baseline: 85,
    target: 95,
    excellent: 99,
    unit: '%',
    description: 'High success rate indicates reliable agent performance'
  }
];

export const METRIC_UNITS = {
  cpu: '%',
  memory: '%',
  networkLatency: 'ms',
  diskIO: 'MB/s',
  tasksCompleted: 'count',
  successRate: '%',
  averageResponseTime: 'ms',
  throughput: 'tasks/min',
  userSatisfaction: '%',
  errorRate: '%',
  accuracy: '%',
  energyLevel: '%',
  revenueGenerated: '$',
  costPerTask: '$',
  efficiency: 'ratio'
};