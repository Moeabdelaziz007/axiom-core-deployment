/**
 * ⚖️ WORKER LOAD BALANCER
 * 
 * Advanced load balancing and performance management for research workers
 * Provides dynamic scaling, health monitoring, and intelligent task distribution
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { ResearchTask, ResearchWorker } from './ResearchNafsWorkers';

// ============================================================================
// WORKER LOAD BALANCER TYPES
// ============================================================================

/**
 * Worker Performance Metrics
 */
export interface WorkerPerformanceMetrics {
  worker_id: string;
  cpu_utilization: number;
  memory_usage_mb: number;
  active_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  average_task_duration: number;
  success_rate: number;
  throughput: number;
  last_heartbeat: string;
  health_score: number;
  load_factor: number;
  efficiency_score: number;
}

/**
 * Load Balancing Strategy
 */
export interface LoadBalancingStrategy {
  name: 'round_robin' | 'weighted_round_robin' | 'least_connections' | 'least_response_time' | 'adaptive' | 'predictive';
  parameters: Record<string, any>;
  weights?: Record<string, number>;
}

/**
 * Scaling Configuration
 */
export interface ScalingConfiguration {
  enabled: boolean;
  min_workers: number;
  max_workers: number;
  scale_up_threshold: number;
  scale_down_threshold: number;
  scale_up_cooldown_seconds: number;
  scale_down_cooldown_seconds: number;
  scale_up_step: number;
  scale_down_step: number;
  predictive_scaling: boolean;
  scaling_predictions_window_minutes: number;
}

/**
 * Worker Health Check
 */
export interface WorkerHealthCheck {
  worker_id: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  response_time: number;
  error_rate: number;
  last_check: string;
  consecutive_failures: number;
  issues: string[];
  recommendations: string[];
}

/**
 * Task Assignment Result
 */
export interface TaskAssignmentResult {
  worker_id: string;
  task_id: string;
  estimated_completion_time: number;
  confidence_score: number;
  load_impact: number;
  assignment_reason: string;
}

/**
 * Load Balancer Statistics
 */
export interface LoadBalancerStatistics {
  total_workers: number;
  active_workers: number;
  healthy_workers: number;
  total_tasks_assigned: number;
  tasks_per_second: number;
  average_worker_utilization: number;
  load_balance_score: number;
  scaling_events: number;
  failed_assignments: number;
  average_assignment_time: number;
}

// ============================================================================
// WORKER LOAD BALANCER CLASS
// ============================================================================

/**
 * Worker Load Balancer - Advanced load balancing for research workers
 */
export class WorkerLoadBalancer {
  private id: string;
  private optimizationLevel: any;
  private workers: Map<string, ResearchWorker> = new Map();
  private workerMetrics: Map<string, WorkerPerformanceMetrics> = new Map();
  private workerHealth: Map<string, WorkerHealthCheck> = new Map();
  private taskAssignments: Map<string, string> = new Map(); // task_id -> worker_id
  private loadBalancingStrategy: LoadBalancingStrategy;
  private scalingConfig: ScalingConfiguration;
  
  // Load balancing state
  private roundRobinIndex = 0;
  private lastScaleUpTime = 0;
  private lastScaleDownTime = 0;
  private scalingHistory: Array<{
    timestamp: number;
    action: 'scale_up' | 'scale_down';
    worker_count_before: number;
    worker_count_after: number;
    reason: string;
  }> = [];
  
  // Performance monitoring
  private statistics: LoadBalancerStatistics = {
    total_workers: 0,
    active_workers: 0,
    healthy_workers: 0,
    total_tasks_assigned: 0,
    tasks_per_second: 0,
    average_worker_utilization: 0,
    load_balance_score: 0,
    scaling_events: 0,
    failed_assignments: 0,
    average_assignment_time: 0
  };
  
  // Monitoring intervals
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metricsUpdateInterval: NodeJS.Timeout | null = null;
  private scalingCheckInterval: NodeJS.Timeout | null = null;

  constructor(optimizationLevel: any) {
    this.id = `worker_lb_${Date.now()}`;
    this.optimizationLevel = optimizationLevel;
    this.loadBalancingStrategy = this.createLoadBalancingStrategy(optimizationLevel);
    this.scalingConfig = this.createScalingConfiguration(optimizationLevel);
  }

  /**
   * Initialize load balancer
   */
  async initialize(): Promise<void> {
    console.log(`⚖️ Initializing Worker Load Balancer: ${this.id}`);
    console.log(`📊 Load balancing strategy: ${this.loadBalancingStrategy.name}`);
    console.log(`📈 Auto-scaling: ${this.scalingConfig.enabled ? 'enabled' : 'disabled'}`);
    
    // Start monitoring intervals
    this.startHealthChecking();
    this.startMetricsUpdating();
    this.startScalingChecks();
    
    console.log('✅ Worker Load Balancer initialized successfully');
  }

