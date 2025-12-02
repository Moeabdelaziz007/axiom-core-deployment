/**
 * GhostCursor - A utility class for generating human-like mouse movement paths
 * 
 * This class implements realistic mouse movement patterns using:
 * - Cubic Bezier curves with randomized control points
 * - Fitts' Law velocity simulation (slow start, acceleration, deceleration)
 * - Overshoot and micro-correction functionality
 */

/**
 * Interface representing a 2D coordinate point
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Interface representing a point along a path with timing information
 */
export interface PathPoint extends Point {
  timestamp: number;
  velocity?: number;
}

/**
 * Interface representing the complete path data
 */
export interface PathData {
  points: PathPoint[];
  duration: number;
  distance: number;
  hasOvershoot: boolean;
}

/**
 * Configuration options for path generation
 */
interface PathConfig {
  baseVelocity: number;
  accelerationFactor: number;
  decelerationFactor: number;
  overshootProbability: number;
  overshootDistance: number;
  correctionSpeed: number;
  jitterAmount: number;
}

/**
 * GhostCursor class for generating human-like mouse movement paths
 */
export class GhostCursor {
  private config: PathConfig;

  constructor() {
    // Default configuration optimized for natural mouse movement
    this.config = {
      baseVelocity: 800, // pixels per second
      accelerationFactor: 2.5,
      decelerationFactor: 3.0,
      overshootProbability: 0.3,
      overshootDistance: 15, // pixels
      correctionSpeed: 400, // pixels per second
      jitterAmount: 0.5 // pixels
    };
  }

  /**
   * Generate a human-like path from start to end point
   * @param start The starting point
   * @param end The destination point
   * @returns PathData containing the complete path information
   */
  public generatePath(start: Point, end: Point): PathData {
    // Determine if we should add overshoot
    const hasOvershoot = Math.random() < this.config.overshootProbability;
    
    // Calculate initial target (may be overshoot point)
    const target = hasOvershoot ? this.calculateOvershootPoint(start, end) : end;
    
    // Generate Bezier control points
    const controlPoints = this.generateBezierControlPoints(start, target);
    
    // Calculate path duration based on Fitts' Law
    const distance = this.calculateDistance(start, target);
    const duration = this.calculateDuration(distance);
    
    // Generate path points with velocity simulation
    const points = this.generatePathPoints(start, target, controlPoints, duration);
    
    // Add micro-corrections if we have overshoot
    if (hasOvershoot) {
      const correctionPath = this.generateCorrectionPath(target, end);
      points.push(...correctionPath);
    }
    
    // Add subtle jitter to make movement more natural
    this.addJitter(points);
    
    return {
      points,
      duration: hasOvershoot ? duration + this.calculateDuration(this.calculateDistance(target, end)) : duration,
      distance: this.calculateTotalDistance(points),
      hasOvershoot
    };
  }

  /**
   * Calculate overshoot point beyond the target
   */
  private calculateOvershootPoint(start: Point, end: Point): Point {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const overshootAmount = this.config.overshootDistance * (0.5 + Math.random() * 0.5);
    
    return {
      x: end.x + Math.cos(angle) * overshootAmount,
      y: end.y + Math.sin(angle) * overshootAmount
    };
  }

  /**
   * Generate two randomized control points for cubic Bezier curve
   */
  private generateBezierControlPoints(start: Point, end: Point): [Point, Point] {
    // Calculate midpoint and perpendicular direction
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    // Calculate angle of the direct path
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const perpAngle = angle + Math.PI / 2;
    
    // Randomize control point distances (30-70% of path length)
    const pathLength = this.calculateDistance(start, end);
    const controlDistance1 = pathLength * (0.3 + Math.random() * 0.4);
    const controlDistance2 = pathLength * (0.3 + Math.random() * 0.4);
    
    // Randomize control point positions along the path
    const t1 = 0.2 + Math.random() * 0.2; // 20-40% along the path
    const t2 = 0.6 + Math.random() * 0.2; // 60-80% along the path
    
    // Calculate control point positions
    const cp1 = {
      x: start.x + (end.x - start.x) * t1 + Math.cos(perpAngle) * controlDistance1 * (Math.random() > 0.5 ? 1 : -1),
      y: start.y + (end.y - start.y) * t1 + Math.sin(perpAngle) * controlDistance1 * (Math.random() > 0.5 ? 1 : -1)
    };
    
    const cp2 = {
      x: start.x + (end.x - start.x) * t2 + Math.cos(perpAngle) * controlDistance2 * (Math.random() > 0.5 ? 1 : -1),
      y: start.y + (end.y - start.y) * t2 + Math.sin(perpAngle) * controlDistance2 * (Math.random() > 0.5 ? 1 : -1)
    };
    
    return [cp1, cp2];
  }

