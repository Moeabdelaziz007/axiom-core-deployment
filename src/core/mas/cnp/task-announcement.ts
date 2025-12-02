/**
 * Contract Net Protocol - Task Announcement Schema
 * 
 * This module defines the structure for task announcements in the CNP,
 * enabling agents to broadcast tasks with semantic descriptions and constraints.
 */

import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

/**
 * Task constraint definitions
 */
export const TaskConstraintSchema = z.object({
  maxCost: z.number().optional().describe('Maximum cost in tokens/credits'),
  timeout: z.number().describe('Deadline in milliseconds'),
  minConfidence: z.number().min(0).max(1).optional().describe('Minimum confidence score required'),
  requiredCapabilities: z.array(z.string()).optional().describe('Required agent capabilities'),
  excludedAgents: z.array(z.string()).optional().describe('Agents excluded from bidding'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
});

export type TaskConstraint = z.infer<typeof TaskConstraintSchema>;

/**
 * Task announcement with semantic embedding
 */
export const TaskAnnouncementSchema = z.object({
  taskId: z.string().uuid().describe('Unique task identifier'),
  announcerId: z.string().describe('DID of the announcing agent'),
  timestamp: z.number().describe('Unix timestamp of announcement'),
  
  // Semantic description
  title: z.string().describe('Brief task title'),
  description: z.string().describe('Detailed task description'),
  category: z.string().describe('Task category for routing'),
  tags: z.array(z.string()).default([]).describe('Task tags for discovery'),
  
  // Semantic embedding for intelligent matching
  embedding: z.array(z.number()).optional().describe('Vector embedding of task description'),
  contextId: z.string().optional().describe('Related context ID from shared memory'),
  
  // Task requirements
  inputSchema: z.any().describe('Expected input schema for the task'),
  outputFormat: z.string().describe('Expected output format'),
  
  // Constraints and requirements
  constraints: TaskConstraintSchema,
  
  // Bidding configuration
  biddingWindow: z.number().describe('Time window for bids in milliseconds'),
  evaluationCriteria: z.array(z.string()).describe('Criteria for bid evaluation'),
  
  // Security and verification
  signature: z.string().describe('Digital signature of the announcement'),
  nonce: z.string().describe('Nonce for replay protection'),
});

export type TaskAnnouncement = z.infer<typeof TaskAnnouncementSchema>;

/**
 * Task announcement builder with validation
 */
export class TaskAnnouncementBuilder {
  private announcement: Partial<TaskAnnouncement> = {};

  constructor(announcerId: string, title: string, description: string) {
    this.announcement = {
      taskId: uuidv4(),
      announcerId,
      title,
      description,
      timestamp: Date.now(),
      category: 'general',
      tags: [],
      constraints: {
        timeout: 300000, // 5 minutes default
        priority: 'medium',
      },
      biddingWindow: 60000, // 1 minute default
      evaluationCriteria: ['confidence', 'cost', 'duration'],
    };
  }

  withCategory(category: string): this {
    this.announcement.category = category;
    return this;
  }

  withTags(tags: string[]): this {
    this.announcement.tags = tags;
    return this;
  }

  withEmbedding(embedding: number[]): this {
    this.announcement.embedding = embedding;
    return this;
  }

  withContextId(contextId: string): this {
    this.announcement.contextId = contextId;
    return this;
  }

  withInputSchema(inputSchema: any): this {
    this.announcement.inputSchema = inputSchema;
    return this;
  }

  withOutputFormat(outputFormat: string): this {
    this.announcement.outputFormat = outputFormat;
    return this;
  }

  withConstraints(constraints: Partial<TaskConstraint>): this {
    this.announcement.constraints = { ...this.announcement.constraints!, ...constraints };
    return this;
  }

  withBiddingWindow(windowMs: number): this {
    this.announcement.biddingWindow = windowMs;
    return this;
  }

  withEvaluationCriteria(criteria: string[]): this {
    this.announcement.evaluationCriteria = criteria;
    return this;
  }

  withSignature(signature: string, nonce: string): this {
    this.announcement.signature = signature;
    this.announcement.nonce = nonce;
    return this;
  }

  build(): TaskAnnouncement {
    const result = TaskAnnouncementSchema.safeParse(this.announcement);
    if (!result.success) {
      throw new Error(`Invalid task announcement: ${result.error.message}`);
    }
    return result.data;
  }
}

/**
 * Task announcement factory for common task types
 */
export class TaskAnnouncementFactory {
  /**
   * Create a data analysis task announcement
   */
  static createDataAnalysisTask(
    announcerId: string,
    dataSource: string,
    analysisType: string,
    constraints?: Partial<TaskConstraint>
  ): TaskAnnouncement {
    return new TaskAnnouncementBuilder(
      announcerId,
      `Data Analysis: ${analysisType}`,
      `Analyze ${dataSource} for ${analysisType} patterns and insights`
    )
      .withCategory('data-analysis')
      .withTags(['analysis', 'data', analysisType])
      .withInputSchema({ dataSource, analysisType })
      .withOutputFormat('json')
      .withConstraints(constraints || {})
      .withEvaluationCriteria(['accuracy', 'confidence', 'cost'])
      .build();
  }

  /**
   * Create a security audit task announcement
   */
  static createSecurityAuditTask(
    announcerId: string,
    target: string,
    auditType: string,
    constraints?: Partial<TaskConstraint>
  ): TaskAnnouncement {
    return new TaskAnnouncementBuilder(
      announcerId,
      `Security Audit: ${auditType}`,
      `Perform ${auditType} security audit on ${target}`
    )
      .withCategory('security')
      .withTags(['security', 'audit', auditType])
      .withInputSchema({ target, auditType })
      .withOutputFormat('security-report')
      .withConstraints({
        ...constraints,
        minConfidence: 0.9, // High confidence required for security tasks
        priority: 'high',
      })
      .withEvaluationCriteria(['confidence', 'thoroughness', 'compliance'])
      .build();
  }

  /**
   * Create a content generation task announcement
   */
  static createContentGenerationTask(
    announcerId: string,
    contentType: string,
    topic: string,
    constraints?: Partial<TaskConstraint>
  ): TaskAnnouncement {
    return new TaskAnnouncementBuilder(
      announcerId,
      `Content Generation: ${contentType}`,
      `Generate ${contentType} content about ${topic}`
    )
      .withCategory('content-generation')
      .withTags(['content', 'generation', contentType])
      .withInputSchema({ contentType, topic })
      .withOutputFormat(contentType)
      .withConstraints(constraints || {})
      .withEvaluationCriteria(['quality', 'relevance', 'creativity'])
      .build();
  }

  /**
   * Create a financial analysis task announcement
   */
  static createFinancialAnalysisTask(
    announcerId: string,
    instrument: string,
    analysisType: string,
    constraints?: Partial<TaskConstraint>
  ): TaskAnnouncement {
    return new TaskAnnouncementBuilder(
      announcerId,
      `Financial Analysis: ${analysisType}`,
      `Perform ${analysisType} analysis on ${instrument}`
    )
      .withCategory('financial')
      .withTags(['financial', 'analysis', instrument])
      .withInputSchema({ instrument, analysisType })
      .withOutputFormat('financial-report')
      .withConstraints({
        ...constraints,
        minConfidence: 0.85, // High confidence for financial tasks
        priority: 'high',
      })
      .withEvaluationCriteria(['accuracy', 'confidence', 'insight-quality'])
      .build();
  }
}

/**
 * Task announcement validator
 */
export class TaskAnnouncementValidator {
  /**
   * Validate task announcement structure and content
   */
  static validate(announcement: TaskAnnouncement): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Schema validation
    const schemaResult = TaskAnnouncementSchema.safeParse(announcement);
    if (!schemaResult.success) {
      errors.push(`Schema validation failed: ${schemaResult.error.message}`);
    }

    // Business logic validation
    if (announcement.biddingWindow < 5000) {
      errors.push('Bidding window must be at least 5 seconds');
    }

    if (announcement.constraints.timeout < announcement.biddingWindow) {
      errors.push('Task timeout must be longer than bidding window');
    }

    if (announcement.constraints.maxCost && announcement.constraints.maxCost < 0) {
      errors.push('Maximum cost cannot be negative');
    }

    // Check for required fields based on category
    if (announcement.category === 'security' && !announcement.constraints.minConfidence) {
      errors.push('Security tasks must specify minimum confidence');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if an agent is eligible to bid on a task
   */
  static isEligibleToBid(
    announcement: TaskAnnouncement,
    agentCapabilities: string[],
    agentId: string
  ): boolean {
    // Check if agent is excluded
    if (announcement.constraints.excludedAgents?.includes(agentId)) {
      return false;
    }

    // Check if agent has required capabilities
    if (announcement.constraints.requiredCapabilities) {
      const hasAllCapabilities = announcement.constraints.requiredCapabilities.every(cap =>
        agentCapabilities.includes(cap)
      );
      if (!hasAllCapabilities) {
        return false;
      }
    }

    // Check bidding window (would be expired)
    const now = Date.now();
    const deadline = announcement.timestamp + announcement.biddingWindow;
    if (now > deadline) {
      return false;
    }

    return true;
  }
}

/**
 * Task announcement utilities
 */
export class TaskAnnouncementUtils {
  /**
   * Calculate semantic similarity between task and agent capabilities
   */
  static calculateSemanticSimilarity(
    taskEmbedding: number[],
    capabilityEmbedding: number[]
  ): number {
    if (!taskEmbedding || !capabilityEmbedding || 
        taskEmbedding.length !== capabilityEmbedding.length) {
      return 0;
    }

    // Cosine similarity
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < taskEmbedding.length; i++) {
      dotProduct += taskEmbedding[i] * capabilityEmbedding[i];
      normA += taskEmbedding[i] * taskEmbedding[i];
      normB += capabilityEmbedding[i] * capabilityEmbedding[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Extract task metadata for routing
   */
  static extractMetadata(announcement: TaskAnnouncement): Record<string, any> {
    return {
      taskId: announcement.taskId,
      category: announcement.category,
      priority: announcement.constraints.priority,
      maxCost: announcement.constraints.maxCost,
      tags: announcement.tags,
      timestamp: announcement.timestamp,
      deadline: announcement.timestamp + announcement.biddingWindow,
      announcerId: announcement.announcerId,
    };
  }

  /**
   * Create task summary for logging
   */
  static createSummary(announcement: TaskAnnouncement): string {
    return `[${announcement.category.toUpperCase()}] ${announcement.title} ` +
           `(ID: ${announcement.taskId}, Priority: ${announcement.constraints.priority})`;
  }
}