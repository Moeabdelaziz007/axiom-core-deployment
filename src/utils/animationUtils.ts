/**
 * Optimized Animation Utilities
 * 
 * GPU-accelerated animation utilities for smooth 60fps performance
 * with memory optimization and device capability detection
 */

export interface AnimationConfig {
  duration: number;
  easing?: string;
  delay?: number;
  gpuAccelerated?: boolean;
  quality?: 'high' | 'medium' | 'low';
}

export interface DeviceCapabilities {
  pixelRatio: number;
  memoryMB?: number;
  gpuAcceleration: boolean;
  preferredQuality: 'high' | 'medium' | 'low';
  maxConcurrentAnimations: number;
}

export interface PooledElement {
  element: HTMLElement;
  inUse: boolean;
  lastUsed: number;
}

/**
 * Detect device capabilities for adaptive animation quality
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  const pixelRatio = window.devicePixelRatio || 1;
  let memoryMB: number | undefined;
  let gpuAcceleration = false;
  
  // Check for GPU acceleration
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  gpuAcceleration = !!gl;
  
  // Check memory if available
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    memoryMB = memory.deviceMemory ? memory.deviceMemory * 1024 : undefined;
  }
  
  // Determine preferred quality based on capabilities
  let preferredQuality: 'high' | 'medium' | 'low' = 'high';
  
  if (pixelRatio < 2 || (memoryMB && memoryMB < 4)) {
    preferredQuality = 'medium';
  }
  
  if (pixelRatio < 1.5 || (memoryMB && memoryMB < 2)) {
    preferredQuality = 'low';
  }
  
  // Calculate max concurrent animations based on device power
  const maxConcurrentAnimations = preferredQuality === 'high' ? 8 :
                               preferredQuality === 'medium' ? 4 : 2;
  
  return {
    pixelRatio,
    memoryMB,
    gpuAcceleration,
    preferredQuality,
    maxConcurrentAnimations
  };
}

/**
 * Object pool for DOM elements to reduce garbage collection
 */
export class ElementPool {
  private pool: PooledElement[] = [];
  private elementType: string;
  private maxSize: number;
  
  constructor(elementType: string, maxSize: number = 50) {
    this.elementType = elementType;
    this.maxSize = maxSize;
  }
  
  /**
   * Get an element from the pool or create a new one
   */
  acquire(): HTMLElement {
    // Find available element
    const availableElement = this.pool.find(el => !el.inUse);
    
    if (availableElement) {
      availableElement.inUse = true;
      availableElement.lastUsed = Date.now();
      return availableElement.element;
    }
    
    // Create new element if pool is full
    if (this.pool.length >= this.maxSize) {
      // Remove oldest unused element
      const oldestUnused = this.pool
        .filter(el => !el.inUse)
        .sort((a, b) => a.lastUsed - b.lastUsed)[0];
      
      if (oldestUnused) {
        const index = this.pool.indexOf(oldestUnused);
        this.pool.splice(index, 1);
      }
    }
    
    const element = document.createElement(this.elementType);
    this.pool.push({
      element,
      inUse: true,
      lastUsed: Date.now()
    });
    
    return element;
  }
  
  /**
   * Return an element to the pool
   */
  release(element: HTMLElement): void {
    const pooledElement = this.pool.find(el => el.element === element);
    
    if (pooledElement) {
      // Reset element state
      pooledElement.inUse = false;
      pooledElement.element.style.cssText = '';
      pooledElement.element.className = '';
      pooledElement.element.textContent = '';
      
      // Remove from DOM if still attached
      if (pooledElement.element.parentNode) {
        pooledElement.element.parentNode.removeChild(pooledElement.element);
      }
    }
  }
  
  /**
   * Clean up old unused elements
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = 60000; // 1 minute
    
    this.pool = this.pool.filter(el => {
      return el.inUse || (now - el.lastUsed) < maxAge;
    });
  }
  
  /**
   * Get pool statistics
   */
  getStats() {
    const inUse = this.pool.filter(el => el.inUse).length;
    const available = this.pool.filter(el => !el.inUse).length;
    
    return {
      total: this.pool.length,
      inUse,
      available,
      efficiency: available / (inUse + available) || 0
    };
  }
}

/**
 * GPU-accelerated animation using requestAnimationFrame
 */
