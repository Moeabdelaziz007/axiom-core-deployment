import { NextRequest, NextResponse } from 'next/server';

// Mock component status data - in production, this would come from actual monitoring systems
const mockComponentData = {
  'Market Analyst Agent': {
    name: 'Market Analyst Agent',
    status: 'healthy' as const,
    uptime: 99.9,
    lastCheck: new Date(),
    responseTime: 145,
    errorRate: 0.2,
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    requests: 1247,
    activeConnections: 89
  },
  'Operations Automation Agent': {
    name: 'Operations Automation Agent',
    status: 'healthy' as const,
    uptime: 99.8,
    lastCheck: new Date(),
    responseTime: 98,
    errorRate: 0.1,
    cpuUsage: 32,
    memoryUsage: 54,
    diskUsage: 41,
    requests: 892,
    activeConnections: 67
  },
  'Secure IDP Pipeline': {
    name: 'Secure IDP Pipeline',
    status: 'healthy' as const,
    uptime: 99.95,
    lastCheck: new Date(),
    responseTime: 76,
    errorRate: 0.05,
    cpuUsage: 28,
    memoryUsage: 41,
    diskUsage: 35,
    requests: 2156,
    activeConnections: 234
  },
  'API Gateway': {
    name: 'API Gateway',
    status: 'warning' as const,
    uptime: 99.7,
    lastCheck: new Date(),
    responseTime: 234,
    errorRate: 1.2,
    cpuUsage: 78,
    memoryUsage: 82,
    diskUsage: 56,
    requests: 3421,
    activeConnections: 445
  }
};

export async function GET(request: NextRequest) {
  try {
    // In production, this would fetch real data from monitoring systems
    // For now, we'll return mock data with some randomization to simulate real-time updates
    
    const components = Object.entries(mockComponentData).map(([name, data]) => {
      // Add some randomization to simulate real-time changes
      const randomVariation = () => Math.random() * 10 - 5; // -5 to +5
      
      return {
        ...data,
        lastCheck: new Date(),
        responseTime: Math.max(50, data.responseTime + randomVariation()),
        errorRate: Math.max(0, data.errorRate + randomVariation() * 0.1),
        cpuUsage: Math.max(0, Math.min(100, data.cpuUsage + randomVariation())),
        memoryUsage: Math.max(0, Math.min(100, data.memoryUsage + randomVariation())),
        requests: data.requests + Math.floor(Math.random() * 10),
        activeConnections: Math.max(0, data.activeConnections + Math.floor(randomVariation() * 2))
      };
    });

    return NextResponse.json(components);
  } catch (error) {
    console.error('Error fetching component status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch component status' },
      { status: 500 }
    );
  }
}