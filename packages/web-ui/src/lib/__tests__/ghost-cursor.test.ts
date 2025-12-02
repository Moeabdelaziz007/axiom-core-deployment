/**
 * GhostCursor Unit Tests
 * 
 * This test suite verifies the functionality of the GhostCursor class, which generates
 * human-like mouse movement paths using Bezier curves, Fitts' Law velocity simulation,
 * and overshoot correction mechanisms.
 */

import { GhostCursor, Point, PathPoint, PathData } from '../ghost-cursor';

// Mock Math.random to make tests deterministic
let mockRandomValues: number[] = [];
const originalMathRandom = Math.random;

describe('GhostCursor', () => {
  let ghostCursor: GhostCursor;
  
  beforeEach(() => {
    ghostCursor = new GhostCursor();
    mockRandomValues = [];
    Math.random = jest.fn(() => {
      const value = mockRandomValues.shift() || 0.5;
      return value;
    });
  });
  
  afterEach(() => {
    Math.random = originalMathRandom;
  });

  describe('Basic Path Generation', () => {
    /**
     * Test that paths are correctly generated between two points
     */
    it('should generate a path between two points', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 100, y: 100 };
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      expect(pathData.points).toBeDefined();
      expect(pathData.points.length).toBeGreaterThan(0);
      expect(pathData.duration).toBeGreaterThan(0);
      expect(pathData.distance).toBeGreaterThan(0);
    });

    /**
     * Test that the path contains the correct number of points
     */
    it('should generate the expected number of path points', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 200, y: 200 };
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      // Should have at least 20 points based on implementation
      expect(pathData.points.length).toBeGreaterThanOrEqual(20);
    });

    /**
     * Test that the path starts and ends at the correct coordinates
     */
    it('should start and end at the correct coordinates', () => {
      const start: Point = { x: 50, y: 50 };
      const end: Point = { x: 150, y: 150 };
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      const firstPoint = pathData.points[0];
      const lastPoint = pathData.points[pathData.points.length - 1];
      
      // Allow for small jitter in the final position
      expect(firstPoint.x).toBeCloseTo(start.x, 0);
      expect(firstPoint.y).toBeCloseTo(start.y, 0);
      expect(lastPoint.x).toBeCloseTo(end.x, 0);
      expect(lastPoint.y).toBeCloseTo(end.y, 0);
    });

    /**
     * Test that path points have timestamps in ascending order
     */
    it('should have timestamps in ascending order', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 100, y: 100 };
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      for (let i = 1; i < pathData.points.length; i++) {
        expect(pathData.points[i].timestamp).toBeGreaterThanOrEqual(pathData.points[i-1].timestamp);
      }
    });
  });

  describe('Bezier Curve Implementation', () => {
    /**
     * Test that paths have curvature (are not straight lines)
     */
    it('should generate curved paths (not straight lines)', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 200, y: 0 };
      
      // Mock random values to ensure consistent control points
      mockRandomValues = [0.5, 0.5, 0.5, 0.5]; // For control point generation
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      // Check if at least one point deviates from the straight line
      let hasCurvature = false;
      for (const point of pathData.points) {
        // For a straight horizontal line, y should be 0
        if (Math.abs(point.y) > 5) { // Allow for small jitter
          hasCurvature = true;
          break;
        }
      }
      
      expect(hasCurvature).toBe(true);
    });

    /**
     * Test that different random seeds produce different paths
     */
    it('should produce different paths with different random seeds', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 100, y: 100 };
      
      // First path with one set of random values
      mockRandomValues = [0.2, 0.3, 0.4, 0.5];
      const pathData1: PathData = ghostCursor.generatePath(start, end);
      
      // Second path with different random values
      mockRandomValues = [0.7, 0.8, 0.1, 0.9];
      const pathData2: PathData = ghostCursor.generatePath(start, end);
      
      // Paths should be different
      let pathsMatch = true;
      for (let i = 0; i < Math.min(pathData1.points.length, pathData2.points.length); i++) {
        if (Math.abs(pathData1.points[i].x - pathData2.points[i].x) > 1 ||
            Math.abs(pathData1.points[i].y - pathData2.points[i].y) > 1) {
          pathsMatch = false;
          break;
        }
      }
      
      expect(pathsMatch).toBe(false);
    });

    /**
     * Test that control points are generated at appropriate distances
     */
    it('should generate control points at appropriate distances', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 200, y: 0 };
      
      // Mock random values to control the control point distances
      mockRandomValues = [0.5, 0.5, 0.5, 0.5]; // Will result in 50% of path length
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      // The path should have curvature due to control points
      let maxDeviation = 0;
      for (const point of pathData.points) {
        maxDeviation = Math.max(maxDeviation, Math.abs(point.y));
      }
      
      // Should have some deviation from the straight line
      expect(maxDeviation).toBeGreaterThan(0);
    });
  });

  describe('Fitts\' Law Velocity Simulation', () => {
    /**
     * Test that velocity starts slow
     */
    it('should start with slow velocity', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 200, y: 200 };
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      // First point should have low velocity
      const firstVelocity = pathData.points[0].velocity || 0;
      const midVelocity = pathData.points[Math.floor(pathData.points.length / 2)].velocity || 0;
      
      expect(firstVelocity).toBeLessThan(midVelocity);
    });

    /**
     * Test that velocity accelerates in the middle
     */
    it('should accelerate to maximum velocity in the middle', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 300, y: 300 };
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      const firstVelocity = pathData.points[0].velocity || 0;
      const midVelocity = pathData.points[Math.floor(pathData.points.length / 2)].velocity || 0;
      const lastVelocity = pathData.points[pathData.points.length - 1].velocity || 0;
      
      // Middle velocity should be higher than start and end
      expect(midVelocity).toBeGreaterThan(firstVelocity);
      expect(midVelocity).toBeGreaterThan(lastVelocity);
    });

    /**
     * Test that velocity decelerates near the target
     */
    it('should decelerate near the target', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 200, y: 200 };
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      const midVelocity = pathData.points[Math.floor(pathData.points.length / 2)].velocity || 0;
      const lastVelocity = pathData.points[pathData.points.length - 1].velocity || 0;
      
      // Last velocity should be lower than middle velocity
      expect(lastVelocity).toBeLessThan(midVelocity);
    });

    /**
     * Test that total duration is reasonable for the distance
     */
    it('should have reasonable duration for the distance', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 100, y: 100 };
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      // Duration should be between 200ms and 2 seconds for this distance
      expect(pathData.duration).toBeGreaterThanOrEqual(200);
      expect(pathData.duration).toBeLessThan(2000);
    });

    /**
     * Test that longer distances result in longer durations
     */
    it('should have longer duration for longer distances', () => {
      const start: Point = { x: 0, y: 0 };
      const shortEnd: Point = { x: 50, y: 50 };
      const longEnd: Point = { x: 500, y: 500 };
      
      const shortPath: PathData = ghostCursor.generatePath(start, shortEnd);
      const longPath: PathData = ghostCursor.generatePath(start, longEnd);
      
      expect(longPath.duration).toBeGreaterThan(shortPath.duration);
    });
  });

  describe('Overshoot and Correction', () => {
    /**
     * Test that overshoot occurs with the expected probability
     */
    it('should have overshoot when random value is below threshold', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 100, y: 100 };
      
      // Mock random value less than overshoot probability (0.3)
      mockRandomValues = [0.2]; // For overshoot decision
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      expect(pathData.hasOvershoot).toBe(true);
    });

    /**
     * Test that no overshoot occurs when random value is above threshold
     */
    it('should not have overshoot when random value is above threshold', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 100, y: 100 };
      
      // Mock random value greater than overshoot probability (0.3)
      mockRandomValues = [0.5]; // For overshoot decision
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      expect(pathData.hasOvershoot).toBe(false);
    });

    /**
     * Test that correction paths bring cursor back to target
     */
    it('should bring cursor back to target after overshoot', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 100, y: 100 };
      
      // Force overshoot
      mockRandomValues = [0.2]; // For overshoot decision
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      const lastPoint = pathData.points[pathData.points.length - 1];
      
      // Final point should be close to target despite overshoot
      expect(lastPoint.x).toBeCloseTo(end.x, 0);
      expect(lastPoint.y).toBeCloseTo(end.y, 0);
    });

    /**
     * Test that correction paths are shorter than original paths
     */
    it('should have shorter correction paths than original paths', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 100, y: 100 };
      
      // Force overshoot
      mockRandomValues = [0.2]; // For overshoot decision
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      // If there's overshoot, the total distance should be greater than direct distance
      const directDistance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      
      if (pathData.hasOvershoot) {
        expect(pathData.distance).toBeGreaterThan(directDistance);
      }
    });
  });

  describe('Edge Cases', () => {
    /**
     * Test very short distances
     */
    it('should handle very short distances', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 5, y: 5 };
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      expect(pathData.points.length).toBeGreaterThan(0);
      expect(pathData.duration).toBeGreaterThanOrEqual(200); // Minimum duration
      expect(pathData.distance).toBeGreaterThan(0);
    });

    /**
     * Test very long distances
     */
    it('should handle very long distances', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 2000, y: 2000 };
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      expect(pathData.points.length).toBeGreaterThan(20);
      expect(pathData.duration).toBeGreaterThan(500); // Should take longer for long distances
      expect(pathData.distance).toBeGreaterThan(2000);
    });

    /**
     * Test same start and end points
     */
    it('should handle same start and end points', () => {
      const start: Point = { x: 100, y: 100 };
      const end: Point = { x: 100, y: 100 };
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      expect(pathData.points.length).toBeGreaterThan(0);
      // Duration should be at minimum for zero distance
      expect(pathData.duration).toBeGreaterThanOrEqual(200);
    });

    /**
     * Test negative coordinates
     */
    it('should handle negative coordinates', () => {
      const start: Point = { x: -100, y: -100 };
      const end: Point = { x: 100, y: 100 };
      
      const pathData: PathData = ghostCursor.generatePath(start, end);
      
      expect(pathData.points.length).toBeGreaterThan(0);
      expect(pathData.duration).toBeGreaterThan(0);
      
      const firstPoint = pathData.points[0];
      const lastPoint = pathData.points[pathData.points.length - 1];
      
      expect(firstPoint.x).toBeCloseTo(start.x, 0);
      expect(firstPoint.y).toBeCloseTo(start.y, 0);
      expect(lastPoint.x).toBeCloseTo(end.x, 0);
      expect(lastPoint.y).toBeCloseTo(end.y, 0);
    });
  });

  describe('Configuration', () => {
    /**
     * Test getting current configuration
     */
    it('should return current configuration', () => {
      const config = ghostCursor.getConfig();
      
      expect(config).toHaveProperty('baseVelocity');
      expect(config).toHaveProperty('accelerationFactor');
      expect(config).toHaveProperty('decelerationFactor');
      expect(config).toHaveProperty('overshootProbability');
      expect(config).toHaveProperty('overshootDistance');
      expect(config).toHaveProperty('correctionSpeed');
      expect(config).toHaveProperty('jitterAmount');
      
      expect(config.baseVelocity).toBe(800);
      expect(config.overshootProbability).toBe(0.3);
    });

    /**
     * Test updating configuration
     */
    it('should update configuration values', () => {
      ghostCursor.updateConfig({
        baseVelocity: 1000,
        overshootProbability: 0.5
      });
      
      const config = ghostCursor.getConfig();
      
      expect(config.baseVelocity).toBe(1000);
      expect(config.overshootProbability).toBe(0.5);
      // Other values should remain unchanged
      expect(config.accelerationFactor).toBe(2.5);
    });

    /**
     * Test that configuration changes affect path generation
     */
    it('should affect path generation when configuration is updated', () => {
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 100, y: 100 };
      
      // Generate path with default config
      const defaultPath: PathData = ghostCursor.generatePath(start, end);
      
      // Update config to disable overshoot
      ghostCursor.updateConfig({ overshootProbability: 0 });
      
      // Generate path with new config
      mockRandomValues = []; // Reset random values
      const newPath: PathData = ghostCursor.generatePath(start, end);
      
      expect(newPath.hasOvershoot).toBe(false);
    });
  });
});