  /**
   * Register worker with load balancer
   */
  async registerWorker(worker: ResearchWorker): Promise<void> {
    console.log(`📝 Registering worker: ${worker.id}`);
    
    this.workers.set(worker.id, worker);
    
    // Initialize worker metrics
    this.workerMetrics.set(worker.id, {
      worker_id: worker.id,
      cpu_utilization: 0,
      memory_usage_mb: 0,
      active_tasks: 0,
      completed_tasks: 0,
      failed_tasks: 0,
      average_task_duration: 0,
      success_rate: 1.0,
      throughput: 0,
      last_heartbeat: new Date().toISOString(),
      health_score: 1.0,
      load_factor: 0,
      efficiency_score: 1.0
    });
    
    // Initialize worker health
    this.workerHealth.set(worker.id, {
      worker_id: worker.id,
      status: 'healthy',
      response_time: 0,
      error_rate: 0,
      last_check: new Date().toISOString(),
      consecutive_failures: 0,
      issues: [],
      recommendations: []
    });
    
    this.updateStatistics();
    console.log(`✅ Worker ${worker.id} registered successfully`);
  }

  /**
   * Unregister worker from load balancer
   */
  async unregisterWorker(workerId: string): Promise<void> {
    console.log(`🗑️ Unregistering worker: ${workerId}`);
    
    // Reassign tasks from this worker
    await this.reassignWorkerTasks(workerId);
    
    // Remove from all collections
    this.workers.delete(workerId);
    this.workerMetrics.delete(workerId);
    this.workerHealth.delete(workerId);
    
    this.updateStatistics();
    console.log(`✅ Worker ${workerId} unregistered successfully`);
  }

