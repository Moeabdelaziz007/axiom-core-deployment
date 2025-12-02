/**
 * Animation Performance Monitor
 * 
 * Real-time monitoring of animation frame rates, memory usage, and performance metrics
 * for smooth 60fps optimization and bottleneck detection
 */

export interface AnimationMetrics {
  frameRate: number;
  frameDrops: number;
  averageFrameTime: number;
  memoryUsage: number;
  gpuAcceleration: boolean;
  timestamp: number;
}

export interface PerformanceThresholds {
  targetFPS: number;
  minAcceptableFPS: number;
  maxFrameTime: number; // ms
  maxMemoryUsage: number; // MB
  maxFrameDrops: number;
}

export class AnimationPerformanceMonitor {
  private frameCount = 0;
  private frameDrops = 0;
  private lastFrameTime = 0;
  private startTime = performance.now();
  private frameTimes: number[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;
  private observers: Set<() => void> = new Set();

  private readonly thresholds: PerformanceThresholds = {
    targetFPS: 60,
    minAcceptableFPS: 55,
    maxFrameTime: 16.67, // 1000ms / 60fps
    maxMemoryUsage: 50, // 50MB
    maxFrameDrops: 5 // per second
  };

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.startTime = performance.now();
    this.frameCount = 0;
    this.frameDrops = 0;
    this.frameTimes = [];
    
    // Start frame rate monitoring
    this.monitorFrameRate();
    
    // Start memory monitoring
    this.monitorMemoryUsage();
    
    // Start periodic reporting
    this.monitoringInterval = setInterval(() => {
      this.reportPerformance();
    }, 5000); // Report every 5 seconds
    
    console.log('[Animation Monitor] Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    // Cancel pending animation frame
    if (this.lastFrameTime) {
      cancelAnimationFrame(this.lastFrameTime as any);
    }
    
    console.log('[Animation Monitor] Performance monitoring stopped');
  }

  /**
   * Monitor frame rate using requestAnimationFrame
   */
  private monitorFrameRate(): void {
    const measureFrame = (currentTime: number) => {
      if (!this.isMonitoring) return;
      
      const frameTime = currentTime - this.lastFrameTime;
      this.frameTimes.push(frameTime);
      
      // Keep only last 60 frame times for rolling average
      if (this.frameTimes.length > 60) {
        this.frameTimes.shift();
      }
      
      // Check for frame drops (frame time > 2x target)
      if (frameTime > this.thresholds.maxFrameTime * 2) {
        this.frameDrops++;
      }
      
      this.frameCount++;
      this.lastFrameTime = currentTime;
      
      requestAnimationFrame(measureFrame);
    };
    
    requestAnimationFrame(measureFrame);
  }

  /**
   * Monitor memory usage
   */
  private monitorMemoryUsage(): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      setInterval(() => {
        if (!this.isMonitoring) return;
        
        const memory = (performance as any).memory;
        const memoryMB = memory.usedJSHeapSize / (1024 * 1024);
        
        if (memoryMB > this.thresholds.maxMemoryUsage) {
          console.warn(`[Animation Monitor] High memory usage: ${memoryMB.toFixed(2)}MB`);
        }
      }, 2000); // Check every 2 seconds
    }
  }

  /**
   * Get current frame rate
   */
  getCurrentFrameRate(): number {
    if (this.frameTimes.length === 0) return 0;
    
    const averageFrameTime = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
    return Math.round(1000 / averageFrameTime);
  }

  /**
   * Get average frame time
   */
  getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    return this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): number {
    if (typeof window === 'undefined' || !('memory' in performance)) return 0;
    return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
  }

  /**
   * Check if GPU acceleration is available
   */
  checkGPUAcceleration(): boolean {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  }

  /**
   * Get performance metrics
   */
  getCurrentMetrics(): AnimationMetrics {
    return {
      frameRate: this.getCurrentFrameRate(),
      frameDrops: this.frameDrops,
      averageFrameTime: this.getAverageFrameTime(),
      memoryUsage: this.getMemoryUsage(),
      gpuAcceleration: this.checkGPUAcceleration(),
      timestamp: Date.now()
    };
  }

  /**
   * Report performance metrics
   */
  private reportPerformance(): void {
    const metrics = this.getCurrentMetrics();
    const runtime = (Date.now() - this.startTime) / 1000;
    
    console.group(`[Animation Monitor] Performance Report (${runtime.toFixed(1)}s runtime)`);
    console.log(`Frame Rate: ${metrics.frameRate}fps (target: ${this.thresholds.targetFPS}fps)`);
    console.log(`Frame Drops: ${metrics.frameDrops} (max: ${this.thresholds.maxFrameDrops}/s)`);
    console.log(`Avg Frame Time: ${metrics.averageFrameTime.toFixed(2)}ms (max: ${this.thresholds.maxFrameTime}ms)`);
    console.log(`Memory Usage: ${metrics.memoryUsage.toFixed(2)}MB (max: ${this.thresholds.maxMemoryUsage}MB)`);
    console.log(`GPU Acceleration: ${metrics.gpuAcceleration ? 'Available' : 'Not Available'}`);
    
    // Performance warnings
    if (metrics.frameRate < this.thresholds.minAcceptableFPS) {
      console.warn(`⚠️ Frame rate below acceptable threshold`);
    }
    
    if (metrics.frameDrops > this.thresholds.maxFrameDrops) {
      console.warn(`⚠️ Excessive frame drops detected`);
    }
    
    if (metrics.averageFrameTime > this.thresholds.maxFrameTime) {
      console.warn(`⚠️ Average frame time exceeds target`);
    }
    
    if (metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      console.warn(`⚠️ Memory usage above threshold`);
    }
    
    console.groupEnd();
    
    // Notify observers
    this.observers.forEach(callback => callback(metrics));
  }

  /**
   * Subscribe to performance updates
   */
  subscribe(callback: (metrics: AnimationMetrics) => void): () => void {
    this.observers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.observers.delete(callback);
    };
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(): string[] {
    const metrics = this.getCurrentMetrics();
    const recommendations: string[] = [];
    
    if (metrics.frameRate < this.thresholds.minAcceptableFPS) {
      recommendations.push('Reduce animation complexity or enable GPU acceleration');
    }
    
    if (metrics.averageFrameTime > this.thresholds.maxFrameTime) {
      recommendations.push('Optimize animation logic and use requestAnimationFrame');
    }
    
    if (metrics.memoryUsage > this.thresholds.maxMemoryUsage * 0.8) {
      recommendations.push('Implement object pooling and reduce DOM elements');
    }
    
    if (!metrics.gpuAcceleration) {
      recommendations.push('Use CSS transforms with translate3d for GPU acceleration');
    }
    
    return recommendations;
  }

  /**
   * Export performance data
   */
  exportData(): string {
    const data = {
      thresholds: this.thresholds,
      currentMetrics: this.getCurrentMetrics(),
      recommendations: this.getRecommendations(),
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }
}

// Singleton instance for global monitoring
export const animationPerformanceMonitor = new AnimationPerformanceMonitor();

// Convenience functions
export const startAnimationMonitoring = () => animationPerformanceMonitor.startMonitoring();
export const stopAnimationMonitoring = () => animationPerformanceMonitor.stopMonitoring();
export const getAnimationMetrics = () => animationPerformanceMonitor.getCurrentMetrics();
export const subscribeToPerformanceUpdates = (callback: (metrics: AnimationMetrics) => void) => 
  animationPerformanceMonitor.subscribe(callback);