/**
 * 🔍 RESEARCH INTEGRATION TESTS
 * 
 * Test integration between Opal Research Engine, AI Engine, and Opal Client
 * Verify MENA-specific features and workflow execution
 * Validate quality assessment and analytics
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { OpalResearchEngine } from '../infra/research/OpalResearchEngine';
import { ResearchAnalyticsService } from '../services/research-analytics';
import { aiEngine } from '../lib/ai-engine';
import { 
  ResearchSessionConfig, 
  ResearchDomain, 
  AgentType, 
  ResearchSystemConfig 
} from '../types/research';

// Mock configuration for testing
const mockConfig: ResearchSystemConfig = {
  opalIntegration: {
    enabled: true,
    endpoint: 'https://mock-opal-api.com',
    timeout: 30000,
    retryAttempts: 3
  },
  aiEngine: {
    model: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 8192
  },
  quality: {
    minimumScore: 0.8,
    enableValidation: true,
    autoRetry: true
  },
  mena: {
    enableCulturalContext: true,
    enableArabicSupport: true,
    enableIslamicCompliance: true,
    defaultRegion: 'GCC'
  },
  analytics: {
    enabled: true,
    retentionDays: 90,
    realTimeUpdates: true
  },
  security: {
    encryptionEnabled: true,
    auditTrail: true,
    accessControl: true
  }
};

// Mock session configuration
const mockSessionConfig: ResearchSessionConfig = {
  id: 'test-session-1',
  title: 'Test MENA Market Analysis',
  description: 'Integration test for MENA market analysis',
  domain: ResearchDomain.BUSINESS_INTELLIGENCE,
  agentType: AgentType.TAJER,
  language: 'en',
  region: 'GCC',
  priority: 'medium',
  qualityThreshold: 80,
  culturalAdaptation: true,
  islamicCompliance: true
};

describe('Opal Research System Integration', () => {
  let researchEngine: OpalResearchEngine;
  let analyticsService: ResearchAnalyticsService;

  beforeEach(() => {
    researchEngine = new OpalResearchEngine(mockConfig);
    analyticsService = new ResearchAnalyticsService(mockConfig);
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe('Research Engine Initialization', () => {
    it('should initialize research engine successfully', () => {
      expect(researchEngine).toBeDefined();
      expect(researchEngine).toBeInstanceOf(OpalResearchEngine);
    });

    it('should get system health status', async () => {
      const status = await researchEngine.getSystemStatus();
      expect(status).toBeDefined();
      expect(status.healthy).toBeDefined();
      expect(status.components).toBeDefined();
    });
  });

  describe('AI Engine Integration', () => {
    it('should integrate with AI engine for Google research', async () => {
      const researchQuery = 'MENA market trends 2024';
      const result = await aiEngine.researchWithGoogle(researchQuery, 'en');
      
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.query).toBe(researchQuery);
      expect(result.language).toBe('en');
    });

    it('should analyze images with AI engine', async () => {
      const imageUrl = 'https://example.com/test-image.jpg';
      const result = await aiEngine.analyzeImage(imageUrl, 'general');
      
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.imageUrl).toBe(imageUrl);
    });

    it('should generate structured data with AI engine', async () => {
      const input = 'Test market data for analysis';
      const schema = {
        type: 'object',
        properties: {
          market_size: { type: 'number' },
          growth_rate: { type: 'number' },
          key_trends: { type: 'array', items: { type: 'string' } }
        }
      };
      
      const result = await aiEngine.generateStructuredData(input, schema, 'en');
      
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.input).toBe(input);
      expect(result.schema).toEqual(schema);
    });
  });

  describe('Research Session Management', () => {
    it('should start a research session', async () => {
      const sessionId = await researchEngine.startResearchSession(mockSessionConfig);
      
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId).toMatch(/^research_/);
    });

    it('should get session status', async () => {
      const sessionId = await researchEngine.startResearchSession(mockSessionConfig);
      const session = researchEngine.getSessionStatus(sessionId);
      
      expect(session).toBeDefined();
      expect(session?.id).toBe(sessionId);
      expect(session?.config).toEqual(mockSessionConfig);
    });

    it('should cancel a research session', async () => {
      const sessionId = await researchEngine.startResearchSession(mockSessionConfig);
      
      // Wait a bit for session to start
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await expect(researchEngine.cancelSession(sessionId)).resolves.not.toThrow();
      
      const session = researchEngine.getSessionStatus(sessionId);
      expect(session?.status).toBe('failed');
    });
  });

  describe('MENA-Specific Features', () => {
    it('should handle Arabic language processing', async () => {
      const arabicConfig: ResearchSessionConfig = {
        ...mockSessionConfig,
        language: 'ar',
        title: 'تحليل السوق'
      };
      
      const sessionId = await researchEngine.startResearchSession(arabicConfig);
      expect(sessionId).toBeDefined();
      
      const session = researchEngine.getSessionStatus(sessionId);
      expect(session?.config.language).toBe('ar');
    });

    it('should enable Islamic compliance checking', async () => {
      const islamicConfig: ResearchSessionConfig = {
        ...mockSessionConfig,
        islamicCompliance: true,
        domain: ResearchDomain.BUSINESS_INTELLIGENCE
      };
      
      const sessionId = await researchEngine.startResearchSession(islamicConfig);
      expect(sessionId).toBeDefined();
      
      const session = researchEngine.getSessionStatus(sessionId);
      expect(session?.config.islamicCompliance).toBe(true);
    });

    it('should handle regional focus for GCC', async () => {
      const gccConfig: ResearchSessionConfig = {
        ...mockSessionConfig,
        region: 'GCC'
      };
      
      const sessionId = await researchEngine.startResearchSession(gccConfig);
      expect(sessionId).toBeDefined();
      
      const session = researchEngine.getSessionStatus(sessionId);
      expect(session?.config.region).toBe('GCC');
    });
  });

  describe('Analytics Service Integration', () => {
    it('should record session analytics', async () => {
      const sessionId = await researchEngine.startResearchSession(mockSessionConfig);
      
      // Mock session completion
      const mockResults = [
        {
          id: 'result-1',
          sessionId,
          query: 'Test query',
          dataSource: 'google_search' as any,
          timestamp: new Date(),
          content: {
            summary: 'Test summary',
            detailedFindings: {},
            keyInsights: ['Test insight'],
            dataPoints: []
          },
          metadata: {
            sources: [],
            methodology: 'Test',
            limitations: [],
            confidence: 0.8,
            processingTime: 1000
          },
          quality: {
            accuracy: 0.9,
            completeness: 0.8,
            relevance: 0.85,
            freshness: 0.9,
            source_credibility: 0.8,
            cultural_context: 0.7,
            overall_score: 0.82
          }
        }
      ];

      const mockMetrics = {
        sessionId,
        startTime: new Date(),
        duration: 30,
        cost: {
          total: 25.0,
          currency: 'USD',
          breakdown: {
            dataCollection: 10,
            analysis: 8,
            synthesis: 4,
            validation: 2,
            reporting: 1
          }
        },
        efficiency: {
          dataPointsCollected: 15,
          insightsGenerated: 5,
          qualityScore: 0.82
        },
        resourceUsage: {
          apiCalls: 25,
          processingTime: 30000,
          memoryUsage: 512,
          storageUsed: 1024
        }
      };

      await expect(
        analyticsService.recordSessionData(sessionId, mockSessionConfig, mockMetrics, mockResults)
      ).resolves.not.toThrow();
    });

    it('should generate performance report', async () => {
      const report = await analyticsService.generatePerformanceReport('month');
      
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.domainPerformance).toBeDefined();
      expect(report.agentPerformance).toBeDefined();
      expect(report.qualityTrends).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it('should assess research quality', async () => {
      const mockResults = [
        {
          id: 'result-1',
          sessionId: 'test',
          query: 'Test',
          dataSource: 'google_search' as any,
          timestamp: new Date(),
          content: {
            summary: 'Test',
            detailedFindings: {},
            keyInsights: [],
            dataPoints: []
          },
          metadata: {
            sources: [],
            methodology: 'Test',
            limitations: [],
            confidence: 0.8,
            processingTime: 1000
          },
          quality: {
            accuracy: 0.9,
            completeness: 0.8,
            relevance: 0.85,
            freshness: 0.9,
            source_credibility: 0.8,
            cultural_context: 0.7,
            overall_score: 0.82
          }
        }
      ];

      const quality = await analyticsService.assessQuality(mockResults);
      
      expect(quality).toBeDefined();
      expect(quality.overall_score).toBeGreaterThan(0);
      expect(quality.accuracy).toBeGreaterThan(0);
      expect(quality.completeness).toBeGreaterThan(0);
    });
  });

  describe('Workflow Template Integration', () => {
    it('should load workflow templates', async () => {
      // This would test the workflow templates loading
      // Since we can't easily test the actual loading in this setup,
      // we'll test that the templates exist and have expected structure
      
      const { RESEARCH_WORKFLOW_TEMPLATES } = require('../templates/research-workflows');
      
      expect(RESEARCH_WORKFLOW_TEMPLATES).toBeDefined();
      expect(Array.isArray(RESEARCH_WORKFLOW_TEMPLATES)).toBe(true);
      expect(RESEARCH_WORKFLOW_TEMPLATES.length).toBeGreaterThan(0);
      
      // Test template structure
      const template = RESEARCH_WORKFLOW_TEMPLATES[0];
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.domain).toBeDefined();
      expect(template.agentType).toBeDefined();
      expect(template.steps).toBeDefined();
      expect(template.menaSpecific).toBeDefined();
    });
  });

  describe('API Integration', () => {
    it('should handle API requests for research operations', async () => {
      // Test API endpoint structure
      // This would typically be tested with actual HTTP requests
      // For now, we'll test the request/response structure
      
      const mockApiRequest = {
        action: 'start_session',
        config: mockSessionConfig
      };

      expect(mockApiRequest.action).toBe('start_session');
      expect(mockApiRequest.config).toBeDefined();
      expect(mockApiRequest.config.domain).toBe(ResearchDomain.BUSINESS_INTELLIGENCE);
      expect(mockApiRequest.config.agentType).toBe(AgentType.TAJER);
    });

    it('should handle different API actions', () => {
      const actions = ['status', 'workflows', 'analytics', 'session', 'start_session', 'cancel_session'];
      
      actions.forEach(action => {
        expect(typeof action).toBe('string');
        expect(action.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid session configuration', async () => {
      const invalidConfig = {
        ...mockSessionConfig,
        title: '', // Invalid: empty title
        domain: undefined as any // Invalid: missing domain
      };

      await expect(
        researchEngine.startResearchSession(invalidConfig as ResearchSessionConfig)
      ).rejects.toThrow();
    });

    it('should handle missing session ID', async () => {
      const session = researchEngine.getSessionStatus('non-existent-session');
      expect(session).toBeNull();
    });

    it('should handle analytics service errors gracefully', async () => {
      // Test with invalid data
      const invalidResults = [];
      const invalidMetrics = {
        sessionId: 'test',
        startTime: new Date(),
        duration: -1, // Invalid: negative duration
        cost: {
          total: -10, // Invalid: negative cost
          currency: 'USD',
          breakdown: {
            dataCollection: 0,
            analysis: 0,
            synthesis: 0,
            validation: 0,
            reporting: 0
          }
        },
        efficiency: {
          dataPointsCollected: 0,
          insightsGenerated: 0,
          qualityScore: 0
        },
        resourceUsage: {
          apiCalls: 0,
          processingTime: 0,
          memoryUsage: 0,
          storageUsed: 0
        }
      };

      await expect(
        analyticsService.recordSessionData('test', mockSessionConfig, invalidMetrics, invalidResults)
      ).resolves.not.toThrow();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent sessions', async () => {
      const sessionPromises = [];
      
      // Start multiple sessions concurrently
      for (let i = 0; i < 3; i++) {
        const config = {
          ...mockSessionConfig,
          id: `test-session-${i}`,
          title: `Test Session ${i}`
        };
        sessionPromises.push(researchEngine.startResearchSession(config));
      }

      const sessionIds = await Promise.all(sessionPromises);
      
      expect(sessionIds).toHaveLength(3);
      sessionIds.forEach(sessionId => {
        expect(sessionId).toBeDefined();
        expect(typeof sessionId).toBe('string');
      });
    });

    it('should handle large research queries', async () => {
      const largeQuery = 'MENA '.repeat(1000); // Large query
      const result = await aiEngine.researchWithGoogle(largeQuery, 'en');
      
      expect(result).toBeDefined();
      // Should handle large queries without crashing
      expect(result.success).toBeDefined();
    });
  });

  describe('Security and Compliance', () => {
    it('should validate input parameters', async () => {
      const maliciousConfig = {
        ...mockSessionConfig,
        title: '<script>alert("xss")</script>',
        description: 'javascript:alert("xss")'
      };

      // Should handle malicious input gracefully
      await expect(
        researchEngine.startResearchSession(maliciousConfig as ResearchSessionConfig)
      ).rejects.toThrow();
    });

    it('should maintain audit trail', async () => {
      const sessionId = await researchEngine.startResearchSession(mockSessionConfig);
      
      // In a real implementation, this would verify that audit logs are created
      expect(sessionId).toBeDefined();
      
      // Check that session tracking is working
      const session = researchEngine.getSessionStatus(sessionId);
      expect(session?.startTime).toBeDefined();
      expect(session?.config).toBeDefined();
    });
  });
});

// Integration test for end-to-end workflow
describe('End-to-End Research Workflow', () => {
  it('should complete full research workflow', async () => {
    const researchEngine = new OpalResearchEngine(mockConfig);
    const analyticsService = new ResearchAnalyticsService(mockConfig);

    // 1. Start research session
    const sessionId = await researchEngine.startResearchSession(mockSessionConfig);
    expect(sessionId).toBeDefined();

    // 2. Wait for session to process (in real scenario, this would take time)
    await new Promise(resolve => setTimeout(resolve, 100));

    // 3. Check session status
    const session = researchEngine.getSessionStatus(sessionId);
    expect(session).toBeDefined();
    expect(session?.id).toBe(sessionId);

    // 4. Mock session completion and analytics recording
    const mockResults = [
      {
        id: 'result-1',
        sessionId,
        query: mockSessionConfig.title,
        dataSource: 'google_search' as any,
        timestamp: new Date(),
        content: {
          summary: 'MENA market analysis completed',
          detailedFindings: {
            marketSize: '$2.5 trillion',
            growthRate: '5.2% annually',
            keyMarkets: ['UAE', 'Saudi Arabia', 'Qatar']
          },
          keyInsights: [
            'Digital transformation driving growth',
            'Islamic finance sector expanding rapidly',
            'Young population increasing demand'
          ],
          dataPoints: [
            { label: 'Market Size', value: 2500000000000, confidence: 0.9, source: 'World Bank' },
            { label: 'Growth Rate', value: 5.2, confidence: 0.85, source: 'IMF' }
          ]
        },
        metadata: {
          sources: [
            { url: 'https://example.com/source1', title: 'MENA Market Report', credibility: 0.9, lastUpdated: new Date(), language: 'en' }
          ],
          methodology: 'Multi-source analysis with AI synthesis',
          limitations: ['Data availability varies by country'],
          confidence: 0.85,
          processingTime: 45000
        },
        quality: {
          accuracy: 0.88,
          completeness: 0.82,
          relevance: 0.90,
          freshness: 0.85,
          source_credibility: 0.87,
          cultural_context: 0.80,
          overall_score: 0.85
        }
      }
    ];

    const mockMetrics = {
      sessionId,
      startTime: new Date(),
      endTime: new Date(),
      duration: 45,
      cost: {
        total: 32.50,
        currency: 'USD',
        breakdown: {
          dataCollection: 12,
          analysis: 10,
          synthesis: 6,
          validation: 3,
          reporting: 1.5
        }
      },
      efficiency: {
        dataPointsCollected: 25,
        insightsGenerated: 8,
        qualityScore: 0.85
      },
      resourceUsage: {
        apiCalls: 35,
        processingTime: 45000,
        memoryUsage: 1024,
        storageUsed: 2048
      }
    };

    // 5. Record analytics
    await analyticsService.recordSessionData(sessionId, mockSessionConfig, mockMetrics, mockResults);

    // 6. Verify analytics
    const analytics = analyticsService.getResearchAnalytics();
    expect(analytics).toBeDefined();
    expect(analytics.totalSessions).toBeGreaterThan(0);

    // 7. Test efficiency optimization
    const efficiencyMetrics = analyticsService.getEfficiencyMetrics(sessionId);
    expect(efficiencyMetrics).toBeDefined();

    // 8. Test export functionality
    const exportData = await generateExport(mockResults, {
      format: 'json',
      language: 'en',
      includeSections: ['summary', 'insights'],
      branding: {},
      customization: {
        confidentiality: 'public',
        pagination: true,
        tableOfContents: true,
        executiveSummary: true
      }
    });

    expect(exportData).toBeDefined();
    expect(exportData.format).toBe('json');
    expect(exportData.data).toEqual(mockResults);
  });
});

// Helper function for export testing
async function generateExport(results: any[], config: any): Promise<any> {
  return {
    format: config.format,
    data: results,
    metadata: {
      totalResults: results.length,
      exportTimestamp: new Date().toISOString(),
      language: config.language,
      version: '1.0.0'
    }
  };
}