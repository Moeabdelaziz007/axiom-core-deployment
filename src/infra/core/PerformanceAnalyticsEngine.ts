export class PerformanceAnalyticsEngine {
  detectAnomalies(scope: string, metrics: any[]) {
    return [];
  }
  generatePerformanceScore(scope: string, metrics: any[]) {
    return { breakdown: { responseTime: 120 } };
  }
}