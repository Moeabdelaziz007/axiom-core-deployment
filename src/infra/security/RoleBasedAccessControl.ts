/**
 * Role-Based Access Control (RBAC) System
 * Provides granular access control with dynamic role assignment and delegation
 */

import { EventEmitter } from 'events';

export interface RBACConfig {
  enabled: boolean;
  defaultRoles: string[];
  adminRoles: string[];
  sessionTimeout: number;
  maxFailedAttempts: number;
  lockoutDuration: number;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  parentRoles?: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
  metadata: Record<string, any>;
}

export interface PermissionCondition {
  type: 'time' | 'location' | 'device' | 'context' | 'custom';
  operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'greater-than' | 'less-than' | 'in' | 'not-in';
  value: any;
  description: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy: string;
  expiresAt?: Date;
  conditions?: RoleAssignmentCondition[];
  delegatedFrom?: string;
  metadata: Record<string, any>;
}

export interface RoleAssignmentCondition {
  type: 'time-bound' | 'context-aware' | 'approval-required' | 'mfa-required';
  value: any;
  description: string;
}

export interface AccessRequest {
  id: string;
  userId: string;
  resource: string;
  action: string;
  context: AccessContext;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
}

export interface AccessContext {
  time: Date;
  location?: {
    country: string;
    region: string;
    city: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  device?: {
    type: string;
    platform: string;
    trusted: boolean;
  };
  session?: {
    duration: number;
    lastActivity: Date;
    mfaVerified: boolean;
  };
  custom?: Record<string, any>;
}

export interface AccessDecision {
  request: AccessRequest;
  allowed: boolean;
  reason: string;
  permissions: Permission[];
  conditions: PermissionCondition[];
  riskScore: number;
  timestamp: Date;
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  actor: string;
  target: string;
  result: 'success' | 'failure' | 'warning';
  details: Record<string, any>;
}

export interface ComponentStatus {
  health: 'healthy' | 'degraded' | 'unhealthy';
  metrics: {
    totalUsers: number;
    activeRoles: number;
    totalPermissions: number;
    accessRequests: number;
    failedAttempts: number;
  };
  lastCheck: Date;
}

/**
 * Role-Based Access Control System
 */
export class RoleBasedAccessControl extends EventEmitter {
  private config: RBACConfig;
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private userRoles: Map<string, UserRole[]> = new Map();
  private auditLog: AuditEntry[] = [];
  private accessRequests: Map<string, AccessRequest> = new Map();

  constructor(config: RBACConfig) {
    super();
    this.config = config;
    this.initializeDefaultRoles();
  }

  /**
   * Initialize default roles and permissions
   */
  private initializeDefaultRoles(): void {
    console.log('🔐 Initializing default RBAC roles...');
    
    // Create default permissions
    const defaultPermissions = [
      { id: 'read-all', name: 'Read All Resources', resource: '*', action: 'read' },
      { id: 'write-all', name: 'Write All Resources', resource: '*', action: 'write' },
      { id: 'delete-all', name: 'Delete All Resources', resource: '*', action: 'delete' },
      { id: 'admin-all', name: 'Admin All Resources', resource: '*', action: 'admin' },
      { id: 'user-read', name: 'Read User Data', resource: 'user', action: 'read' },
      { id: 'user-write', name: 'Write User Data', resource: 'user', action: 'write' },
      { id: 'agent-read', name: 'Read Agent Data', resource: 'agent', action: 'read' },
      { id: 'agent-write', name: 'Write Agent Data', resource: 'agent', action: 'write' },
      { id: 'marketplace-read', name: 'Read Marketplace', resource: 'marketplace', action: 'read' },
      { id: 'marketplace-write', name: 'Write Marketplace', resource: 'marketplace', action: 'write' },
    ];

    defaultPermissions.forEach(perm => {
      this.permissions.set(perm.id, {
        ...perm,
        conditions: [],
        metadata: {}
      });
    });

    // Create default roles
    const defaultRoles = [
      {
        id: 'super-admin',
        name: 'Super Administrator',
        description: 'Full system access with all permissions',
        permissions: ['admin-all', 'read-all', 'write-all', 'delete-all'],
        metadata: { level: 100, system: true }
      },
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Administrative access to most resources',
        permissions: ['read-all', 'write-all', 'admin-all'],
        metadata: { level: 90 }
      },
      {
        id: 'user',
        name: 'User',
        description: 'Standard user access',
        permissions: ['user-read', 'user-write', 'agent-read', 'marketplace-read'],
        metadata: { level: 50 }
      },
      {
        id: 'agent',
        name: 'Agent',
        description: 'AI agent access',
        permissions: ['agent-read', 'agent-write', 'marketplace-read'],
        metadata: { level: 40, type: 'ai' }
      },
      {
        id: 'guest',
        name: 'Guest',
        description: 'Limited guest access',
        permissions: ['marketplace-read'],
        metadata: { level: 10 }
      }
    ];

