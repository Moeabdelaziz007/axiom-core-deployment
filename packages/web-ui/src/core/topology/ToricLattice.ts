export interface LatticeNode {
  x: number;
  y: number;
  agentId: string | null;
  state: any;
  stabilizer: number; // +1 or -1
}

export class ToricLattice {
  private grid: LatticeNode[][];
  private width: number;
  private height: number;
  private agentMap: Map<string, { x: number; y: number }> = new Map();

  constructor(width: number = 10, height: number = 10) {
    this.width = width;
    this.height = height;
    this.grid = this.initializeGrid();
  }

  private initializeGrid(): LatticeNode[][] {
    const grid: LatticeNode[][] = [];
    for (let y = 0; y < this.height; y++) {
      const row: LatticeNode[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push({
          x,
          y,
          agentId: null,
          state: {},
          stabilizer: 1
        });
      }
      grid.push(row);
    }
    return grid;
  }

  // Register an agent to a specific node or a random empty one
  registerAgent(agentId: string, x?: number, y?: number): { x: number; y: number } | null {
    if (x !== undefined && y !== undefined) {
      if (this.grid[y][x].agentId === null) {
        this.grid[y][x].agentId = agentId;
        this.agentMap.set(agentId, { x, y });
        return { x, y };
      }
    }

    // Find random empty spot
    for (let i = 0; i < 100; i++) {
      const rx = Math.floor(Math.random() * this.width);
      const ry = Math.floor(Math.random() * this.height);
      if (this.grid[ry][rx].agentId === null) {
        this.grid[ry][rx].agentId = agentId;
        this.agentMap.set(agentId, { x: rx, y: ry });
        return { x: rx, y: ry };
      }
    }
    return null;
  }

  // Get neighbors of an agent (Von Neumann neighborhood on Torus)
  getNeighbors(agentId: string): string[] {
    const pos = this.agentMap.get(agentId);
    if (!pos) return [];

    const { x, y } = pos;
    const neighbors: string[] = [];

    const coords = [
      { nx: (x + 1) % this.width, ny: y },
      { nx: (x - 1 + this.width) % this.width, ny: y },
      { nx: x, ny: (y + 1) % this.height },
      { nx: x, ny: (y - 1 + this.height) % this.height }
    ];

    coords.forEach(({ nx, ny }) => {
      const neighborId = this.grid[ny][nx].agentId;
      if (neighborId) {
        neighbors.push(neighborId);
      }
    });

    return neighbors;
  }

  getGridState() {
    return this.grid;
  }
}