  /**
   * Calculate Euclidean distance between two points
   */
  private calculateDistance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * Calculate movement duration based on Fitts' Law
   * Fitts' Law: MT = a + b * log2(D/W + 1)
   * Where MT = movement time, D = distance, W = target width
   */
  private calculateDuration(distance: number): number {
    // Assume target width of 20 pixels
    const targetWidth = 20;
    const a = 0.1; // Constant time in seconds
    const b = 0.1; // Scaling factor
    
    // Fitts' Law calculation
    const fittsTime = a + b * Math.log2(distance / targetWidth + 1);
    
    // Scale to our velocity model and convert to milliseconds
    return Math.max(200, fittsTime * 1000); // Minimum 200ms
  }

  /**
   * Generate path points along the Bezier curve with velocity simulation
   */
  private generatePathPoints(
    start: Point, 
    end: Point, 
    controlPoints: [Point, Point], 
    duration: number
  ): PathPoint[] {
    const points: PathPoint[] = [];
    const numPoints = Math.max(20, Math.floor(duration / 16)); // ~60fps
    const startTime = Date.now();
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      
      // Calculate position on Bezier curve
      const point = this.calculateBezierPoint(t, start, controlPoints[0], controlPoints[1], end);
      
      // Calculate velocity based on Fitts' Law model (slow start, accelerate, decelerate)
      const velocity = this.calculateVelocity(t, duration);
      
      points.push({
        ...point,
        timestamp: startTime + t * duration,
        velocity
      });
    }
    
    return points;
  }

  /**
   * Calculate point on cubic Bezier curve at parameter t (0 to 1)
   */
  private calculateBezierPoint(
    t: number, 
    p0: Point, 
    p1: Point, 
    p2: Point, 
    p3: Point
  ): Point {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    
    return {
      x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
      y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
    };
  }

  /**
   * Calculate velocity at position t based on Fitts' Law model
   * Implements slow start, acceleration, and deceleration phases
   */
  private calculateVelocity(t: number, duration: number): number {
    // Normalize time to 0-1 range
    const normalizedT = t;
    
    // Acceleration phase (0-0.3)
    if (normalizedT < 0.3) {
      const accelT = normalizedT / 0.3;
      return this.config.baseVelocity * (accelT * accelT * this.config.accelerationFactor);
    }
    
    // Constant velocity phase (0.3-0.7)
    if (normalizedT < 0.7) {
      return this.config.baseVelocity;
    }
    
    // Deceleration phase (0.7-1.0)
    const decelT = (normalizedT - 0.7) / 0.3;
    return this.config.baseVelocity * (1 - decelT * decelT * this.config.decelerationFactor);
  }

  /**
   * Generate micro-correction path from overshoot point to target
   */
  private generateCorrectionPath(from: Point, to: Point): PathPoint[] {
    const distance = this.calculateDistance(from, to);
    const duration = this.calculateDuration(distance) * 0.7; // Corrections are faster
    const numPoints = Math.max(10, Math.floor(duration / 16));
    const startTime = Date.now();
    const points: PathPoint[] = [];
    
    for (let i = 1; i <= numPoints; i++) {
      const t = i / numPoints;
      const point = {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t
      };
      
      // Correction movements have different velocity profile
      const velocity = this.config.correctionSpeed * (1 - t * 0.5);
      
      points.push({
        ...point,
        timestamp: startTime + t * duration,
        velocity
      });
    }
    
    return points;
  }

  /**
   * Add subtle jitter to path points for more natural movement
   */
  private addJitter(points: PathPoint[]): void {
    points.forEach(point => {
      point.x += (Math.random() - 0.5) * this.config.jitterAmount;
      point.y += (Math.random() - 0.5) * this.config.jitterAmount;
    });
  }

  /**
   * Calculate total distance traveled along a path
   */
  private calculateTotalDistance(points: PathPoint[]): number {
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      totalDistance += this.calculateDistance(points[i - 1], points[i]);
    }
    return totalDistance;
  }

  /**
   * Get the current configuration (for debugging purposes)
   */
  public getConfig(): PathConfig {
    return { ...this.config };
  }

  /**
   * Update configuration values
   */
  public updateConfig(newConfig: Partial<PathConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}