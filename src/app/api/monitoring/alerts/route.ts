import { NextRequest, NextResponse } from 'next/server';

// Mock alerts data - in production, this would come from actual monitoring systems
const mockAlerts = [
  {
    id: 'alert-001',
    component: 'API Gateway',
    severity: 'warning' as const,
    title: 'High Response Time',
    message: 'API Gateway response time exceeded threshold of 200ms',
    timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
    acknowledged: false
  },
  {
    id: 'alert-002',
    component: 'Market Analyst Agent',
    severity: 'info' as const,
    title: 'Scheduled Maintenance',
    message: 'Market Analyst Agent will undergo scheduled maintenance in 2 hours',
    timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
    acknowledged: true
  },
  {
    id: 'alert-003',
    component: 'Secure IDP Pipeline',
    severity: 'critical' as const,
    title: 'Authentication Failure Rate',
    message: 'Authentication failure rate increased by 15% in the last hour',
    timestamp: new Date(Date.now() - 45 * 60000), // 45 minutes ago
    acknowledged: false
  },
  {
    id: 'alert-004',
    component: 'Operations Automation Agent',
    severity: 'info' as const,
    title: 'Deployment Completed',
    message: 'Successfully deployed version 2.1.3 to staging environment',
    timestamp: new Date(Date.now() - 60 * 60000), // 1 hour ago
    acknowledged: true
  },
  {
    id: 'alert-005',
    component: 'API Gateway',
    severity: 'warning' as const,
    title: 'Memory Usage High',
    message: 'Memory usage exceeded 80% threshold',
    timestamp: new Date(Date.now() - 90 * 60000), // 1.5 hours ago
    acknowledged: false
  }
];

// In-memory store for alerts (in production, this would be a database)
let alerts = [...mockAlerts];

export async function GET(request: NextRequest) {
  try {
    // Sort alerts by timestamp (newest first)
    const sortedAlerts = [...alerts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return NextResponse.json(sortedAlerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { component, severity, title, message } = body;

    // Validate required fields
    if (!component || !severity || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: component, severity, title, message' },
        { status: 400 }
      );
    }

    // Create new alert
    const newAlert = {
      id: `alert-${Date.now()}`,
      component,
      severity,
      title,
      message,
      timestamp: new Date(),
      acknowledged: false
    };

    // Add to alerts array
    alerts.unshift(newAlert);

    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}