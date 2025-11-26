import { NextRequest, NextResponse } from 'next/server';
import { getMonitor } from '../../../infra/monitoring/production-monitor';

export async function GET(request: NextRequest) {
  try {
    const monitor = getMonitor();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const format = searchParams.get('format') || 'json';

    switch (type) {
      case 'health':
        const health = await monitor.getSystemHealth();
        return NextResponse.json(health);
        
      case 'metrics':
        const metrics = monitor.getMetrics();
        return format === 'csv' 
          ? new NextResponse(metricsToCSV(metrics), {
              headers: { 'Content-Type': 'text/csv' }
            })
          : NextResponse.json(metrics);
          
      case 'alerts':
        const alerts = monitor.getAlerts();
        return NextResponse.json(alerts);
        
      default:
        // Return all monitoring data
        const allData = {
          health: await monitor.getSystemHealth(),
          metrics: monitor.getMetrics(),
          alerts: monitor.getAlerts(),
          timestamp: new Date().toISOString()
        };
        return NextResponse.json(allData);
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve monitoring data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const monitor = getMonitor();
    const { action } = await request.json();

    switch (action) {
      case 'acknowledge-alert':
        const { alertId } = await request.json();
        // In a real implementation, this would mark the alert as acknowledged
        return NextResponse.json({ 
          success: true, 
          message: `Alert ${alertId} acknowledged` 
        });
        
      case 'resolve-alert':
        const { alertId: resolveAlertId } = await request.json();
        // In a real implementation, this would mark the alert as resolved
        return NextResponse.json({ 
          success: true, 
          message: `Alert ${resolveAlertId} resolved` 
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { error: 'Failed to process monitoring action' },
      { status: 500 }
    );
  }
}

// Helper function to convert metrics to CSV format
function metricsToCSV(metrics: any[]): string {
  if (metrics.length === 0) return '';
  
  const headers = ['timestamp', 'metric', 'value', 'status'];
  const rows = metrics.map(metric => [
    metric.timestamp.toISOString(),
    metric.metric,
    metric.value,
    metric.status
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}