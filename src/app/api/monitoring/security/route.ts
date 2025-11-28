import { NextRequest, NextResponse } from 'next/server';

// Mock security metrics data - in production, this would come from actual security monitoring systems
const generateSecurityMetrics = () => {
  // Add some randomization to simulate real-time changes
  const randomVariation = () => Math.random() * 10 - 5; // -5 to +5
  
  return {
    failedLogins: Math.max(0, 12 + Math.floor(randomVariation())),
    blockedAttempts: Math.max(0, 8 + Math.floor(randomVariation())),
    activeSessions: Math.max(0, 156 + Math.floor(randomVariation() * 5)),
    mfaUsage: Math.max(0, Math.min(100, 87 + randomVariation())),
    oauth2Connections: Math.max(0, 42 + Math.floor(randomVariation() * 2)),
    securityScore: Math.max(0, Math.min(100, 94 + randomVariation()))
  };
};

export async function GET(request: NextRequest) {
  try {
    // In production, this would fetch real data from security monitoring systems
    // For now, we'll return mock data with some randomization to simulate real-time updates
    const securityMetrics = generateSecurityMetrics();
    
    return NextResponse.json(securityMetrics);
  } catch (error) {
    console.error('Error fetching security metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security metrics' },
      { status: 500 }
    );
  }
}