export function createOptimizedAnimation(
  element: HTMLElement,
  keyframes: Keyframe[],
  config: AnimationConfig
): { start: () => void; stop: () => void } {
  let animationId: number | null = null;
  let startTime: number | null = null;
  let isPaused = false;
  
  const deviceCaps = detectDeviceCapabilities();
  const shouldUseGPU = config.gpuAccelerated !== false && deviceCaps.gpuAcceleration;
  
  // Apply GPU acceleration CSS
  if (shouldUseGPU) {
    element.style.transform = 'translate3d(0, 0, 0)';
    element.style.willChange = 'transform';
    element.style.backfaceVisibility = 'hidden';
  }
  
  // Adjust quality based on device
  const quality = config.quality || deviceCaps.preferredQuality;
  const frameSkip = quality === 'high' ? 1 : quality === 'medium' ? 2 : 3;
  
  const animate = (timestamp: number) => {
    if (isPaused) return;
    
    if (!startTime) startTime = timestamp;
    
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / config.duration, 1);
    
    // Apply easing function
    const easedProgress = applyEasing(progress, config.easing || 'ease-out');
    
    // Skip frames for performance on low-end devices
    if (Math.floor(elapsed / 16.67) % frameSkip !== 0) {
      animationId = requestAnimationFrame(animate);
      return;
    }
    
    // Apply keyframe interpolation
    const keyframeIndex = Math.min(
      Math.floor(easedProgress * (keyframes.length - 1)),
      keyframes.length - 1
    );
    
    const currentKeyframe = keyframes[keyframeIndex];
    const nextKeyframe = keyframes[Math.min(keyframeIndex + 1, keyframes.length - 1)];
    const localProgress = (easedProgress * (keyframes.length - 1)) % 1;
    
    // Interpolate between keyframes
    const interpolated = interpolateKeyframes(currentKeyframe, nextKeyframe, localProgress);
    
    // Apply styles with GPU acceleration
    if (shouldUseGPU) {
      element.style.transform = `translate3d(${interpolated.x || 0}px, ${interpolated.y || 0}px, ${interpolated.z || 0}px) ${interpolated.rotate || ''} ${interpolated.scale || ''}`;
    } else {
      element.style.left = `${interpolated.x || 0}px`;
      element.style.top = `${interpolated.y || 0}px`;
      element.style.transform = `${interpolated.rotate || ''} ${interpolated.scale || ''}`;
    }
    
    // Apply other properties
    if (interpolated.opacity !== undefined) {
      element.style.opacity = interpolated.opacity.toString();
    }
    
    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      // Animation complete
      if (config.onComplete) {
        config.onComplete();
      }
    }
  };
  
  const start = () => {
    isPaused = false;
    startTime = null;
    animationId = requestAnimationFrame(animate);
  };
  
  const stop = () => {
    isPaused = true;
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
  
  return { start, stop };
}

/**
 * Apply easing function to progress
 */
function applyEasing(progress: number, easing: string): number {
  switch (easing) {
    case 'linear':
      return progress;
    case 'ease-in':
      return progress * progress;
    case 'ease-out':
      return 1 - Math.pow(1 - progress, 2);
    case 'ease-in-out':
      return progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2);
    case 'bounce':
      if (progress < 1/2.75) {
        return 7.5625 * progress * progress;
      } else if (progress < 2/2.75) {
        return 7.5625 * (progress -= 1.5 / 2.75) * progress + 0.75;
      } else {
        return 7.5625 * (progress -= 2.25 / 2.75) * progress + 0.9375;
      }
    default:
      return progress; // Default to linear
  }
}

/**
 * Interpolate between two keyframes
 */
function interpolateKeyframes(
  from: Record<string, any>,
  to: Record<string, any>,
  progress: number
): Record<string, any> {
  const interpolated: Record<string, any> = {};
  
  const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);
  
  allKeys.forEach(key => {
    const fromValue = from[key];
    const toValue = to[key];
    
    if (typeof fromValue === 'number' && typeof toValue === 'number') {
      interpolated[key] = fromValue + (toValue - fromValue) * progress;
    } else if (typeof fromValue === 'string' && typeof toValue === 'string') {
      // Simple color interpolation (basic)
      if (fromValue.startsWith('#') && toValue.startsWith('#')) {
        interpolated[key] = interpolateColor(fromValue, toValue, progress);
      } else {
        interpolated[key] = progress > 0.5 ? toValue : fromValue;
      }
    } else {
      interpolated[key] = progress > 0.5 ? toValue : fromValue;
    }
  });
  
  return interpolated;
}

/**
 * Simple color interpolation
 */
