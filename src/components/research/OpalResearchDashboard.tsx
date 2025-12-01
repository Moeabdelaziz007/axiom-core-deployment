/**
 * 🔍 OPAL RESEARCH DASHBOARD
 * 
 * Visual interface for research workflow management
 * Real-time research progress visualization
 * Research result presentation and export
 * Integration with existing dashboard components
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ResearchSessionConfig, 
  ResearchDomain, 
  AgentType, 
  ResearchResult, 
  ResearchAnalytics,
  ResearchWorkflowTemplate
} from '@/types/research';
import { RESEARCH_WORKFLOW_TEMPLATES } from '@/templates/research-workflows';

// Props interface
interface OpalResearchDashboardProps {
  className?: string;
  onSessionCreated?: (sessionId: string) => void;
  onSessionCompleted?: (sessionId: string, results: ResearchResult[]) => void;
}

// Dashboard state interface
interface DashboardState {
  activeTab: 'workflows' | 'sessions' | 'analytics' | 'results';
  selectedWorkflow: ResearchWorkflowTemplate | null;
  sessionConfig: Partial<ResearchSessionConfig>;
  activeSessions: any[];
  analytics: ResearchAnalytics | null;
  selectedSession: any | null;
  isCreatingSession: boolean;
  isLoading: boolean;
  error: string | null;
  realTimeUpdates: boolean;
}

/**
 * Main Opal Research Dashboard Component
 */