  /**
   * Optimize task distribution across workers
   */
  async optimizeTaskDistribution(
    tasks: ResearchTask[],
    workers: ResearchWorker[]
  ): Promise<Map<string, ResearchTask[]>> {
    console.log(`⚖️ Optimizing distribution for ${tasks.length} tasks across ${workers.length} workers`);
    const startTime = Date.now();
    
    try {
      const assignments = new Map<string, ResearchTask[]>();
      
      // Initialize assignments for all workers
      for (const worker of workers) {
        assignments.set(worker.id, []);
      }
      
      // Filter healthy workers
      const healthyWorkers = workers.filter(worker => {
        const health = this.workerHealth.get(worker.id);
        return health && (health.status === 'healthy' || health.status === 'degraded');
      });
      
      if (healthyWorkers.length === 0) {
        throw new Error('No healthy workers available for task assignment');
      }
      
      // Assign tasks based on strategy
      switch (this.loadBalancingStrategy.name) {
        case 'round_robin':
          this.assignRoundRobin(tasks, healthyWorkers, assignments);
          break;
        case 'weighted_round_robin':
          this.assignWeightedRoundRobin(tasks, healthyWorkers, assignments);
          break;
        case 'least_connections':
          this.assignLeastConnections(tasks, healthyWorkers, assignments);
          break;
        case 'least_response_time':
          this.assignLeastResponseTime(tasks, healthyWorkers, assignments);
          break;
        case 'adaptive':
          this.assignAdaptive(tasks, healthyWorkers, assignments);
          break;
        case 'predictive':
          this.assignPredictive(tasks, healthyWorkers, assignments);
          break;
        default:
          this.assignRoundRobin(tasks, healthyWorkers, assignments);
      }
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ Task distribution optimized in ${totalTime}ms`);
      
      return assignments;
      
    } catch (error) {
      console.error('❌ Task distribution optimization failed:', error);
      throw new Error(`Task distribution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Assign single task to optimal worker
   */
  async assignTask(task: ResearchTask): Promise<TaskAssignmentResult> {
    const startTime = Date.now();
    
    try {
      const healthyWorkers = Array.from(this.workers.values()).filter(worker => {
        const health = this.workerHealth.get(worker.id);
        return health && (health.status === 'healthy' || health.status === 'degraded');
      });
      
      if (healthyWorkers.length === 0) {
        throw new Error('No healthy workers available');
      }
      
      // Find optimal worker based on strategy
      const selectedWorker = this.selectOptimalWorker(task, healthyWorkers);
      
      // Record assignment
      this.taskAssignments.set(task.id, selectedWorker.id);
      
      // Update worker metrics
      const metrics = this.workerMetrics.get(selectedWorker.id)!;
      metrics.active_tasks++;
      metrics.load_factor = metrics.active_tasks / 10; // Assume 10 max tasks per worker
      
      const assignmentTime = Date.now() - startTime;
      
      const result: TaskAssignmentResult = {
        worker_id: selectedWorker.id,
        task_id: task.id,
        estimated_completion_time: this.estimateTaskCompletion(task, selectedWorker),
        confidence_score: this.calculateAssignmentConfidence(task, selectedWorker),
        load_impact: this.calculateLoadImpact(task, selectedWorker),
        assignment_reason: this.getAssignmentReason(selectedWorker, task)
      };
      
      console.log(`📋 Task ${task.id} assigned to worker ${selectedWorker.id} (${assignmentTime}ms)`);
      
      return result;
      
    } catch (error) {
      this.statistics.failed_assignments++;
      console.error(`❌ Task assignment failed for ${task.id}:`, error);
      throw error;
    }
  }

  /**
   * Complete task assignment
   */
  async completeTask(taskId: string, success: boolean, duration?: number): Promise<void> {
    const workerId = this.taskAssignments.get(taskId);
    if (!workerId) {
      console.warn(`⚠️ No assignment found for task ${taskId}`);
      return;
    }
    
    const metrics = this.workerMetrics.get(workerId);
    if (!metrics) {
      console.warn(`⚠️ No metrics found for worker ${workerId}`);
      return;
    }
    
    // Update metrics
    metrics.active_tasks--;
    metrics.completed_tasks++;
    
    if (success) {
      if (duration) {
        metrics.average_task_duration = 
          (metrics.average_task_duration + duration) / 2;
      }
    } else {
      metrics.failed_tasks++;
    }
    
    metrics.success_rate = metrics.completed_tasks / (metrics.completed_tasks + metrics.failed_tasks);
    metrics.load_factor = metrics.active_tasks / 10;
    metrics.efficiency_score = metrics.success_rate * (1 - metrics.load_factor);
    
    // Remove assignment
    this.taskAssignments.delete(taskId);
    
    console.log(`✅ Task ${taskId} completed on worker ${workerId} (success: ${success})`);
  }

  /**
   * Monitor and scale workers based on load
   */
  async monitorAndScale(workers: ResearchWorker[], tasks: ResearchTask[]): Promise<number> {
    if (!this.scalingConfig.enabled) {
      return 0;
    }
    
    console.log('📈 Monitoring load and checking scaling requirements');
    
    const scalingEvents = await this.checkScalingRequirements(workers, tasks);
    
    if (scalingEvents > 0) {
      console.log(`📊 Scaling events triggered: ${scalingEvents}`);
    }
    
    return scalingEvents;
  }

  /**
   * Get worker performance metrics
   */
  getWorkerMetrics(workerId?: string): WorkerPerformanceMetrics | Map<string, WorkerPerformanceMetrics> {
    if (workerId) {
      return this.workerMetrics.get(workerId) || {} as WorkerPerformanceMetrics;
    }
    return new Map(this.workerMetrics);
  }

  /**
   * Get worker health status
   */
  getWorkerHealth(workerId?: string): WorkerHealthCheck | Map<string, WorkerHealthCheck> {
    if (workerId) {
      return this.workerHealth.get(workerId) || {} as WorkerHealthCheck;
    }
    return new Map(this.workerHealth);
  }

  /**
   * Get load balancer statistics
   */
  getStatistics(): LoadBalancerStatistics {
    return { ...this.statistics };
  }

  /**
   * Update load balancing strategy
   */
  updateLoadBalancingStrategy(strategy: LoadBalancingStrategy): void {
    console.log(`🔄 Updating load balancing strategy to: ${strategy.name}`);
    this.loadBalancingStrategy = strategy;
    this.roundRobinIndex = 0; // Reset round robin index
  }

  /**
   * Update scaling configuration
   */
  updateScalingConfiguration(config: ScalingConfiguration): void {
    console.log('🔄 Updating scaling configuration');
    this.scalingConfig = config;
  }

  /**
   * Get scaling history
   */
  getScalingHistory(): Array<{
    timestamp: number;
    action: 'scale_up' | 'scale_down';
    worker_count_before: number;
    worker_count_after: number;
    reason: string;
  }> {
    return [...this.scalingHistory];
  }

  /**
   * Shutdown load balancer
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Worker Load Balancer');
    
    // Stop monitoring intervals
    this.stopHealthChecking();
    this.stopMetricsUpdating();
    this.stopScalingChecks();
    
    // Reassign all active tasks
    for (const [taskId, workerId] of this.taskAssignments.entries()) {
      console.log(`🔄 Reassigning task ${taskId} from worker ${workerId}`);
      await this.reassignTask(taskId, workerId);
    }
    
    console.log('✅ Worker Load Balancer shutdown complete');
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Create load balancing strategy from optimization level
   */
  private createLoadBalancingStrategy(optimizationLevel: any): LoadBalancingStrategy {
    const strategies: Record<string, LoadBalancingStrategy> = {
      minimal: {
        name: 'round_robin',
        parameters: {}
      },
      balanced: {
        name: 'least_connections',
        parameters: {
          max_tasks_per_worker: 5
        }
      },
      aggressive: {
        name: 'adaptive',
        parameters: {
          performance_weight: 0.6,
          load_weight: 0.4,
          adaptation_rate: 0.1
        }
      },
      maximum: {
        name: 'predictive',
        parameters: {
          prediction_window_minutes: 10,
          machine_learning_enabled: true,
          confidence_threshold: 0.7
        }
      }
    };
    
    return strategies[optimizationLevel.name] || strategies.balanced;
  }

  /**
   * Create scaling configuration from optimization level
   */
  private createScalingConfiguration(optimizationLevel: any): ScalingConfiguration {
    const configs: Record<string, ScalingConfiguration> = {
      minimal: {
        enabled: false,
        min_workers: 2,
        max_workers: 4,
        scale_up_threshold: 80,
        scale_down_threshold: 20,
        scale_up_cooldown_seconds: 300,
        scale_down_cooldown_seconds: 600,
        scale_up_step: 1,
        scale_down_step: 1,
        predictive_scaling: false,
        scaling_predictions_window_minutes: 5
      },
      balanced: {
        enabled: true,
        min_workers: 3,
        max_workers: 8,
        scale_up_threshold: 70,
        scale_down_threshold: 30,
        scale_up_cooldown_seconds: 180,
        scale_down_cooldown_seconds: 300,
        scale_up_step: 1,
        scale_down_step: 1,
        predictive_scaling: true,
        scaling_predictions_window_minutes: 10
      },
      aggressive: {
        enabled: true,
        min_workers: 4,
        max_workers: 12,
        scale_up_threshold: 60,
        scale_down_threshold: 25,
        scale_up_cooldown_seconds: 120,
        scale_down_cooldown_seconds: 240,
        scale_up_step: 2,
        scale_down_step: 1,
        predictive_scaling: true,
        scaling_predictions_window_minutes: 15
      },
      maximum: {
        enabled: true,
        min_workers: 6,
        max_workers: 20,
        scale_up_threshold: 50,
        scale_down_threshold: 20,
        scale_up_cooldown_seconds: 60,
        scale_down_cooldown_seconds: 180,
        scale_up_step: 3,
        scale_down_step: 2,
        predictive_scaling: true,
        scaling_predictions_window_minutes: 20
      }
    };
    
    return configs[optimizationLevel.name] || configs.balanced;
  }

  /**
   * Assign tasks using round robin
   */
  private assignRoundRobin(
    tasks: ResearchTask[],
    workers: ResearchWorker[],
    assignments: Map<string, ResearchTask[]>
  ): void {
    for (let i = 0; i < tasks.length; i++) {
      const worker = workers[this.roundRobinIndex % workers.length];
      const workerTasks = assignments.get(worker.id)!;
      workerTasks.push(tasks[i]);
      this.roundRobinIndex++;
    }
  }

  /**
   * Assign tasks using weighted round robin
   */
  private assignWeightedRoundRobin(
    tasks: ResearchTask[],
    workers: ResearchWorker[],
    assignments: Map<string, ResearchTask[]>
  ): void {
    const weights = this.loadBalancingStrategy.weights || {};
    const totalWeight = workers.reduce((sum, worker) => sum + (weights[worker.id] || 1), 0);
    
    for (const task of tasks) {
      let selectedWorker: ResearchWorker | null = null;
      let random = Math.random() * totalWeight;
      
      for (const worker of workers) {
        const weight = weights[worker.id] || 1;
        random -= weight;
        if (random <= 0) {
          selectedWorker = worker;
          break;
        }
      }
      
      if (selectedWorker) {
        assignments.get(selectedWorker.id)!.push(task);
      }
    }
  }

  /**
   * Assign tasks to least connected workers
   */
  private assignLeastConnections(
    tasks: ResearchTask[],
    workers: ResearchWorker[],
    assignments: Map<string, ResearchTask[]>
  ): void {
    for (const task of tasks) {
      // Sort workers by current active tasks
      const sortedWorkers = workers.sort((a, b) => {
        const metricsA = this.workerMetrics.get(a.id)!;
        const metricsB = this.workerMetrics.get(b.id)!;
        return metricsA.active_tasks - metricsB.active_tasks;
      });
      
      const selectedWorker = sortedWorkers[0];
      assignments.get(selectedWorker.id)!.push(task);
    }
  }

  /**
   * Assign tasks to workers with least response time
   */
  private assignLeastResponseTime(
    tasks: ResearchTask[],
    workers: ResearchWorker[],
    assignments: Map<string, ResearchTask[]>
  ): void {
    for (const task of tasks) {
      const sortedWorkers = workers.sort((a, b) => {
        const healthA = this.workerHealth.get(a.id)!;
        const healthB = this.workerHealth.get(b.id)!;
        return healthA.response_time - healthB.response_time;
      });
      
      const selectedWorker = sortedWorkers[0];
      assignments.get(selectedWorker.id)!.push(task);
    }
  }

  /**
   * Assign tasks using adaptive algorithm
   */
  private assignAdaptive(
    tasks: ResearchTask[],
    workers: ResearchWorker[],
    assignments: Map<string, ResearchTask[]>
  ): void {
    const params = this.loadBalancingStrategy.parameters;
    const performanceWeight = params.performance_weight || 0.6;
    const loadWeight = params.load_weight || 0.4;
    
    for (const task of tasks) {
      let bestWorker: ResearchWorker | null = null;
      let bestScore = -1;
      
      for (const worker of workers) {
        const metrics = this.workerMetrics.get(worker.id)!;
        const health = this.workerHealth.get(worker.id)!;
        
        // Calculate adaptive score
        const performanceScore = metrics.efficiency_score * (1 - health.error_rate);
        const loadScore = 1 - metrics.load_factor;
        const adaptiveScore = performanceScore * performanceWeight + loadScore * loadWeight;
        
        if (adaptiveScore > bestScore) {
          bestScore = adaptiveScore;
          bestWorker = worker;
        }
      }
      
      if (bestWorker) {
        assignments.get(bestWorker.id)!.push(task);
      }
    }
  }

  /**
   * Assign tasks using predictive algorithm
   */
  private assignPredictive(
    tasks: ResearchTask[],
    workers: ResearchWorker[],
    assignments: Map<string, ResearchTask[]>
  ): void {
    // Simplified predictive assignment - in production, use ML models
    for (const task of tasks) {
      let bestWorker: ResearchWorker | null = null;
      let bestPrediction = -1;
      
      for (const worker of workers) {
        const metrics = this.workerMetrics.get(worker.id)!;
        const health = this.workerHealth.get(worker.id)!;
        
        // Predict task completion time
        const predictedTime = this.predictTaskCompletion(task, worker, metrics);
        const confidence = this.calculatePredictionConfidence(worker, metrics, health);
        
        const predictionScore = confidence / (predictedTime + 1);
        
        if (predictionScore > bestPrediction) {
          bestPrediction = predictionScore;
          bestWorker = worker;
        }
      }
      
      if (bestWorker) {
        assignments.get(bestWorker.id)!.push(task);
      }
    }
  }

  /**
   * Select optimal worker for single task
   */
  private selectOptimalWorker(task: ResearchTask, workers: ResearchWorker[]): ResearchWorker {
    switch (this.loadBalancingStrategy.name) {
      case 'least_connections':
        return workers.reduce((best, current) => {
          const bestMetrics = this.workerMetrics.get(best.id)!;
          const currentMetrics = this.workerMetrics.get(current.id)!;
          return currentMetrics.active_tasks < bestMetrics.active_tasks ? current : best;
        });
      
      case 'least_response_time':
        return workers.reduce((best, current) => {
          const bestHealth = this.workerHealth.get(best.id)!;
          const currentHealth = this.workerHealth.get(current.id)!;
          return currentHealth.response_time < bestHealth.response_time ? current : best;
        });
      
      case 'adaptive':
        return this.selectAdaptiveWorker(task, workers);
      
      case 'predictive':
        return this.selectPredictiveWorker(task, workers);
      
      default:
        return workers[this.roundRobinIndex++ % workers.length];
    }
  }

  /**
   * Select worker using adaptive algorithm
   */
  private selectAdaptiveWorker(task: ResearchTask, workers: ResearchWorker[]): ResearchWorker {
    const params = this.loadBalancingStrategy.parameters;
    const performanceWeight = params.performance_weight || 0.6;
    const loadWeight = params.load_weight || 0.4;
    
    let bestWorker = workers[0];
    let bestScore = -1;
    
    for (const worker of workers) {
      const metrics = this.workerMetrics.get(worker.id)!;
      const health = this.workerHealth.get(worker.id)!;
      
      const performanceScore = metrics.efficiency_score * (1 - health.error_rate);
      const loadScore = 1 - metrics.load_factor;
      const adaptiveScore = performanceScore * performanceWeight + loadScore * loadWeight;
      
      if (adaptiveScore > bestScore) {
        bestScore = adaptiveScore;
        bestWorker = worker;
      }
    }
    
    return bestWorker;
  }

  /**
   * Select worker using predictive algorithm
   */
  private selectPredictiveWorker(task: ResearchTask, workers: ResearchWorker[]): ResearchWorker {
    let bestWorker = workers[0];
    let bestPrediction = -1;
    
    for (const worker of workers) {
      const metrics = this.workerMetrics.get(worker.id)!;
      const health = this.workerHealth.get(worker.id)!;
      
      const predictedTime = this.predictTaskCompletion(task, worker, metrics);
      const confidence = this.calculatePredictionConfidence(worker, metrics, health);
      const predictionScore = confidence / (predictedTime + 1);
      
      if (predictionScore > bestPrediction) {
        bestPrediction = predictionScore;
        bestWorker = worker;
      }
    }
    
    return bestWorker;
  }

  /**
   * Estimate task completion time
   */
  private estimateTaskCompletion(task: ResearchTask, worker: ResearchWorker): number {
    const metrics = this.workerMetrics.get(worker.id)!;
    const baseTime = metrics.average_task_duration || 1000; // 1 second default
    
    // Adjust based on task priority and worker load
    const priorityMultiplier = {
      low: 1.5,
      medium: 1.0,
      high: 0.8,
      critical: 0.6
    }[task.priority] || 1.0;
    
    const loadMultiplier = 1 + metrics.load_factor;
    
    return baseTime * priorityMultiplier * loadMultiplier;
  }

  /**
   * Predict task completion time
   */
  private predictTaskCompletion(
    task: ResearchTask,
    worker: ResearchWorker,
    metrics: WorkerPerformanceMetrics
  ): number {
    // Simplified prediction - in production, use ML models
    const baseTime = metrics.average_task_duration || 1000;
    const trendFactor = metrics.throughput > 0 ? 1000 / metrics.throughput : 1;
    
    return baseTime * trendFactor * (1 + metrics.load_factor);
  }

  /**
   * Calculate prediction confidence
   */
  private calculatePredictionConfidence(
    worker: ResearchWorker,
    metrics: WorkerPerformanceMetrics,
    health: WorkerHealthCheck
  ): number {
    const healthScore = health.status === 'healthy' ? 1.0 : 
                       health.status === 'degraded' ? 0.7 : 0.3;
    const performanceScore = metrics.success_rate;
    const stabilityScore = 1 - health.error_rate;
    
    return (healthScore + performanceScore + stabilityScore) / 3;
  }

  /**
   * Calculate assignment confidence
   */
  private calculateAssignmentConfidence(task: ResearchTask, worker: ResearchWorker): number {
    const metrics = this.workerMetrics.get(worker.id)!;
    const health = this.workerHealth.get(worker.id)!;
    
    const loadScore = 1 - metrics.load_factor;
    const healthScore = health.status === 'healthy' ? 1.0 : 0.7;
    const performanceScore = metrics.success_rate;
    
    return (loadScore + healthScore + performanceScore) / 3;
  }

  /**
   * Calculate load impact
   */
  private calculateLoadImpact(task: ResearchTask, worker: ResearchWorker): number {
    const metrics = this.workerMetrics.get(worker.id)!;
    const taskWeight = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    }[task.priority] || 2;
    
    return (taskWeight / 10) / (1 - metrics.load_factor + 0.1);
  }

  /**
   * Get assignment reason
   */
  private getAssignmentReason(worker: ResearchWorker, task: ResearchTask): string {
    const metrics = this.workerMetrics.get(worker.id)!;
    const health = this.workerHealth.get(worker.id)!;
    
    switch (this.loadBalancingStrategy.name) {
      case 'least_connections':
        return `Lowest active tasks (${metrics.active_tasks})`;
      case 'least_response_time':
        return `Fastest response time (${health.response_time}ms)`;
      case 'adaptive':
        return `Best adaptive score (efficiency: ${metrics.efficiency_score.toFixed(2)}, load: ${metrics.load_factor.toFixed(2)})`;
      case 'predictive':
        return `Best predicted completion time`;
      default:
        return 'Round robin selection';
    }
  }

  /**
   * Check scaling requirements
   */
  private async checkScalingRequirements(workers: ResearchWorker[], tasks: ResearchTask[]): Promise<number> {
    const now = Date.now();
    let scalingEvents = 0;
    
    // Calculate current load
    const totalActiveTasks = Array.from(this.workerMetrics.values())
      .reduce((sum, metrics) => sum + metrics.active_tasks, 0);
    const averageLoad = totalActiveTasks / workers.length;
    const utilizationRate = averageLoad / 10; // Assume 10 max tasks per worker
    
    // Check scale up
    if (utilizationRate > this.scalingConfig.scale_up_threshold / 100 &&
        workers.length < this.scalingConfig.max_workers &&
        now - this.lastScaleUpTime > this.scalingConfig.scale_up_cooldown_seconds * 1000) {
      
      await this.scaleUp(workers, tasks);
      this.lastScaleUpTime = now;
      scalingEvents++;
    }
    
    // Check scale down
    if (utilizationRate < this.scalingConfig.scale_down_threshold / 100 &&
        workers.length > this.scalingConfig.min_workers &&
        now - this.lastScaleDownTime > this.scalingConfig.scale_down_cooldown_seconds * 1000) {
      
      await this.scaleDown(workers);
      this.lastScaleDownTime = now;
      scalingEvents++;
    }
    
    return scalingEvents;
  }

  /**
   * Scale up workers
   */
  private async scaleUp(currentWorkers: ResearchWorker[], tasks: ResearchTask[]): Promise<void> {
    const step = this.scalingConfig.scale_up_step;
    const newWorkerCount = Math.min(
      currentWorkers.length + step,
      this.scalingConfig.max_workers
    );
    
    console.log(`📈 Scaling up from ${currentWorkers.length} to ${newWorkerCount} workers`);
    
    // Record scaling event
    this.scalingHistory.push({
      timestamp: Date.now(),
      action: 'scale_up',
      worker_count_before: currentWorkers.length,
      worker_count_after: newWorkerCount,
      reason: `High utilization: ${(Array.from(this.workerMetrics.values())
        .reduce((sum, m) => sum + m.active_tasks, 0) / currentWorkers.length * 10).toFixed(1)}%`
    });
    
    this.statistics.scaling_events++;
    
    // In a real implementation, this would create new worker instances
    console.log(`✅ Scale up completed: ${newWorkerCount} workers`);
  }

  /**
   * Scale down workers
   */
  private async scaleDown(currentWorkers: ResearchWorker[]): Promise<void> {
    const step = this.scalingConfig.scale_down_step;
    const newWorkerCount = Math.max(
      currentWorkers.length - step,
      this.scalingConfig.min_workers
    );
    
    console.log(`📉 Scaling down from ${currentWorkers.length} to ${newWorkerCount} workers`);
    
    // Find workers with least load to remove
    const workersToRemove = currentWorkers
      .sort((a, b) => {
        const metricsA = this.workerMetrics.get(a.id)!;
        const metricsB = this.workerMetrics.get(b.id)!;
        return metricsA.active_tasks - metricsB.active_tasks;
      })
      .slice(0, currentWorkers.length - newWorkerCount);
    
    // Unregister workers
    for (const worker of workersToRemove) {
      await this.unregisterWorker(worker.id);
    }
    
    // Record scaling event
    this.scalingHistory.push({
      timestamp: Date.now(),
      action: 'scale_down',
      worker_count_before: currentWorkers.length,
      worker_count_after: newWorkerCount,
      reason: `Low utilization: ${(Array.from(this.workerMetrics.values())
        .reduce((sum, m) => sum + m.active_tasks, 0) / currentWorkers.length * 10).toFixed(1)}%`
    });
    
    this.statistics.scaling_events++;
    
    console.log(`✅ Scale down completed: ${newWorkerCount} workers`);
  }

  /**
   * Reassign tasks from a worker
   */
  private async reassignWorkerTasks(workerId: string): Promise<void> {
    const tasksToReassign: string[] = [];
    
    for (const [taskId, assignedWorkerId] of this.taskAssignments.entries()) {
      if (assignedWorkerId === workerId) {
        tasksToReassign.push(taskId);
      }
    }
    
    for (const taskId of tasksToReassign) {
      await this.reassignTask(taskId, workerId);
    }
  }

  /**
   * Reassign single task
   */
  private async reassignTask(taskId: string, fromWorkerId: string): Promise<void> {
    console.log(`🔄 Reassigning task ${taskId} from worker ${fromWorkerId}`);
    
    // Find new worker
    const availableWorkers = Array.from(this.workers.values())
      .filter(worker => worker.id !== fromWorkerId);
    
    if (availableWorkers.length === 0) {
      console.warn(`⚠️ No available workers to reassign task ${taskId}`);
      return;
    }
    
    const newWorker = this.selectOptimalWorker(
      { id: taskId } as ResearchTask,
      availableWorkers
    );
    
    // Update assignment
    this.taskAssignments.set(taskId, newWorker.id);
    
    // Update metrics
    const oldMetrics = this.workerMetrics.get(fromWorkerId)!;
    oldMetrics.active_tasks--;
    
    const newMetrics = this.workerMetrics.get(newWorker.id)!;
    newMetrics.active_tasks++;
    
    console.log(`✅ Task ${taskId} reassigned to worker ${newWorker.id}`);
  }

  /**
   * Start health checking
   */
  private startHealthChecking(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, 30000); // 30 seconds
  }