function interpolateColor(from: string, to: string, progress: number): string {
  // Extract RGB values
  const fromRGB = hexToRgb(from);
  const toRGB = hexToRgb(to);
  
  if (!fromRGB || !toRGB) return progress > 0.5 ? to : from;
  
  const r = Math.round(fromRGB.r + (toRGB.r - fromRGB.r) * progress);
  const g = Math.round(fromRGB.g + (toRGB.g - fromRGB.g) * progress);
  const b = Math.round(fromRGB.b + (toRGB.b - fromRGB.b) * progress);
  
  return rgbToHex(r, g, b);
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Optimized particle system for effects
 */
export class OptimizedParticleSystem {
  private particles: Array<{
    element: HTMLElement;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
  }> = [];
  
  private pool: ElementPool;
  private container: HTMLElement;
  private animationId: number | null = null;
  private maxParticles: number;
  
  constructor(container: HTMLElement, maxParticles: number = 50) {
    this.container = container;
    this.maxParticles = maxParticles;
    this.pool = new ElementPool('div', maxParticles);
  }
  
  /**
   * Add a new particle
   */
  addParticle(config: {
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    life?: number;
    className?: string;
    innerHTML?: string;
  }): void {
    if (this.particles.length >= this.maxParticles) {
      // Remove oldest particle
      const oldest = this.particles.shift();
      if (oldest) {
        this.pool.release(oldest.element);
      }
    }
    
    const element = this.pool.acquire();
    element.className = config.className || 'particle';
    element.innerHTML = config.innerHTML || '';
    
    // Apply initial styles
    element.style.position = 'absolute';
    element.style.pointerEvents = 'none';
    element.style.zIndex = '1000';
    
    if (config.gpuAccelerated !== false) {
      element.style.transform = 'translate3d(0, 0, 0)';
      element.style.willChange = 'transform';
    }
    
    this.container.appendChild(element);
    
    this.particles.push({
      element,
      x: config.x || 0,
      y: config.y || 0,
      vx: config.vx || 0,
      vy: config.vy || 0,
      life: config.life || 100,
      maxLife: config.life || 100
    });
  }
  
  /**
   * Start particle animation
   */
  start(): void {
    const deviceCaps = detectDeviceCapabilities();
    const quality = deviceCaps.preferredQuality;
    const frameSkip = quality === 'high' ? 1 : quality === 'medium' ? 2 : 3;
    let frameCount = 0;
    
    const animate = (timestamp: number) => {
      // Skip frames for performance
      if (frameCount % frameSkip !== 0) {
        frameCount++;
        this.animationId = requestAnimationFrame(animate);
        return;
      }
      
      frameCount++;
      
      // Update particles
      this.particles = this.particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        
        // Apply GPU-accelerated transform
        particle.element.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0)`;
        
        if (particle.life <= 0) {
          this.pool.release(particle.element);
          return false;
        }
        
        return true;
      });
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    this.animationId = requestAnimationFrame(animate);
  }
  
  /**
   * Stop particle animation
   */
  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Clean up all particles
    this.particles.forEach(particle => {
      this.pool.release(particle.element);
    });
    this.particles = [];
  }
  
  /**
   * Get particle count
   */
  getParticleCount(): number {
    return this.particles.length;
  }
  
  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stop();
    this.pool.cleanup();
  }
}

/**
 * Throttled animation frame scheduler
 */
export class AnimationScheduler {
  private animations: Set<() => void> = new Set();
  private isRunning = false;
  private lastFrameTime = 0;
  private targetFPS = 60;
  
  constructor(targetFPS: number = 60) {
    this.targetFPS = targetFPS;
  }
  
  /**
   * Add animation to scheduler
   */
  add(animation: () => void): void {
    this.animations.add(animation);
    
    if (!this.isRunning) {
      this.start();
    }
  }
  
  /**
   * Remove animation from scheduler
   */
  remove(animation: () => void): void {
    this.animations.delete(animation);
    
    if (this.animations.size === 0) {
      this.stop();
    }
  }
  
  /**
   * Start animation loop
   */
  private start(): void {
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.scheduleFrame();
  }
  
  /**
   * Stop animation loop
   */
  private stop(): void {
    this.isRunning = false;
  }
  
  /**
   * Schedule next frame
   */
  private scheduleFrame(): void {
    if (!this.isRunning) return;
    
    const targetFrameTime = 1000 / this.targetFPS;
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    
    if (deltaTime >= targetFrameTime) {
      // Execute all animations
      this.animations.forEach(animation => animation());
      this.lastFrameTime = now;
    }
    
    // Schedule next frame
    requestAnimationFrame(() => this.scheduleFrame());
  }
}

/**
 * Memory-efficient animation state manager
 */
export class AnimationStateManager {
  private states: Map<string, any> = new Map();
  private listeners: Map<string, Set<(state: any) => void>> = new Map();
  
  /**
   * Set animation state
   */
  setState(key: string, state: any): void {
    const oldState = this.states.get(key);
    this.states.set(key, state);
    
    // Notify listeners
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(listener => listener(state, oldState));
    }
  }
  
  /**
   * Get animation state
   */
  getState(key: string): any {
    return this.states.get(key);
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(key: string, listener: (state: any, oldState: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key)!.add(listener);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }
  
  /**
   * Clean up unused states
   */
  cleanup(): void {
    // Clear states without listeners
    for (const [key, listeners] of this.listeners.entries()) {
      if (listeners.size === 0) {
        this.states.delete(key);
        this.listeners.delete(key);
      }
    }
  }
}

// Global animation scheduler instance
export const globalAnimationScheduler = new AnimationScheduler();

// Global state manager
export const animationStateManager = new AnimationStateManager();