import { NextRequest, NextResponse } from 'next/server';

// In-memory store for alerts (in production, this would be a database)
// This should match the alerts from the main alerts route
let alerts = [
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const alertId = id;

    // Find the alert
    const alertIndex = alerts.findIndex(alert => alert.id === alertId);

    if (alertIndex === -1) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    // Update the alert acknowledgment status
    alerts[alertIndex] = {
      ...alerts[alertIndex],
      acknowledged: true
    };

    return NextResponse.json({
      id: alertId,
      acknowledged: true,
      message: 'Alert acknowledged successfully'
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge alert' },
      { status: 500 }
    );
  }
}