  /**
   * Stop health checking
   */
  private stopHealthChecking(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Start metrics updating
   */
  private startMetricsUpdating(): void {
    this.metricsUpdateInterval = setInterval(async () => {
      await this.updateWorkerMetrics();
    }, 10000); // 10 seconds
  }

  /**
   * Stop metrics updating
   */
  private stopMetricsUpdating(): void {
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
      this.metricsUpdateInterval = null;
    }
  }

  /**
   * Start scaling checks
   */
  private startScalingChecks(): void {
    if (this.scalingConfig.enabled) {
      this.scalingCheckInterval = setInterval(async () => {
        // Scaling checks are done in monitorAndScale method
      }, 60000); // 1 minute
    }
  }

  /**
   * Stop scaling checks
   */
  private stopScalingChecks(): void {
    if (this.scalingCheckInterval) {
      clearInterval(this.scalingCheckInterval);
      this.scalingCheckInterval = null;
    }
  }

  /**
   * Perform health checks
   */
  private async performHealthChecks(): Promise<void> {
    for (const [workerId, worker] of this.workers.entries()) {
      try {
        const startTime = Date.now();
        
        // Simulate health check - in production, this would ping the worker
        const isHealthy = worker.status !== 'error';
        const responseTime = Date.now() - startTime;
        
        const currentHealth = this.workerHealth.get(workerId)!;
        const metrics = this.workerMetrics.get(workerId)!;
        
        // Update health status
        if (isHealthy) {
          currentHealth.status = 'healthy';
          currentHealth.consecutive_failures = 0;
          currentHealth.issues = [];
        } else {
          currentHealth.consecutive_failures++;
          if (currentHealth.consecutive_failures >= 3) {
            currentHealth.status = 'unhealthy';
          } else if (currentHealth.consecutive_failures >= 1) {
            currentHealth.status = 'degraded';
          }
          
          currentHealth.issues.push(`Health check failure #${currentHealth.consecutive_failures}`);
        }
        
        currentHealth.response_time = responseTime;
        currentHealth.error_rate = metrics.failed_tasks / Math.max(1, metrics.completed_tasks + metrics.failed_tasks);
        currentHealth.last_check = new Date().toISOString();
        
        // Update health score
        metrics.health_score = currentHealth.status === 'healthy' ? 1.0 :
                           currentHealth.status === 'degraded' ? 0.7 : 0.3;
        
      } catch (error) {
        console.error(`❌ Health check failed for worker ${workerId}:`, error);
        
        const health = this.workerHealth.get(workerId)!;
        health.status = 'unhealthy';
        health.consecutive_failures++;
        health.issues.push(`Health check error: ${error}`);
        health.last_check = new Date().toISOString();
      }
    }
  }