export function OpalResearchDashboard({ 
  className, 
  onSessionCreated, 
  onSessionCompleted 
}: OpalResearchDashboardProps) {
  const [state, setState] = useState<DashboardState>({
    activeTab: 'workflows',
    selectedWorkflow: null,
    sessionConfig: {
      title: '',
      description: '',
      domain: ResearchDomain.BUSINESS_INTELLIGENCE,
      agentType: AgentType.TAJER,
      language: 'en',
      region: 'GCC',
      priority: 'medium',
      qualityThreshold: 80,
      culturalAdaptation: true,
      islamicCompliance: false
    },
    activeSessions: [],
    analytics: null,
    selectedSession: null,
    isCreatingSession: false,
    isLoading: false,
    error: null,
    realTimeUpdates: false
  });

  // Fetch initial data
  useEffect(() => {
    fetchDashboardData();
    setupRealTimeUpdates();
  }, []);

  /**
   * Fetch dashboard data from API
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch system status and active sessions
      const statusResponse = await fetch('/api/research/opal?action=status');
      const statusData = await statusResponse.json();

      // Fetch analytics
      const analyticsResponse = await fetch('/api/research/opal?action=analytics&timeframe=month');
      const analyticsData = await analyticsResponse.json();

      setState(prev => ({
        ...prev,
        activeSessions: statusData.activeSessions || [],
        analytics: analyticsData.analytics || null,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
        isLoading: false
      }));
    }
  }, []);

  /**
   * Setup real-time updates using SSE
   */
  const setupRealTimeUpdates = useCallback(() => {
    try {
      const eventSource = new EventSource('/api/research/opal?action=subscribe');

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'progress':
            updateSessionProgress(data.data);
            break;
          case 'completed':
            handleSessionCompleted(data.data);
            break;
          case 'failed':
            handleSessionFailed(data.data);
            break;
          case 'heartbeat':
            // Handle heartbeat if needed
            break;
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setState(prev => ({ ...prev, realTimeUpdates: false }));
      };

      setState(prev => ({ ...prev, realTimeUpdates: true }));

      return () => {
        eventSource.close();
      };
    } catch (error) {
      console.error('Failed to setup real-time updates:', error);
      setState(prev => ({ ...prev, realTimeUpdates: false }));
    }
  }, []);

  /**
   * Update session progress in state
   */
  const updateSessionProgress = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      activeSessions: prev.activeSessions.map(session =>
        session.id === data.sessionId
          ? { ...session, ...data }
          : session
      )
    }));
  }, []);

  /**
   * Handle session completion
   */
  const handleSessionCompleted = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      activeSessions: prev.activeSessions.filter(session => session.id !== data.sessionId)
    }));

    if (onSessionCompleted) {
      onSessionCompleted(data.sessionId, data.results || []);
    }
  }, [onSessionCompleted]);

  /**
   * Handle session failure
   */
  const handleSessionFailed = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      activeSessions: prev.activeSessions.map(session =>
        session.id === data.sessionId
          ? { ...session, status: 'failed', error: data.error }
          : session
      )
    }));
  }, []);

  /**
   * Create new research session
   */
  const createResearchSession = useCallback(async () => {
    if (!state.sessionConfig.title || !state.sessionConfig.domain || !state.sessionConfig.agentType) {
      setState(prev => ({ ...prev, error: 'Please fill in all required fields' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isCreatingSession: true, error: null }));

      const response = await fetch('/api/research/opal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start_session',
          config: state.sessionConfig
        })
      });

      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          isCreatingSession: false,
          sessionConfig: {
            ...prev.sessionConfig,
            title: '',
            description: ''
          }
        }));

        // Refresh dashboard data
        await fetchDashboardData();

        if (onSessionCreated) {
          onSessionCreated(result.sessionId);
        }
      } else {
        throw new Error(result.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('Failed to create research session:', error);
      setState(prev => ({
        ...prev,
        isCreatingSession: false,
        error: error instanceof Error ? error.message : 'Failed to create session'
      }));
    }
  }, [state.sessionConfig, fetchDashboardData, onSessionCreated]);

  /**
   * Cancel research session
   */
  const cancelSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch('/api/research/opal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel_session',
          sessionId
        })
      });

      const result = await response.json();

      if (result.success) {
        await fetchDashboardData();
      } else {
        throw new Error(result.error || 'Failed to cancel session');
      }
    } catch (error) {
      console.error('Failed to cancel session:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to cancel session'
      }));
    }
  }, [fetchDashboardData]);

  /**
   * Export research results
   */
  const exportResults = useCallback(async (sessionId: string, format: string = 'json') => {
    try {
      const response = await fetch('/api/research/opal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'export_results',
          sessionId,
          exportConfig: {
            format,
            language: 'en',
            includeSections: ['summary', 'insights', 'data_points'],
            branding: {},
            customization: {
              confidentiality: 'public',
              pagination: true,
              tableOfContents: true,
              executiveSummary: true
            }
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        // Download the export
        const blob = new Blob([JSON.stringify(result.exportData.data, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `research-results-${sessionId}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        throw new Error(result.error || 'Failed to export results');
      }
    } catch (error) {
      console.error('Failed to export results:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export results'
      }));
    }
  }, []);

  /**
   * Get status badge color
   */
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
      case 'analyzing':
      case 'collecting':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  /**
   * Get agent type display name
   */
  const getAgentTypeDisplayName = (agentType: AgentType) => {
    switch (agentType) {
      case AgentType.TAJER:
        return 'Tajer (Business)';
      case AgentType.MUSAFIR:
        return 'Musafir (Travel)';
      case AgentType.SOFRA:
        return 'Sofra (Culinary)';
      case AgentType.MOSTASHAR:
        return 'Mostashar (Legal)';
      default:
        return agentType;
    }
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opal Research Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered research with MENA expertise
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={state.realTimeUpdates ? 'default' : 'secondary'}>
            {state.realTimeUpdates ? '🟢 Live' : '🔴 Offline'}
          </Badge>
          <Button variant="outline" onClick={fetchDashboardData}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">⚠️</span>
              <span className="text-red-800">{state.error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, error: null }))}
              >
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={state.activeTab} onValueChange={(tab) => setState(prev => ({ ...prev, activeTab: tab as any }))}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflows">📋 Workflows</TabsTrigger>
          <TabsTrigger value="sessions">🔄 Sessions</TabsTrigger>
          <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
          <TabsTrigger value="results">📄 Results</TabsTrigger>
        </TabsList>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workflow Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Research Workflow</CardTitle>
                <CardDescription>
                  Choose a pre-built workflow for your research needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={state.selectedWorkflow?.id || ''}
                  onValueChange={(value) => {
                    const workflow = RESEARCH_WORKFLOW_TEMPLATES.find(w => w.id === value);
                    setState(prev => ({ ...prev, selectedWorkflow: workflow || null }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a workflow..." />
                  </SelectTrigger>
                  <SelectContent>
                    {RESEARCH_WORKFLOW_TEMPLATES.map((workflow) => (
                      <SelectItem key={workflow.id} value={workflow.id}>
                        <div>
                          <div className="font-medium">{workflow.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {workflow.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {state.selectedWorkflow && (
                  <div className="space-y-3 p-3 bg-muted rounded-lg">
                    <h4 className="font-medium">{state.selectedWorkflow.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {state.selectedWorkflow.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        Domain: {state.selectedWorkflow.domain}
                      </Badge>
                      <Badge variant="outline">
                        Agent: {getAgentTypeDisplayName(state.selectedWorkflow.agentType)}
                      </Badge>
                      <Badge variant="outline">
                        Duration: {state.selectedWorkflow.metadata.estimatedDuration}min
                      </Badge>
                      <Badge variant="outline">
                        Cost: ${state.selectedWorkflow.metadata.estimatedCost}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Research Configuration</CardTitle>
                <CardDescription>
                  Configure your research session parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Research Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter research title..."
                    value={state.sessionConfig.title || ''}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      sessionConfig: { ...prev.sessionConfig, title: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your research objectives..."
                    value={state.sessionConfig.description || ''}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      sessionConfig: { ...prev.sessionConfig, description: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="domain">Research Domain *</Label>
                    <Select
                      value={state.sessionConfig.domain || ''}
                      onValueChange={(value) => setState(prev => ({
                        ...prev,
                        sessionConfig: { ...prev.sessionConfig, domain: value as ResearchDomain }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ResearchDomain.BUSINESS_INTELLIGENCE}>
                          Business Intelligence
                        </SelectItem>
                        <SelectItem value={ResearchDomain.TRAVEL_INTELLIGENCE}>
                          Travel Intelligence
                        </SelectItem>
                        <SelectItem value={ResearchDomain.CULINARY_RESEARCH}>
                          Culinary Research
                        </SelectItem>
                        <SelectItem value={ResearchDomain.LEGAL_RESEARCH}>
                          Legal Research
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agentType">Agent Type *</Label>
                    <Select
                      value={state.sessionConfig.agentType || ''}
                      onValueChange={(value) => setState(prev => ({
                        ...prev,
                        sessionConfig: { ...prev.sessionConfig, agentType: value as AgentType }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={AgentType.TAJER}>
                          {getAgentTypeDisplayName(AgentType.TAJER)}
                        </SelectItem>
                        <SelectItem value={AgentType.MUSAFIR}>
                          {getAgentTypeDisplayName(AgentType.MUSAFIR)}
                        </SelectItem>
                        <SelectItem value={AgentType.SOFRA}>
                          {getAgentTypeDisplayName(AgentType.SOFRA)}
                        </SelectItem>
                        <SelectItem value={AgentType.MOSTASHAR}>
                          {getAgentTypeDisplayName(AgentType.MOSTASHAR)}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={state.sessionConfig.language || ''}
                      onValueChange={(value) => setState(prev => ({
                        ...prev,
                        sessionConfig: { ...prev.sessionConfig, language: value as 'en' | 'ar' }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية (Arabic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select
                      value={state.sessionConfig.region || ''}
                      onValueChange={(value) => setState(prev => ({
                        ...prev,
                        sessionConfig: { ...prev.sessionConfig, region: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GCC">GCC</SelectItem>
                        <SelectItem value="Levant">Levant</SelectItem>
                        <SelectItem value="North Africa">North Africa</SelectItem>
                        <SelectItem value="MENA">MENA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={state.sessionConfig.priority || ''}
                    onValueChange={(value) => setState(prev => ({
                      ...prev,
                      sessionConfig: { ...prev.sessionConfig, priority: value as any }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualityThreshold">Quality Threshold ({state.sessionConfig.qualityThreshold}%)</Label>
                  <Input
                    id="qualityThreshold"
                    type="range"
                    min="50"
                    max="100"
                    value={state.sessionConfig.qualityThreshold || 80}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      sessionConfig: { ...prev.sessionConfig, qualityThreshold: parseInt(e.target.value) }
                    }))}
                  />
                </div>

                <Button 
                  onClick={createResearchSession}
                  disabled={state.isCreatingSession || !state.sessionConfig.title}
                  className="w-full"
                >
                  {state.isCreatingSession ? 'Creating...' : '🚀 Start Research Session'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Research Sessions</CardTitle>
              <CardDescription>
                Monitor and manage your ongoing research sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.activeSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active research sessions. Start a new session from the Workflows tab.
                </div>
              ) : (
                <div className="space-y-4">
                  {state.activeSessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{session.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {session.domain} • {getAgentTypeDisplayName(session.agentType)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusBadgeColor(session.status)}>
                            {session.status}
                          </Badge>
                          {session.status === 'running' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelSession(session.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>

                      {session.progress > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{session.progress}%</span>
                          </div>
                          <Progress value={session.progress} className="w-full" />
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Started:</span>
                          <div>{new Date(session.startTime).toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Results:</span>
                          <div>{session.resultsCount || 0}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <div>
                            {session.duration ? `${Math.round(session.duration)}min` : 'In progress'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {state.analytics ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{state.analytics.totalSessions}</div>
                      <div className="text-sm text-muted-foreground">Total Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{state.analytics.averageQualityScore.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Avg Quality</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">${state.analytics.totalCost.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Total Cost</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{state.analytics.averageSessionDuration.toFixed(0)}min</div>
                      <div className="text-sm text-muted-foreground">Avg Duration</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Domain Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(state.analytics.domainDistribution).map(([domain, count]) => (
                      <div key={domain} className="flex items-center justify-between">
                        <span className="capitalize">{domain.replace('_', ' ')}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No analytics data available yet.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Research Results</CardTitle>
              <CardDescription>
                View and export completed research results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Select a completed session from the Sessions tab to view results.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default OpalResearchDashboard;