    defaultRoles.forEach(role => {
      this.roles.set(role.id, {
        ...role,
        permissions: role.permissions.map(permId => this.permissions.get(permId)!),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    console.log(`✅ Initialized ${this.roles.size} default roles with ${this.permissions.size} permissions`);
  }

  /**
   * Check if user has permission for specific action on resource
   */
  async checkPermission(userId: string, resource: string, action: string, context: AccessContext): Promise<AccessDecision> {
    const request: AccessRequest = {
      id: this.generateId(),
      userId,
      resource,
      action,
      context,
      timestamp: new Date(),
      ipAddress: context.custom?.ipAddress || 'unknown',
      userAgent: context.custom?.userAgent || 'unknown',
      sessionId: context.session?.sessionId
    };

    this.accessRequests.set(request.id, request);

    try {
      const userRoles = await this.getUserRoles(userId);
      const allPermissions = await this.getAllPermissionsForUser(userId);
      
      // Check direct permission match
      const matchingPermissions = allPermissions.filter(perm => 
        (perm.resource === resource || perm.resource === '*') &&
        (perm.action === action || perm.action === '*')
      );

      // Check permission conditions
      const validPermissions = matchingPermissions.filter(perm => 
        this.evaluatePermissionConditions(perm, context)
      );

      const allowed = validPermissions.length > 0;
      const riskScore = this.calculateRiskScore(request, userRoles, validPermissions);
      
      const decision: AccessDecision = {
        request,
        allowed,
        reason: allowed ? 'Permission granted' : 'Insufficient permissions',
        permissions: validPermissions,
        conditions: validPermissions.flatMap(perm => perm.conditions || []),
        riskScore,
        timestamp: new Date(),
        auditTrail: []
      };

      // Log the decision
      await this.logAccessDecision(decision);

      // Emit event for monitoring
      this.emit('access-decision', decision);

      return decision;
    } catch (error) {
      const errorDecision: AccessDecision = {
        request,
        allowed: false,
        reason: `Error checking permissions: ${error.message}`,
        permissions: [],
        conditions: [],
        riskScore: 100,
        timestamp: new Date(),
        auditTrail: []
      };

      await this.logAccessDecision(errorDecision);
      return errorDecision;
    }
  }

  /**
   * Get all roles assigned to a user
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoleAssignments = this.userRoles.get(userId) || [];
    const validAssignments = userRoleAssignments.filter(assignment => 
      !assignment.expiresAt || assignment.expiresAt > new Date()
    );

    const roles: Role[] = [];
    for (const assignment of validAssignments) {
      const role = this.roles.get(assignment.roleId);
      if (role) {
        roles.push(role);
        // Also include parent roles (inheritance)
        if (role.parentRoles) {
          for (const parentRoleId of role.parentRoles) {
            const parentRole = this.roles.get(parentRoleId);
            if (parentRole) {
              roles.push(parentRole);
            }
          }
        }
      }
    }

    return roles;
  }

  /**
   * Get all permissions for a user (including inherited permissions)
   */
  async getAllPermissionsForUser(userId: string): Promise<Permission[]> {
    const userRoles = await this.getUserRoles(userId);
    const allPermissions = new Set<Permission>();

    for (const role of userRoles) {
      for (const permission of role.permissions) {
        allPermissions.add(permission);
      }
    }

    return Array.from(allPermissions);
  }

  /**
   * Evaluate permission conditions against context
   */
  private evaluatePermissionConditions(permission: Permission, context: AccessContext): boolean {
    if (!permission.conditions || permission.conditions.length === 0) {
      return true;
    }

    return permission.conditions.every(condition => {
      switch (condition.type) {
        case 'time':
          return this.evaluateTimeCondition(condition, context.time);
        case 'location':
          return this.evaluateLocationCondition(condition, context.location);
        case 'device':
          return this.evaluateDeviceCondition(condition, context.device);
        case 'context':
          return this.evaluateContextCondition(condition, context);
        case 'custom':
          return this.evaluateCustomCondition(condition, context);
        default:
          return true;
      }
    });
  }

  /**
   * Evaluate time-based conditions
   */
  private evaluateTimeCondition(condition: PermissionCondition, time: Date): boolean {
    // Implementation would evaluate time-based restrictions
    return true; // Simplified for now
  }

  /**
   * Evaluate location-based conditions
   */
  private evaluateLocationCondition(condition: PermissionCondition, location?: any): boolean {
    if (!location) return false;
    
    // Implementation would evaluate location-based restrictions
    return true; // Simplified for now
  }

  /**
   * Evaluate device-based conditions
   */
  private evaluateDeviceCondition(condition: PermissionCondition, device?: any): boolean {
    if (!device) return false;
    
    // Implementation would evaluate device-based restrictions
    return true; // Simplified for now
  }

  /**
   * Evaluate context-based conditions
   */
  private evaluateContextCondition(condition: PermissionCondition, context: AccessContext): boolean {
    // Implementation would evaluate context-based restrictions
    return true; // Simplified for now
  }

  /**
   * Evaluate custom conditions
   */
  private evaluateCustomCondition(condition: PermissionCondition, context: AccessContext): boolean {
    // Implementation would evaluate custom restrictions
    return true; // Simplified for now
  }

  /**
   * Calculate risk score for access request
   */
  private calculateRiskScore(request: AccessRequest, roles: Role[], permissions: Permission[]): number {
    let score = 0;

    // Base score from user roles
    const maxRoleLevel = Math.max(...roles.map(role => role.metadata.level || 0));
    score += Math.max(0, 100 - maxRoleLevel);

    // Adjust based on permission sensitivity
    const sensitivePermissions = permissions.filter(perm => 
      perm.action === 'delete' || perm.action === 'admin' || perm.resource === '*'
    );
    score += sensitivePermissions.length * 10;

    // Adjust based on context factors
    if (request.context.time.getHours() < 6 || request.context.time.getHours() > 22) {
      score += 15; // Unusual time
    }

    if (!request.context.device?.trusted) {
      score += 20; // Untrusted device
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Log access decision to audit trail
   */
  private async logAccessDecision(decision: AccessDecision): Promise<void> {
    const auditEntry: AuditEntry = {
      timestamp: decision.timestamp,
      action: `access-${decision.allowed ? 'granted' : 'denied'}`,
      actor: decision.request.userId,
      target: `${decision.request.resource}:${decision.request.action}`,
      result: decision.allowed ? 'success' : 'failure',
      details: {
        requestId: decision.request.id,
        reason: decision.reason,
        riskScore: decision.riskScore,
        permissions: decision.permissions.map(p => p.id),
        ipAddress: decision.request.ipAddress,
        userAgent: decision.request.userAgent
      }
    };

    this.auditLog.push(auditEntry);
    decision.auditTrail.push(auditEntry);

    // Keep audit log size manageable
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000);
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string, assignedBy: string, options?: {
    expiresAt?: Date;
    conditions?: RoleAssignmentCondition[];
    delegatedFrom?: string;
  }): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    const userRole: UserRole = {
      userId,
      roleId,
      assignedAt: new Date(),
      assignedBy,
      expiresAt: options?.expiresAt,
      conditions: options?.conditions,
      delegatedFrom: options?.delegatedFrom,
      metadata: {}
    };

    const userRoles = this.userRoles.get(userId) || [];
    userRoles.push(userRole);
    this.userRoles.set(userId, userRoles);

    // Log the assignment
    await this.logRoleAssignment(userId, roleId, assignedBy, 'assigned');

    this.emit('role-assigned', { userId, roleId, assignedBy, userRole });
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleId: string, removedBy: string): Promise<void> {
    const userRoles = this.userRoles.get(userId) || [];
    const filteredRoles = userRoles.filter(role => role.roleId !== roleId);
    
    if (filteredRoles.length === userRoles.length) {
      throw new Error(`User ${userId} does not have role ${roleId}`);
    }

    this.userRoles.set(userId, filteredRoles);

    // Log the removal
    await this.logRoleAssignment(userId, roleId, removedBy, 'removed');

    this.emit('role-removed', { userId, roleId, removedBy });
  }

  /**
   * Log role assignment changes
   */
  private async logRoleAssignment(userId: string, roleId: string, actor: string, action: 'assigned' | 'removed'): Promise<void> {
    const auditEntry: AuditEntry = {
      timestamp: new Date(),
      action: `role-${action}`,
      actor,
      target: `${userId}:${roleId}`,
      result: 'success',
      details: { action, userId, roleId }
    };

    this.auditLog.push(auditEntry);
  }

  /**
   * Create new role
   */
  async createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const newRole: Role = {
      ...role,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.roles.set(newRole.id, newRole);

    this.emit('role-created', newRole);
    return newRole;
  }

  /**
   * Update existing role
   */
  async updateRole(roleId: string, updates: Partial<Omit<Role, 'id' | 'createdAt'>>): Promise<Role> {
    const existingRole = this.roles.get(roleId);
    if (!existingRole) {
      throw new Error(`Role ${roleId} not found`);
    }

    const updatedRole: Role = {
      ...existingRole,
      ...updates,
      updatedAt: new Date()
    };

    this.roles.set(roleId, updatedRole);

    this.emit('role-updated', updatedRole);
    return updatedRole;
  }

  /**
   * Delete role
   */
  async deleteRole(roleId: string): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    // Check if role is assigned to any users
    for (const [userId, userRoles] of this.userRoles.entries()) {
      const hasRole = userRoles.some(userRole => userRole.roleId === roleId);
      if (hasRole) {
        throw new Error(`Cannot delete role ${roleId} - it is assigned to user ${userId}`);
      }
    }

    this.roles.delete(roleId);

    this.emit('role-deleted', { roleId, role });
  }

  /**
   * Get audit log
   */
  async getAuditLog(filters?: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditEntry[]> {
    let filteredLog = [...this.auditLog];

    if (filters?.userId) {
      filteredLog = filteredLog.filter(entry => entry.actor === filters.userId);
    }

    if (filters?.action) {
      filteredLog = filteredLog.filter(entry => entry.action.includes(filters.action!));
    }

    if (filters?.startDate) {
      filteredLog = filteredLog.filter(entry => entry.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      filteredLog = filteredLog.filter(entry => entry.timestamp <= filters.endDate!);
    }

    // Sort by timestamp (newest first)
    filteredLog.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    if (filters?.limit) {
      filteredLog = filteredLog.slice(0, filters.limit);
    }

    return filteredLog;
  }

  /**
   * Get system status
   */
  getStatus(): ComponentStatus {
    return {
      health: 'healthy',
      metrics: {
        totalUsers: this.userRoles.size,
        activeRoles: this.roles.size,
        totalPermissions: this.permissions.size,
        accessRequests: this.accessRequests.size,
        failedAttempts: this.auditLog.filter(entry => entry.result === 'failure').length
      },
      lastCheck: new Date()
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: RBACConfig): void {
    this.config = { ...this.config, ...config };
    this.emit('config-updated', this.config);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `rbac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default RoleBasedAccessControl;