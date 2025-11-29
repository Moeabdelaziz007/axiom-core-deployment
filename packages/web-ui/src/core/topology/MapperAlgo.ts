/**
 * Mapper Algorithm Implementation for Axiom ID
 * 
 * This class implements a simplified Mapper algorithm to visualize the 
 * topological structure of high-dimensional agent data (e.g., thought vectors).
 * 
 * Steps:
 * 1. Filter: Project data to lower dimension (L2 Norm).
 * 2. Cover: Create overlapping intervals.
 * 3. Cluster: Group points in each interval.
 * 4. Graph: Connect overlapping clusters.
 */

interface DataPoint {
  id: string;
  vector: number[];
  metadata?: any;
}

interface Cluster {
  id: string;
  points: DataPoint[];
  intervalIndex: number;
}

interface GraphNode {
  id: string;
  size: number;
  members: string[]; // Point IDs
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export class MapperAlgo {
  private resolution: number; // Number of intervals
  private overlap: number;    // Percent overlap (0-1)
  private epsilon: number;    // Clustering distance threshold

  constructor(resolution: number = 10, overlap: number = 0.3, epsilon: number = 0.5) {
    this.resolution = resolution;
    this.overlap = overlap;
    this.epsilon = epsilon;
  }

  /**
   * Main execution method
   */
  public run(data: DataPoint[]): { nodes: GraphNode[], edges: GraphEdge[] } {
    if (data.length === 0) return { nodes: [], edges: [] };

    // 1. Filter Function (L2 Norm)
    const filterValues = data.map(p => ({ point: p, val: this.l2Norm(p.vector) }));
    const minVal = Math.min(...filterValues.map(fv => fv.val));
    const maxVal = Math.max(...filterValues.map(fv => fv.val));

    // 2. Create Cover (Intervals)
    const range = maxVal - minVal;
    const intervalSize = range / (this.resolution * (1 - this.overlap));
    const step = intervalSize * (1 - this.overlap);
    
    const intervals: { min: number, max: number, points: DataPoint[] }[] = [];
    for (let i = 0; i < this.resolution; i++) {
      const start = minVal + (i * step);
      const end = start + intervalSize;
      
      // Find points in this interval
      const pointsInInterval = filterValues
        .filter(fv => fv.val >= start && fv.val <= end)
        .map(fv => fv.point);
        
      intervals.push({ min: start, max: end, points: pointsInInterval });
    }

    // 3. Cluster within Intervals
    let clusters: Cluster[] = [];
    let clusterCounter = 0;

    intervals.forEach((interval, idx) => {
      const intervalClusters = this.simpleClustering(interval.points);
      intervalClusters.forEach(c => {
        clusters.push({
          id: `c_${clusterCounter++}`,
          points: c,
          intervalIndex: idx
        });
      });
    });

    // 4. Build Graph (Map overlaps)
    const nodes: GraphNode[] = clusters.map(c => ({
      id: c.id,
      size: c.points.length,
      members: c.points.map(p => p.id)
    }));

    const edges: GraphEdge[] = [];
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const c1 = clusters[i];
        const c2 = clusters[j];
        
        // Optimization: Only check clusters in adjacent intervals
        if (Math.abs(c1.intervalIndex - c2.intervalIndex) > 1) continue;

        const intersection = c1.points.filter(p1 => c2.points.some(p2 => p2.id === p1.id));
        
        if (intersection.length > 0) {
          edges.push({
            source: c1.id,
            target: c2.id,
            weight: intersection.length
          });
        }
      }
    }

    return { nodes, edges };
  }

  private l2Norm(vec: number[]): number {
    return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  }

  private euclideanDist(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
  }

  // Simple greedy clustering
  private simpleClustering(points: DataPoint[]): DataPoint[][] {
    const clusters: DataPoint[][] = [];
    const visited = new Set<string>();

    for (const p of points) {
      if (visited.has(p.id)) continue;
      
      const newCluster: DataPoint[] = [p];
      visited.add(p.id);

      for (const other of points) {
        if (visited.has(other.id)) continue;
        if (this.euclideanDist(p.vector, other.vector) < this.epsilon) {
          newCluster.push(other);
          visited.add(other.id);
        }
      }
      clusters.push(newCluster);
    }
    return clusters;
  }
}