  /**
   * Update worker metrics
   */
  private async updateWorkerMetrics(): Promise<void> {
    for (const [workerId, worker] of this.workers.entries()) {
      const metrics = this.workerMetrics.get(workerId)!;
      
      // Simulate metric updates - in production, this would collect real metrics
      metrics.cpu_utilization = Math.random() * 100;
      metrics.memory_usage_mb = 256 + Math.random() * 768;
      metrics.throughput = metrics.completed_tasks / Math.max(1, (Date.now() - new Date(worker.id).getTime()) / 1000);
      metrics.last_heartbeat = new Date().toISOString();
    }
    
    this.updateStatistics();
  }

  /**
   * Update statistics
   */
  private updateStatistics(): void {
    this.statistics.total_workers = this.workers.size;
    
    const healthyCount = Array.from(this.workerHealth.values())
      .filter(health => health.status === 'healthy').length;
    this.statistics.healthy_workers = healthyCount;
    
    const activeCount = Array.from(this.workerMetrics.values())
      .filter(metrics => metrics.active_tasks > 0).length;
    this.statistics.active_workers = activeCount;
    
    const totalActiveTasks = Array.from(this.workerMetrics.values())
      .reduce((sum, metrics) => sum + metrics.active_tasks, 0);
    this.statistics.average_worker_utilization = totalActiveTasks / (this.workers.size * 10);
    
    // Calculate load balance score
    const loads = Array.from(this.workerMetrics.values()).map(m => m.load_factor);
    const avgLoad = loads.reduce((sum, load) => sum + load, 0) / loads.length;
    const variance = loads.reduce((sum, load) => sum + Math.pow(load - avgLoad, 2), 0) / loads.length;
    this.statistics.load_balance_score = Math.max(0, 1 - variance);
    
    this.statistics.total_tasks_assigned = this.taskAssignments.size;
  }
}

export default WorkerLoadBalancer;