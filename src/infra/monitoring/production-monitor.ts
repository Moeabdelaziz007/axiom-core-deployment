/**
 * Production Monitoring and Alerting System for AXIOM Staking
 * Monitors system health, performance, and security
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { createHash } from 'crypto';

interface MonitoringMetric {
  timestamp: Date;
  metric: string;
  value: number | string | boolean;
  threshold?: {
    warning?: number;
    critical?: number;
  };
  status: 'normal' | 'warning' | 'critical';
}

interface Alert {
  id: string;
  timestamp: Date;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  title: string;
  message: string;
  source: string;
  resolved?: boolean;
  resolvedAt?: Date;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  components: {
    staking: 'healthy' | 'degraded' | 'down';
    api: 'healthy' | 'degraded' | 'down';
    blockchain: 'healthy' | 'degraded' | 'down';
    database: 'healthy' | 'degraded' | 'down';
  };
  lastChecked: Date;
}

class ProductionMonitor {
  private connection: Connection;
  private programId: PublicKey;
  private metrics: MonitoringMetric[] = [];
  private alerts: Alert[] = [];
  private alertCallbacks: ((alert: Alert) => void)[] = [];

  constructor(
    network: 'mainnet-beta' | 'devnet',
    programId: string,
    private rpcUrl: string
  ) {
    this.connection = new Connection(rpcUrl);
    this.programId = new PublicKey(programId);
  }

  // Monitoring Methods
  async startMonitoring(): Promise<void> {
    console.log('🔍 Starting AXIOM Staking Production Monitoring');
    
    // Start continuous monitoring
    setInterval(() => this.checkSystemHealth(), 30000); // Every 30 seconds
    setInterval(() => this.checkPerformanceMetrics(), 60000); // Every minute
    setInterval(() => this.checkSecurityEvents(), 120000); // Every 2 minutes
    
    // Initial health check
    await this.checkSystemHealth();
    await this.checkPerformanceMetrics();
    
    console.log('✅ Production monitoring started');
  }

  async checkSystemHealth(): Promise<SystemHealth> {
    const health: SystemHealth = {
      overall: 'healthy',
      components: {
        staking: 'healthy',
        api: 'healthy',
        blockchain: 'healthy',
        database: 'healthy'
      },
      lastChecked: new Date()
    };

    try {
      // Check staking program health
      const programHealth = await this.checkStakingProgramHealth();
      health.components.staking = programHealth;

      // Check API health
      const apiHealth = await this.checkAPIHealth();
      health.components.api = apiHealth;

      // Check blockchain connectivity
      const blockchainHealth = await this.checkBlockchainHealth();
      health.components.blockchain = blockchainHealth;

      // Determine overall health
      const componentStatuses = Object.values(health.components);
      const degradedCount = componentStatuses.filter(s => s === 'degraded').length;
      const downCount = componentStatuses.filter(s => s === 'down').length;

      if (downCount > 0) {
        health.overall = 'down';
      } else if (degradedCount > 0) {
        health.overall = 'degraded';
      }

      // Log health status
      this.logMetric('system_health', health.overall, {
        warning: degradedCount > 0 ? 1 : 0,
        critical: downCount > 0 ? 1 : 0
      });

      // Send alerts for degraded/down components
      componentStatuses.forEach((status, index) => {
        const componentName = Object.keys(health.components)[index];
        if (status === 'degraded') {
          this.sendAlert({
            severity: 'WARNING',
            title: `${componentName} Component Degraded`,
            message: `The ${componentName} component is experiencing degraded performance`,
            source: 'health_check'
          });
        } else if (status === 'down') {
          this.sendAlert({
            severity: 'CRITICAL',
            title: `${componentName} Component Down`,
            message: `The ${componentName} component is currently down`,
            source: 'health_check'
          });
        }
      });

      return health;
    } catch (error) {
      console.error('Health check failed:', error);
      this.sendAlert({
        severity: 'ERROR',
        title: 'Health Check Failed',
        message: `System health check failed: ${error}`,
        source: 'monitoring'
      });
      
      health.overall = 'degraded';
      return health;
    }
  }

  private async checkStakingProgramHealth(): Promise<'healthy' | 'degraded' | 'down'> {
    try {
      const accountInfo = await this.connection.getAccountInfo(this.programId);
      
      if (!accountInfo) {
        return 'down';
      }

      // Check if program is executable
      if (!accountInfo.executable) {
        return 'down';
      }

      // Check program age (recently updated programs might be unstable)
      const programAge = Date.now() - (accountInfo.lamports || 0);
      if (programAge < 300000) { // Less than 5 minutes
        return 'degraded';
      }

      return 'healthy';
    } catch (error) {
      return 'down';
    }
  }

  private async checkAPIHealth(): Promise<'healthy' | 'degraded' | 'down'> {
    try {
      const response = await fetch('http://localhost:3000/api/health');
      
      if (!response.ok) {
        return response.status >= 500 ? 'down' : 'degraded';
      }

      const healthData = await response.json();
      const responseTime = response.headers.get('x-response-time');
      
      if (responseTime && parseFloat(responseTime) > 2000) { // > 2 seconds
        return 'degraded';
      }

      return 'healthy';
    } catch (error) {
      return 'down';
    }
  }

  private async checkBlockchainHealth(): Promise<'healthy' | 'degraded' | 'down'> {
    try {
      const slot = await this.connection.getSlot();
      const recentBlock = await this.connection.getLatestBlockhash();
      
      if (!slot || !recentBlock) {
        return 'down';
      }

      // Check for high slot lag
      const slotTime = await this.connection.getBlockTime(slot);
      const currentTime = Date.now();
      const timeDiff = currentTime - (slotTime || 0);
      
      if (timeDiff > 60000) { // > 1 minute
        return 'degraded';
      }

      return 'healthy';
    } catch (error) {
      return 'down';
    }
  }

  async checkPerformanceMetrics(): Promise<void> {
    try {
      // Check response times
      const startTime = Date.now();
      await this.connection.getAccountInfo(this.programId);
      const responseTime = Date.now() - startTime;

      this.logMetric('api_response_time', responseTime, {
        warning: 1000,
        critical: 5000
      });

      // Check memory usage
      const memUsage = process.memoryUsage();
      this.logMetric('memory_usage_mb', memUsage.heapUsed / 1024 / 1024, {
        warning: 500,
        critical: 1000
      });

      // Check CPU usage (simplified)
      const cpuUsage = process.cpuUsage();
      this.logMetric('cpu_usage_percent', cpuUsage.user, {
        warning: 70,
        critical: 90
      });

      // Check active staking operations
      const activeStakes = await this.getActiveStakingOperations();
      this.logMetric('active_staking_operations', activeStakes, {
        warning: 100,
        critical: 500
      });

    } catch (error) {
      this.sendAlert({
        severity: 'ERROR',
        title: 'Performance Monitoring Failed',
        message: `Failed to collect performance metrics: ${error}`,
        source: 'performance_monitoring'
      });
    }
  }

  private async checkSecurityEvents(): Promise<void> {
    try {
      // Check for unusual staking patterns
      const unusualActivity = await this.detectUnusualStakingActivity();
      
      if (unusualActivity.detected) {
        this.sendAlert({
          severity: 'WARNING',
          title: 'Unusual Staking Activity',
          message: unusualActivity.description,
          source: 'security_monitoring'
        });
      }

      // Check for failed authentication attempts
      const failedAuth = await this.checkFailedAuthentication();
      
      if (failedAuth.count > 10) { // More than 10 failed attempts in 2 minutes
        this.sendAlert({
          severity: 'WARNING',
          title: 'High Failed Authentication Rate',
          message: `Detected ${failedAuth.count} failed authentication attempts`,
          source: 'security_monitoring'
        });
      }

      // Check for large unstaking operations
      const largeUnstakes = await this.checkLargeUnstakingOperations();
      
      if (largeUnstakes.detected) {
        this.sendAlert({
          severity: 'WARNING',
          title: 'Large Unstaking Operation',
          message: largeUnstakes.description,
          source: 'security_monitoring'
        });
      }

    } catch (error) {
      this.sendAlert({
        severity: 'ERROR',
        title: 'Security Monitoring Failed',
        message: `Security monitoring failed: ${error}`,
        source: 'security_monitoring'
      });
    }
  }

  private async detectUnusualStakingActivity(): Promise<{ detected: boolean; description: string }> {
    // This would analyze recent staking patterns
    // For now, return mock detection logic
    
    const recentMetrics = this.metrics
      .filter(m => m.metric === 'staking_operations')
      .slice(-10); // Last 10 measurements

    if (recentMetrics.length < 5) {
      return { detected: false, description: 'Insufficient data' };
    }

    const avgStaking = recentMetrics.reduce((sum, m) => sum + (m.value as number), 0) / recentMetrics.length;
    const latestStaking = recentMetrics[recentMetrics.length - 1].value as number;

    // Alert if latest staking is 3x average
    if (latestStaking > avgStaking * 3) {
      return {
        detected: true,
        description: `Staking volume (${latestStaking}) is significantly higher than average (${avgStaking.toFixed(2)})`
      };
    }

    return { detected: false, description: 'Normal activity detected' };
  }

  private async checkFailedAuthentication(): Promise<{ count: number }> {
    // This would check authentication logs
    // For now, return mock data
    return { count: Math.floor(Math.random() * 20) };
  }

  private async checkLargeUnstakingOperations(): Promise<{ detected: boolean; description: string }> {
    // This would monitor for unusually large unstaking operations
    // For now, return mock detection
    return {
      detected: false,
      description: 'No unusual unstaking detected'
    };
  }

  private async getActiveStakingOperations(): Promise<number> {
    // This would query active staking operations
    // For now, return mock data
    return Math.floor(Math.random() * 50);
  }

  private logMetric(
    metric: string,
    value: number | string | boolean,
    threshold?: { warning?: number; critical?: number }
  ): void {
    const metric: MonitoringMetric = {
      timestamp: new Date(),
      metric,
      value,
      threshold,
      status: 'normal'
    };

    // Determine status based on thresholds
    if (threshold && typeof value === 'number') {
      if (threshold.critical && value >= threshold.critical) {
        metric.status = 'critical';
      } else if (threshold.warning && value >= threshold.warning) {
        metric.status = 'warning';
      }
    }

    this.metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log to console (in production, this would go to monitoring service)
    console.log(`📊 ${metric}: ${value} (${metric.status})`);
  }

  private sendAlert(alert: Omit<Alert, 'id' | 'timestamp'>): void {
    const fullAlert: Alert = {
      id: createHash('alert_' + Date.now() + Math.random()).toString('hex'),
      timestamp: new Date(),
      ...alert
    };

    this.alerts.push(fullAlert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Log alert
    console.log(`🚨 [${alert.severity}] ${alert.title}: ${alert.message}`);
    
    // Call alert callbacks
    this.alertCallbacks.forEach(callback => callback(fullAlert));
  }

  // Public API methods
  onAlert(callback: (alert: Alert) => void): void {
    this.alertCallbacks.push(callback);
  }

  getMetrics(): MonitoringMetric[] {
    return this.metrics;
  }

  getAlerts(): Alert[] {
    return this.alerts;
  }

  getSystemHealth(): Promise<SystemHealth> {
    return this.checkSystemHealth();
  }

  // Export monitoring data
  exportMetrics(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      programId: this.programId.toBase58(),
      metrics: this.metrics.slice(-100), // Last 100 metrics
      alerts: this.alerts.slice(-20) // Last 20 alerts
    };

    return JSON.stringify(exportData, null, 2);
  }
}

// Export for use in API routes
export { ProductionMonitor, MonitoringMetric, Alert, SystemHealth };

// Singleton instance for the application
let monitor: ProductionMonitor | null = null;

export function getMonitor(): ProductionMonitor {
  if (!monitor) {
    const network = process.env.SOLANA_NETWORK || 'mainnet-beta';
    const programId = process.env.STAKING_PROGRAM_ID || '';
    const rpcUrl = process.env.HELIUS_RPC_URL || '';
    
    if (!programId || !rpcUrl) {
      throw new Error('STAKING_PROGRAM_ID and HELIUS_RPC_URL environment variables required');
    }
    
    monitor = new ProductionMonitor(network, programId, rpcUrl);
  }
  
  return monitor;
}