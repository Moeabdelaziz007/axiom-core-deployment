/**
 * Animation Performance Test Suite
 * 
 * Comprehensive testing for 60fps animation performance
 * including frame rate monitoring, memory usage, and GPU acceleration
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { act, render, cleanup } from '@testing-library/react';
import React from 'react';
import { AnimationPerformanceMonitor } from '../animationPerformanceMonitor';
import { detectDeviceCapabilities } from '../animationUtils';

// Mock performance API for testing
const mockPerformanceAPI = () => {
  Object.defineProperty(window, 'performance', {
    value: {
      now: jest.fn(() => Date.now()),
      memory: {
        usedJSHeapSize: 10 * 1024 * 1024, // 10MB
        totalJSHeapSize: 50 * 1024 * 1024, // 50MB
        deviceMemory: 8 // 8GB
      }
    },
    writable: true
  });
};

// Mock requestAnimationFrame
const mockRAF = () => {
  let rafId = 0;
  const callbacks: Set<FrameRequestCallback> = new Set();
  
  Object.defineProperty(window, 'requestAnimationFrame', {
    value: jest.fn((callback) => {
      const id = ++rafId;
      callbacks.add(callback);
      
      // Simulate immediate execution for testing
      setTimeout(() => callback(Date.now()), 0);
      
      return id;
    }),
    writable: true
  });
  
  Object.defineProperty(window, 'cancelAnimationFrame', {
    value: jest.fn((id) => {
      // In real implementation, this would cancel the callback
      callbacks.forEach(callback => {
        // Simulate cancellation
        callbacks.delete(callback);
      });
    }),
    writable: true
  });
};

describe('Animation Performance Tests', () => {
  let monitor: AnimationPerformanceMonitor;
  
  beforeEach(() => {
    mockPerformanceAPI();
    mockRAF();
    monitor = new AnimationPerformanceMonitor();
  });
  
  afterEach(() => {
    monitor.stopMonitoring();
    cleanup();
  });

  describe('Device Capabilities Detection', () => {
    it('should detect high-end device', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 2,
        writable: true
      });
      
      const caps = detectDeviceCapabilities();
      
      expect(caps.pixelRatio).toBe(2);
      expect(caps.gpuAcceleration).toBe(true);
      expect(caps.preferredQuality).toBe('high');
      expect(caps.maxConcurrentAnimations).toBe(8);
    });
    
    it('should detect medium-end device', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 1.5,
        writable: true
      });
      
      Object.defineProperty(window, 'performance', {
        value: {
          now: jest.fn(() => Date.now()),
          memory: {
            deviceMemory: 4 // 4GB
          }
        },
        writable: true
      });
      
      const caps = detectDeviceCapabilities();
      
      expect(caps.pixelRatio).toBe(1.5);
      expect(caps.gpuAcceleration).toBe(true);
      expect(caps.preferredQuality).toBe('medium');
      expect(caps.maxConcurrentAnimations).toBe(4);
    });
    
    it('should detect low-end device', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 1,
        writable: true
      });
      
      Object.defineProperty(window, 'performance', {
        value: {
          now: jest.fn(() => Date.now()),
          memory: {
            deviceMemory: 2 // 2GB
          }
        },
        writable: true
      });
      
      const caps = detectDeviceCapabilities();
      
      expect(caps.pixelRatio).toBe(1);
      expect(caps.gpuAcceleration).toBe(true);
      expect(caps.preferredQuality).toBe('low');
      expect(caps.maxConcurrentAnimations).toBe(2);
    });
  });

  describe('Frame Rate Monitoring', () => {
    it('should measure 60fps performance', () => {
      monitor.startMonitoring();
      
      // Simulate 60fps (16.67ms per frame)
      const frameTimes = Array(60).fill(16.67);
      let frameIndex = 0;
      
      const simulateFrames = () => {
        if (frameIndex < frameTimes.length) {
          const mockTime = Date.now() + frameTimes[frameIndex];
          (performance.now as jest.Mock).mockReturnValue(mockTime);
          frameIndex++;
        }
      };
      
      // Simulate 1 second of animation
      for (let i = 0; i < 60; i++) {
        simulateFrames();
      }
      
      const metrics = monitor.getCurrentMetrics();
      
      expect(metrics.frameRate).toBeGreaterThanOrEqual(55); // Allow some variance
      expect(metrics.frameDrops).toBeLessThan(5);
      expect(metrics.averageFrameTime).toBeLessThan(20);
      
      monitor.stopMonitoring();
    });
    
    it('should detect frame drops', () => {
      monitor.startMonitoring();
      
      // Simulate frame drops (some frames take > 33ms)
      const frameTimes = Array(60).fill(16.67);
      frameTimes[10] = 50; // Frame drop at frame 10
      frameTimes[25] = 40; // Frame drop at frame 25
      frameTimes[40] = 35; // Frame drop at frame 40
      
      let frameIndex = 0;
      
      const simulateFrames = () => {
        if (frameIndex < frameTimes.length) {
          const mockTime = Date.now() + frameTimes[frameIndex];
          (performance.now as jest.Mock).mockReturnValue(mockTime);
          frameIndex++;
        }
      };
      
      // Simulate 1 second of animation
      for (let i = 0; i < 60; i++) {
        simulateFrames();
      }
      
      const metrics = monitor.getCurrentMetrics();
      
      expect(metrics.frameRate).toBeLessThan(55); // Frame rate should drop
      expect(metrics.frameDrops).toBeGreaterThan(2); // Should detect frame drops
      expect(metrics.averageFrameTime).toBeGreaterThan(20); // Average should increase
      
      monitor.stopMonitoring();
    });
  });

  describe('Memory Usage Monitoring', () => {
    it('should track memory usage', () => {
      monitor.startMonitoring();
      
      // Simulate increasing memory usage
      const initialMemory = 10 * 1024 * 1024; // 10MB
      const peakMemory = 25 * 1024 * 1024; // 25MB
      
      Object.defineProperty(window, 'performance', {
        value: {
          now: jest.fn(() => Date.now()),
          memory: {
            usedJSHeapSize: initialMemory,
            totalJSHeapSize: 50 * 1024 * 1024
          }
        },
        writable: true
      });
      
      // Simulate memory growth
      setTimeout(() => {
        Object.defineProperty(window, 'performance', {
          value: {
            now: jest.fn(() => Date.now()),
            memory: {
              usedJSHeapSize: peakMemory,
              totalJSHeapSize: 50 * 1024 * 1024
            }
          },
          writable: true
        });
      }, 100);
      
      // Wait for monitoring to detect
      setTimeout(() => {
        const metrics = monitor.getCurrentMetrics();
        
        expect(metrics.memoryUsage).toBeGreaterThan(15); // Should detect increase
        expect(metrics.memoryUsage).toBeLessThan(30); // But not too high
        
        monitor.stopMonitoring();
      }, 200);
    });
    
    it('should warn about high memory usage', () => {
      const consoleSpy = jest.spyOn(console, 'warn');
      
      monitor.startMonitoring();
      
      // Simulate high memory usage (> 50MB)
      Object.defineProperty(window, 'performance', {
        value: {
          now: jest.fn(() => Date.now()),
          memory: {
            usedJSHeapSize: 60 * 1024 * 1024, // 60MB
            totalJSHeapSize: 50 * 1024 * 1024
          }
        },
        writable: true
      });
      
      // Wait for monitoring to detect
      setTimeout(() => {
        const metrics = monitor.getCurrentMetrics();
        
        expect(metrics.memoryUsage).toBeGreaterThan(50);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('High memory usage')
        );
        
        consoleSpy.mockRestore();
        monitor.stopMonitoring();
      }, 200);
    });
  });

  describe('GPU Acceleration Detection', () => {
    it('should detect WebGL support', () => {
      // Mock canvas with WebGL context
      const mockCanvas = {
        getContext: jest.fn(() => ({
          // Mock WebGL context
        }))
      };
      
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'canvas') {
          return mockCanvas as any;
        }
        return originalCreateElement.call(document, tagName);
      });
      
      const caps = detectDeviceCapabilities();
      
      expect(caps.gpuAcceleration).toBe(true);
      
      // Restore original
      document.createElement = originalCreateElement;
    });
    
    it('should handle no WebGL support', () => {
      // Mock canvas without WebGL context
      const mockCanvas = {
        getContext: jest.fn(() => null)
      };
      
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'canvas') {
          return mockCanvas as any;
        }
        return originalCreateElement.call(document, tagName);
      });
      
      const caps = detectDeviceCapabilities();
      
      expect(caps.gpuAcceleration).toBe(false);
      
      // Restore original
      document.createElement = originalCreateElement;
    });
  });

  describe('Performance Recommendations', () => {
    it('should provide recommendations for low performance', () => {
      monitor.startMonitoring();
      
      // Simulate poor performance
      Object.defineProperty(window, 'performance', {
        value: {
          now: jest.fn(() => Date.now()),
          memory: {
            usedJSHeapSize: 40 * 1024 * 1024, // 40MB
            deviceMemory: 2 // 2GB
          }
        },
        writable: true
      });
      
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 1,
        writable: true
      });
      
      // Mock no WebGL
      const mockCanvas = {
        getContext: jest.fn(() => null)
      };
      
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'canvas') {
          return mockCanvas as any;
        }
        return originalCreateElement.call(document, tagName);
      });
      
      // Wait for monitoring to detect
      setTimeout(() => {
        const recommendations = monitor.getRecommendations();
        
        expect(recommendations).toContain('Reduce animation complexity or enable GPU acceleration');
        expect(recommendations).toContain('Optimize animation logic and use requestAnimationFrame');
        expect(recommendations).toContain('Implement object pooling and reduce DOM elements');
        expect(recommendations).toContain('Use CSS transforms with translate3d for GPU acceleration');
        
        // Restore original
        document.createElement = originalCreateElement;
        monitor.stopMonitoring();
      }, 200);
    });
  });

  describe('Performance Data Export', () => {
    it('should export performance data', () => {
      monitor.startMonitoring();
      
      // Simulate some metrics
      Object.defineProperty(window, 'performance', {
        value: {
          now: jest.fn(() => Date.now()),
          memory: {
            usedJSHeapSize: 15 * 1024 * 1024, // 15MB
            totalJSHeapSize: 50 * 1024 * 1024
          }
        },
        writable: true
      });
      
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 2,
        writable: true
      });
      
      // Mock canvas with WebGL
      const mockCanvas = {
        getContext: jest.fn(() => ({}))
      };
      
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'canvas') {
          return mockCanvas as any;
        }
        return originalCreateElement.call(document, tagName);
      });
      
      // Wait for initial monitoring
      setTimeout(() => {
        const exportedData = monitor.exportData();
        const data = JSON.parse(exportedData);
        
        expect(data.thresholds).toBeDefined();
        expect(data.currentMetrics).toBeDefined();
        expect(data.recommendations).toBeDefined();
        expect(data.timestamp).toBeDefined();
        
        expect(data.thresholds.targetFPS).toBe(60);
        expect(data.thresholds.minAcceptableFPS).toBe(55);
        expect(data.currentMetrics.frameRate).toBeGreaterThan(0);
        
        // Restore original
        document.createElement = originalCreateElement;
        monitor.stopMonitoring();
      }, 200);
    });
  });

  describe('Integration Tests', () => {
    it('should work with React components', async () => {
      const TestComponent = () => {
        const [isAnimating, setIsAnimating] = React.useState(false);
        
        React.useEffect(() => {
          if (isAnimating) {
            monitor.startMonitoring();
            
            return () => {
              monitor.stopMonitoring();
              setIsAnimating(false);
            };
          }
        }, [isAnimating]);
        
        return React.createElement('div', {}, 
          React.createElement('button', {
            onClick: () => setIsAnimating(true),
            'data-testid': 'start-animation'
          }, 'Start Animation'),
          React.createElement('button', {
            onClick: () => setIsAnimating(false),
            'data-testid': 'stop-animation'
          }, 'Stop Animation')
        );
      };
      
      const { getByTestId } = await render(React.createElement(TestComponent));
      
      // Start animation
      act(() => {
        getByTestId('start-animation').click();
      });
      
      // Monitor should be active
      expect(monitor.getCurrentMetrics().frameRate).toBeGreaterThan(0);
      
      // Stop animation
      act(() => {
        getByTestId('stop-animation').click();
      });
      
      // Monitor should stop
      expect(monitor.getCurrentMetrics().frameRate).toBe(0);
    });
  });
});