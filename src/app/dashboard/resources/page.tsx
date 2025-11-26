/**
 * 📊 AXIOM ENERGY GRID - Resource Monitor Dashboard
 * 
 * Real-time resource monitoring dashboard for Axiom agents
 * displaying CPU/RAM gauges, cost graphs, and scaling activity.
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/DashboardCard';
import {
  ResourceMetrics,
  ResourceQuota,
  ResourceAlert,
  ResourceType,
  ResourceTier
} from '@/types/agentResources';

import {
  ResourceAllocationChart,
  UtilizationMetrics,
  ActivityLog
} from '@/components/resources/ResourceComponents';
// ============================================================================

interface ResourceGaugeProps {
  title: string;
  current: number;
  quota: number;
  unit: string;
  color: string;
  threshold?: number;
}

function ResourceGauge({ title, current, quota, unit, color, threshold = 80 }: ResourceGaugeProps) {
  const utilizationPercent = quota > 0 ? (current / quota) * 100 : 0;
  const isWarning = utilizationPercent > threshold;
  const isCritical = utilizationPercent > 95;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <span className={`text-sm font-medium ${isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600'
          }`}>
          {utilizationPercent.toFixed(1)}%
        </span>
      </div>

      {/* Gauge visualization */}
      <div className="relative w-full h-32 mb-4">
        <div className="absolute inset-0 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
          />
        </div>

        {/* Threshold markers */}
        <div
          className="absolute top-0 h-full border-l-2 border-red-500"
          style={{ left: `${threshold}%` }}
        />
        <div
          className="absolute top-0 h-full border-l-2 border-yellow-500"
          style={{ left: `${threshold * 0.8}%` }}
        />

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {current.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              / {quota.toLocaleString()} {unit}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Current:</span>
          <span className="font-medium ml-1">{current.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-500">Quota:</span>
          <span className="font-medium ml-1">{quota.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-500">Remaining:</span>
          <span className="font-medium ml-1">{Math.max(0, quota - current).toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-500">Reset in:</span>
          <span className="font-medium ml-1">24h</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COST CHART COMPONENT
// ============================================================================

interface CostChartProps {
  title: string;
  data: Array<{ time: string; cost: number }>;
  currency: string;
  budget?: number;
}

function CostChart({ title, data, currency, budget }: CostChartProps) {
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
  const budgetUtilization = budget ? (totalCost / budget) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">
            {currency} {totalCost.toFixed(2)}
          </div>
          {budget && (
            <div className={`text-sm font-medium ${budgetUtilization > 90 ? 'text-red-600' :
              budgetUtilization > 75 ? 'text-yellow-600' : 'text-green-600'
              }`}>
              {budgetUtilization.toFixed(1)}% of budget
            </div>
          )}
        </div>
      </div>

      {/* Simple line chart visualization */}
      <div className="h-48 mb-4">
        <div className="relative h-full">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 25, 50, 75, 100].map((percent, i) => (
              <div key={i} className="border-t border-gray-200" style={{ height: '20%' }} />
            ))}
          </div>

          {/* Cost line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              points={data.map((item, i) => {
                const x = (i / (data.length - 1)) * 380 + 10;
                const y = 190 - (item.cost / Math.max(...data.map(d => d.cost))) * 170;
                return `${x},${y}`;
              }).join(' ')}
            />

            {/* Budget line */}
            {budget && (
              <line
                x1="10"
                y1={190 - (budget / Math.max(...data.map(d => d.cost))) * 170}
                x2="390"
                y2={190 - (budget / Math.max(...data.map(d => d.cost))) * 170}
                stroke="#EF4444"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Cost breakdown */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-500">Today</div>
          <div className="font-medium text-gray-800">
            {currency} {data[data.length - 1]?.cost.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Avg/Day</div>
          <div className="font-medium text-gray-800">
            {currency} {(totalCost / Math.max(data.length, 1)).toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Forecast</div>
          <div className="font-medium text-gray-800">
            {currency} {(totalCost * 1.1).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SCALING ACTIVITY COMPONENT
// ============================================================================

interface ScalingActivityProps {
  events: Array<{
    timestamp: Date;
    type: 'scale_up' | 'scale_down';
    resource: string;
    reason: string;
  }>;
}

function ScalingActivity({ events }: ScalingActivityProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Scaling Activity</h3>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No scaling events in the last 24 hours
          </div>
        ) : (
          events.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${event.type === 'scale_up' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                <div>
                  <div className="font-medium text-gray-800">
                    {event.type === 'scale_up' ? 'Scaled Up' : 'Scaled Down'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {event.resource}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {event.reason}
              </div>
              <div className="text-xs text-gray-500">
                {event.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function ResourceMonitorDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<string>('aqar');
  const [resourceMetrics, setResourceMetrics] = useState<ResourceMetrics | null>(null);
  const [resourceQuota, setResourceQuota] = useState<ResourceQuota | null>(null);
  const [alerts, setAlerts] = useState<ResourceAlert[]>([]);
  const [costData, setCostData] = useState<Array<{ time: string; cost: number }>>([]);
  const [scalingEvents, setScalingEvents] = useState<ScalingActivityProps['events']>([]);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      // Update resource metrics
      setResourceMetrics({
        agentId: selectedAgent,
        timestamp: new Date(),
        current: {
          compute: {
            usageMS: 1800000,
            quotaMS: 3600000,
            utilizationPercent: 50
          },
          aiTokens: {
            usageTokens: 500000,
            quotaTokens: 1000000,
            utilizationPercent: 50
          },
          storage: {
            usageKB: 5242880,
            quotaKB: 10485760,
            utilizationPercent: 50
          },
          network: {
            usageReqs: 5000,
            quotaReqs: 10000,
            utilizationPercent: 50
          },
          blockchain: {
            usageLamports: 5000000,
            quotaLamports: 10000000,
            utilizationPercent: 50
          }
        },
        performance: {
          responseTime: { avg: 150, p95: 250, p99: 400 },
          throughput: { requestsPerSecond: 10, tokensPerSecond: 50, computeMSPerSecond: 1000 },
          errorRate: { percentage: 2, count: 5, totalRequests: 250 },
          efficiency: { costPerTask: 0.05, resourceWastePercent: 15, optimizationScore: 85 }
        },
        cost: {
          currentSpendUSD: 2.50,
          projectedDailySpendUSD: 5.00,
          projectedMonthlySpendUSD: 150.00,
          budgetUtilizationPercent: 45,
          costPerUnit: {
            compute: 0.00001,
            aiTokens: 0.000001,
            storage: 0.000001,
            network: 0.001,
            blockchain: 0.000001
          }
        }
      });

      // Update resource quota
      setResourceQuota({
        agentId: selectedAgent,
        tier: 'PRO' as ResourceTier,
        period: 'DAILY',
        limits: {
          'COMPUTE_MS': 3600000,
          'AI_TOKENS': 1000000,
          'STORAGE_KB': 10485760,
          'NETWORK_REQS': 10000,
          'SOLANA_LAMPORTS': 10000000
        },
        used: {
          'COMPUTE_MS': 1800000,
          'AI_TOKENS': 500000,
          'STORAGE_KB': 5242880,
          'NETWORK_REQS': 5000,
          'SOLANA_LAMPORTS': 5000000
        },
        resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Update cost data
      setCostData(prev => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        const newCost = 2.50 + Math.random() * 0.5;

        const updated = [...prev.slice(-23), { time: timeStr, cost: newCost }];
        return updated;
      });

      // Update alerts
      setAlerts([
        {
          id: '1',
          agentId: selectedAgent,
          type: 'EFFICIENCY_LOW',
          severity: 'warning',
          threshold: 60,
          currentValue: 45,
          message: 'Resource efficiency is below optimal threshold',
          resourceType: 'COMPUTE_MS',
          autoResolve: false,
          resolved: false,
          createdAt: new Date()
        }
      ]);

      // Update scaling events
      setScalingEvents([
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'scale_up',
          resource: 'Compute',
          reason: 'High CPU utilization detected'
        },
        {
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          type: 'scale_down',
          resource: 'AI Tokens',
          reason: 'Low usage during off-peak hours'
        }
      ]);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [selectedAgent]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔋 Energy Grid Monitor</h1>
          <p className="text-gray-600">Real-time resource monitoring and cost management for Axiom agents</p>
        </div>

        {/* Agent Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Agent:
          </label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="aqar">Aqar - Real Estate Oracle</option>
            <option value="mawid">Mawid - Smart Scheduler</option>
            <option value="sofra">Sofra - Customer Experience</option>
            <option value="tajer">Tajer - Business Negotiator</option>
          </select>
        </div>

        {/* Resource Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ResourceGauge
            title="⚡ Compute Time"
            current={resourceMetrics?.current.compute.usageMS || 0}
            quota={resourceQuota?.limits['COMPUTE_MS'] || 0}
            unit="ms"
            color="bg-blue-500"
          />
          <ResourceGauge
            title="🧠 AI Tokens"
            current={resourceMetrics?.current.aiTokens.usageTokens || 0}
            quota={resourceQuota?.limits['AI_TOKENS'] || 0}
            unit="tokens"
            color="bg-purple-500"
          />
          <ResourceGauge
            title="💾 Storage"
            current={resourceMetrics?.current.storage.usageKB || 0}
            quota={resourceQuota?.limits['STORAGE_KB'] || 0}
            unit="KB"
            color="bg-green-500"
          />
          <ResourceGauge
            title="🌐 Network Requests"
            current={resourceMetrics?.current.network.usageReqs || 0}
            quota={resourceQuota?.limits['NETWORK_REQS'] || 0}
            unit="reqs"
            color="bg-yellow-500"
          />
          <ResourceGauge
            title="⛓ Solana Lamports"
            current={resourceMetrics?.current.blockchain.usageLamports || 0}
            quota={resourceQuota?.limits['SOLANA_LAMPORTS'] || 0}
            unit="lamports"
            color="bg-indigo-500"
          />
        </div>

        {/* Cost and Scaling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CostChart
            title="💰 Cost Analysis"
            data={costData}
            currency="USD"
            budget={10.00}
          />
          <ScalingActivity events={scalingEvents} />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card title="📊 Performance Score" value="85%" />
          <Card title="⚡ Efficiency" value="85%" />
          <Card title="💸 Cost/Task" value="$0.05" />
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 2.722-1.36s1.957 0 2.722 1.36l7.071 12.578c.2.363.416.576.817.576.817s-.213.454-.576.817L13.483 19.82c-.765 1.36-2.722 1.36-2.722 1.36s-1.957 0-2.722-1.36L.967 16.67c-.363-.363-.576-.817-.576-.817s.213-.454.576-.817L8.257 3.099z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {alerts.map((alert, index) => (
                    <span key={index}>{alert.message}</span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resource Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ResourceAllocationChart resources={resourceAllocation} />
          <UtilizationMetrics utilization={utilizationData} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <ActivityLog activities={recentActivities} />
        </div>
      </div>
    </div>
  );
};
