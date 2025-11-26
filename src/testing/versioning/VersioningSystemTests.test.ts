/**
 * 🧪 AXIOM AGENT VERSIONING SYSTEM TESTS
 * 
 * Comprehensive test suite for the versioning and rollback system
 * including unit tests, integration tests, and end-to-end scenarios.
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentVersioningSystem, VersionMetadata, RollbackPoint, HotUpdate } from '../../infra/versioning/AgentVersioningSystem';
import { DatabaseMigrationSystem, MigrationResult } from '../../infra/versioning/DatabaseMigrationSystem';
import { DeploymentManager, DeploymentConfig, DeploymentStatus } from '../../infra/versioning/DeploymentManager';
import { HotUpdateSystem, HotUpdateConfig } from '../../infra/versioning/HotUpdateSystem';

// ============================================================================
// MOCKS AND FIXTURES
// ============================================================================

const mockVersionMetadata: VersionMetadata = {
  version: '1.0.0',
  semanticVersion: { major: 1, minor: 0, patch: 0 },
  commitHash: 'abc123',
  branch: 'main',
  buildTimestamp: new Date('2024-01-01T00:00:00Z'),
  author: 'test-user',
  changelog: ['Initial version'],
  breakingChanges: false,
  dependencies: { 'axios': '^1.0.0' },
  compatibilityMatrix: []
};

const mockRollbackPoint: RollbackPoint = {
  id: 'rb_123',
  version: '1.0.0',
  environmentId: 'staging',
  timestamp: new Date('2024-01-01T00:00:00Z'),
  description: 'Test rollback point',
  type: 'full',
  status: 'available',
  data: {
    databaseBackup: 'backup.sql',
    configurationBackup: 'config.json'
  },
  rollbackCommands: ['echo "rollback"'],
  verificationChecks: [],
  createdBy: 'test-user'
};

const mockHotUpdate: HotUpdateConfig = {
  id: 'hu_123',
  version: '1.0.0',
  patchVersion: '1',
  type: 'bugfix',
  priority: 'medium',
  description: 'Test hot update',
  critical: false,
  targetVersions: ['1.0.0'],
  rolloutStrategy: 'gradual',
  rolloutPercentage: 10,
  rolloutSteps: 5,
  stepDelay: 30000,
  autoRollback: true,
  rollbackThreshold: 5,
  script: 'echo "hot update applied"',
  verificationChecks: [],
  rollbackPlan: 'echo "rollback"',
  metadata: {},
  createdAt: new Date('2024-01-01T00:00:00Z'),
  status: 'draft',
  rolloutHistory: []
};

// Mock database connection
const mockDatabaseConnection = {
  execute: async (query: string, params?: any[]) => {
    return { rows: [], rowCount: 0 };
  },
  transaction: async <T>(callback: (db: any) => Promise<T>) => {
    return callback(mockDatabaseConnection);
  },
  close: async () => {}
};

// ============================================================================
// AGENT VERSIONING SYSTEM TESTS
// ============================================================================

describe('AgentVersioningSystem', () => {
  let versioningSystem: AgentVersioningSystem;

  beforeEach(() => {
    versioningSystem = new AgentVersioningSystem();
  });

  describe('Version Management', () => {
    it('should create a new version with patch increment', async () => {
      const version = await versioningSystem.createVersion('patch', undefined, ['Bug fixes']);
      
      expect(version.version).toBe('1.0.1');
      expect(version.semanticVersion.patch).toBe(1);
      expect(version.changelog).toContain('Bug fixes');
    });

    it('should create a new version with minor increment', async () => {
      const version = await versioningSystem.createVersion('minor', undefined, ['New features']);
      
      expect(version.version).toBe('1.1.0');
      expect(version.semanticVersion.minor).toBe(1);
      expect(version.semanticVersion.patch).toBe(0);
    });

    it('should create a new version with major increment', async () => {
      const version = await versioningSystem.createVersion('major', undefined, ['Breaking changes']);
      
      expect(version.version).toBe('2.0.0');
      expect(version.semanticVersion.major).toBe(2);
      expect(version.semanticVersion.minor).toBe(0);
      expect(version.semanticVersion.patch).toBe(0);
      expect(version.breakingChanges).toBe(true);
    });

    it('should create a prerelease version', async () => {
      const version = await versioningSystem.createVersion('prerelease', 'alpha.1', ['Alpha release']);
      
      expect(version.version).toBe('1.0.1-alpha.1');
      expect(version.semanticVersion.prerelease).toBe('alpha.1');
    });

    it('should get version by version string', () => {
      versioningSystem['versions'].set('1.0.0', mockVersionMetadata);
      
      const version = versioningSystem.getVersion('1.0.0');
      
      expect(version).toEqual(mockVersionMetadata);
    });

    it('should return null for non-existent version', () => {
      const version = versioningSystem.getVersion('9.9.9');
      
      expect(version).toBeNull();
    });

    it('should get all versions sorted by semantic version', () => {
      versioningSystem['versions'].set('1.0.0', mockVersionMetadata);
      versioningSystem['versions'].set('1.1.0', { ...mockVersionMetadata, version: '1.1.0' });
      versioningSystem['versions'].set('2.0.0', { ...mockVersionMetadata, version: '2.0.0' });
      
      const versions = versioningSystem.getAllVersions();
      
      expect(versions).toHaveLength(3);
      expect(versions[0].version).toBe('2.0.0');
      expect(versions[1].version).toBe('1.1.0');
      expect(versions[2].version).toBe('1.0.0');
    });

    it('should check version compatibility correctly', () => {
      versioningSystem['versions'].set('1.0.0', mockVersionMetadata);
      versioningSystem['versions'].set('1.1.0', { ...mockVersionMetadata, version: '1.1.0' });
      
      expect(versioningSystem.isCompatible('1.0.0', '1.1.0')).toBe(true);
      expect(versioningSystem.isCompatible('1.0.0', '2.0.0')).toBe(false);
    });
  });

  describe('Rollback Management', () => {
    it('should create rollback point', async () => {
      const rollbackPoint = await versioningSystem.createRollbackPoint('staging', '1.0.0', 'Test rollback');
      
      expect(rollbackPoint.environmentId).toBe('staging');
      expect(rollbackPoint.version).toBe('1.0.0');
      expect(rollbackPoint.description).toBe('Test rollback');
      expect(rollbackPoint.status).toBe('available');
    });

    it('should execute rollback successfully', async () => {
      versioningSystem['rollbackPoints'].set('rb_123', mockRollbackPoint);
      
      const result = await versioningSystem.executeRollback('rb_123');
      
      expect(result.status).toBe('completed');
      expect(result.targetVersion).toBe('1.0.0');
    });

    it('should fail rollback for non-existent point', async () => {
      await expect(versioningSystem.executeRollback('rb_999')).rejects.toThrow('Rollback point rb_999 not found');
    });

    it('should perform emergency rollback', async () => {
      versioningSystem['rollbackPoints'].set('rb_123', mockRollbackPoint);
      versioningSystem['environments'].set('staging', {
        id: 'staging',
        name: 'Staging',
        type: 'staging',
        status: 'active',
        healthStatus: 'healthy',
        lastHealthCheck: new Date(),
        configuration: {},
        endpoints: { api: 'https://staging-api.axiom.com' }
      });
      
      const result = await versioningSystem.emergencyRollback('staging');
      
      expect(result.status).toBe('completed');
    });
  });

  describe('Migration Management', () => {
    it('should create migration', async () => {
      const migration = await versioningSystem.createMigration(
        '1.1.0',
        'database',
        'CREATE TABLE test (id INTEGER);',
        'DROP TABLE test;'
      );
      
      expect(migration.version).toBe('1.1.0');
      expect(migration.type).toBe('database');
      expect(migration.status).toBe('pending');
    });

    it('should execute migration successfully', async () => {
      const migration = await versioningSystem.createMigration(
        '1.1.0',
        'database',
        'CREATE TABLE test (id INTEGER);',
        'DROP TABLE test;'
      );
      
      const result = await versioningSystem.executeMigration(migration.id);
      
      expect(result.status).toBe('completed');
    });

    it('should rollback migration successfully', async () => {
      const migration = await versioningSystem.createMigration(
        '1.1.0',
        'database',
        'CREATE TABLE test (id INTEGER);',
        'DROP TABLE test;'
      );
      
      // First execute migration
      await versioningSystem.executeMigration(migration.id);
      
      // Then rollback
      const result = await versioningSystem.rollbackMigration(migration.id);
      
      expect(result.status).toBe('completed');
    });
  });

  describe('Hot Update Management', () => {
    it('should create hot update', async () => {
      const hotUpdate = await versioningSystem.createHotUpdate(
        '1.0.0',
        '1',
        'bugfix',
        'Test hot update',
        'echo "hot update"',
        false,
        ['1.0.0']
      );
      
      expect(hotUpdate.version).toBe('1.0.0');
      expect(hotUpdate.patchVersion).toBe('1');
      expect(hotUpdate.type).toBe('bugfix');
      expect(hotUpdate.status).toBe('draft');
    });

    it('should deploy hot update successfully', async () => {
      const hotUpdate = await versioningSystem.createHotUpdate(
        '1.0.0',
        '1',
        'bugfix',
        'Test hot update',
        'echo "hot update"',
        false,
        ['1.0.0']
      );
      
      const result = await versioningSystem.deployHotUpdate(hotUpdate.id);
      
      expect(result.status).toBe('completed');
    });

    it('should rollback hot update successfully', async () => {
      const hotUpdate = await versioningSystem.createHotUpdate(
        '1.0.0',
        '1',
        'bugfix',
        'Test hot update',
        'echo "hot update"',
        false,
        ['1.0.0']
      );
      
      // First deploy
      await versioningSystem.deployHotUpdate(hotUpdate.id);
      
      // Then rollback
      const result = await versioningSystem.rollbackHotUpdate(hotUpdate.id);
      
      expect(result.status).toBe('completed');
    });
  });
});

// ============================================================================
// DATABASE MIGRATION SYSTEM TESTS
// ============================================================================

describe('DatabaseMigrationSystem', () => {
  let migrationSystem: DatabaseMigrationSystem;

  beforeEach(() => {
    migrationSystem = new DatabaseMigrationSystem(mockDatabaseConnection);
  });

  describe('Migration Loading', () => {
    it('should load predefined migrations', async () => {
      await migrationSystem.loadMigrations('./migrations');
      
      const migrations = migrationSystem.getMigrations();
      
      expect(migrations.length).toBeGreaterThan(0);
      expect(migrations[0].id).toBe('001_create_version_control_tables');
    });

    it('should add custom migration', () => {
      migrationSystem.addMigration({
        id: 'test_migration',
        version: '1.0.0',
        name: 'Test Migration',
        description: 'Test migration',
        type: 'schema',
        dependencies: [],
        script: 'CREATE TABLE test (id INTEGER);'
      });
      
      const migrations = migrationSystem.getMigrations();
      const testMigration = migrations.find(m => m.id === 'test_migration');
      
      expect(testMigration).toBeDefined();
      expect(testMigration?.name).toBe('Test Migration');
    });
  });

  describe('Migration Execution', () => {
    it('should run pending migrations successfully', async () => {
      await migrationSystem.loadMigrations('./migrations');
      
      const result = await migrationSystem.runMigrations({
        connection: mockDatabaseConnection,
        version: '1.0.0',
        environment: 'test',
        dryRun: false,
        force: false,
        batchSize: 100
      });
      
      expect(result.success).toBe(true);
      expect(result.executed.length).toBeGreaterThan(0);
    });

    it('should handle migration failures gracefully', async () => {
      // Add a failing migration
      migrationSystem.addMigration({
        id: 'failing_migration',
        version: '1.0.0',
        name: 'Failing Migration',
        description: 'This migration should fail',
        type: 'schema',
        dependencies: [],
        script: 'INVALID SQL STATEMENT'
      });
      
      const result = await migrationSystem.runMigrations({
        connection: mockDatabaseConnection,
        version: '1.0.0',
        environment: 'test',
        dryRun: false,
        force: false,
        batchSize: 100
      });
      
      expect(result.success).toBe(false);
      expect(result.failed.length).toBeGreaterThan(0);
    });

    it('should rollback migration successfully', async () => {
      const migration = await migrationSystem.createMigration(
        '1.0.0',
        'schema',
        'CREATE TABLE test (id INTEGER);',
        'DROP TABLE test;'
      );
      
      // First execute migration
      await migrationSystem.executeMigration(migration.id);
      
      // Then rollback
      const result = await migrationSystem.rollbackMigration(migration.id);
      
      expect(result.status).toBe('completed');
    });

    it('should rollback to specific version', async () => {
      await migrationSystem.loadMigrations('./migrations');
      
      const result = await migrationSystem.rollbackToVersion('1.0.0');
      
      expect(result.success).toBe(true);
    });
  });

  describe('Schema Validation', () => {
    it('should validate schema successfully', async () => {
      const expectedSchema = {
        tables: {
          users: {
            columns: [
              { name: 'id', type: 'INTEGER', nullable: false },
              { name: 'name', type: 'TEXT', nullable: false }
            ]
          }
        }
      };
      
      const result = await migrationSystem.validateSchema(expectedSchema, {
        connection: mockDatabaseConnection,
        version: '1.0.0',
        environment: 'test',
        dryRun: false,
        force: false,
        batchSize: 100
      });
      
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect schema differences', async () => {
      const expectedSchema = {
        tables: {
          users: {
            columns: [
              { name: 'id', type: 'INTEGER', nullable: false },
              { name: 'email', type: 'TEXT', nullable: false } // Different from current
            ]
          }
        }
      };
      
      const result = await migrationSystem.validateSchema(expectedSchema, {
        connection: mockDatabaseConnection,
        version: '1.0.0',
        environment: 'test',
        dryRun: false,
        force: false,
        batchSize: 100
      });
      
      expect(result.valid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// DEPLOYMENT MANAGER TESTS
// ============================================================================

describe('DeploymentManager', () => {
  let deploymentManager: DeploymentManager;
  let versioningSystem: AgentVersioningSystem;

  beforeEach(() => {
    versioningSystem = new AgentVersioningSystem();
    deploymentManager = new DeploymentManager(versioningSystem);
  });

  describe('Deployment Execution', () => {
    it('should start blue-green deployment', async () => {
      const config: DeploymentConfig = {
        version: '1.0.0',
        environmentId: 'staging',
        strategy: 'blue-green',
        healthChecks: [
          {
            id: 'api-health',
            name: 'API Health Check',
            type: 'api',
            endpoint: '/health',
            method: 'GET',
            expectedStatus: 200,
            timeout: 30000,
            retries: 3
          }
        ],
        rollbackOnFailure: true,
        timeout: 600000,
        dryRun: false,
        notifications: [],
        approvalRequired: false
      };
      
      const deploymentId = await deploymentManager.startDeployment(config);
      
      expect(deploymentId).toBeDefined();
      expect(deploymentId).toMatch(/^deploy_\d+_[a-z0-9]+$/);
    });

    it('should start rolling deployment', async () => {
      const config: DeploymentConfig = {
        version: '1.0.0',
        environmentId: 'staging',
        strategy: 'rolling',
        healthChecks: [],
        rollbackOnFailure: false,
        timeout: 300000,
        dryRun: false,
        notifications: [],
        approvalRequired: false
      };
      
      const deploymentId = await deploymentManager.startDeployment(config);
      
      expect(deploymentId).toBeDefined();
    });

    it('should start canary deployment', async () => {
      const config: DeploymentConfig = {
        version: '1.0.0',
        environmentId: 'staging',
        strategy: 'canary',
        healthChecks: [],
        rollbackOnFailure: false,
        timeout: 300000,
        dryRun: false,
        notifications: [],
        approvalRequired: false
      };
      
      const deploymentId = await deploymentManager.startDeployment(config);
      
      expect(deploymentId).toBeDefined();
    });

    it('should require approval for production deployments', async () => {
      const config: DeploymentConfig = {
        version: '1.0.0',
        environmentId: 'production',
        strategy: 'blue-green',
        healthChecks: [],
        rollbackOnFailure: false,
        timeout: 300000,
        dryRun: false,
        notifications: [],
        approvalRequired: true,
        approvers: ['tech-lead', 'product-manager']
      };
      
      await expect(deploymentManager.startDeployment(config)).rejects.toThrow('Deployment approval required but not obtained');
    });
  });

  describe('Health Checks', () => {
    it('should run API health checks successfully', async () => {
      const healthChecks = [
        {
          id: 'api-health',
          name: 'API Health Check',
          type: 'api' as const,
          endpoint: 'https://httpbin.org/status/200',
          method: 'GET' as const,
          expectedStatus: 200,
          timeout: 30000,
          retries: 3
        }
      ];
      
      const results = await deploymentManager.runHealthChecks('test-deployment', healthChecks);
      
      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('pass');
    });

    it('should handle failed health checks', async () => {
      const healthChecks = [
        {
          id: 'api-health-fail',
          name: 'API Health Check (Fail)',
          type: 'api' as const,
          endpoint: 'https://httpbin.org/status/404',
          method: 'GET' as const,
          expectedStatus: 200,
          timeout: 30000,
          retries: 3
        }
      ];
      
      const results = await deploymentManager.runHealthChecks('test-deployment', healthChecks);
      
      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('fail');
    });
  });

  describe('Rollback Management', () => {
    it('should execute emergency rollback', async () => {
      const result = await deploymentManager.emergencyRollback('staging');
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^rb_\d+_[a-z0-9]+$/);
    });
  });
});

// ============================================================================
// HOT UPDATE SYSTEM TESTS
// ============================================================================

describe('HotUpdateSystem', () => {
  let hotUpdateSystem: HotUpdateSystem;

  beforeEach(() => {
    hotUpdateSystem = new HotUpdateSystem();
  });

  describe('Hot Update Creation', () => {
    it('should create hot update successfully', async () => {
      const hotUpdateId = await hotUpdateSystem.createHotUpdate({
        version: '1.0.0',
        patchVersion: '1',
        type: 'bugfix',
        priority: 'medium',
        description: 'Test hot update',
        critical: false,
        targetVersions: ['1.0.0'],
        rolloutStrategy: 'gradual',
        rolloutPercentage: 10,
        rolloutSteps: 5,
        stepDelay: 30000,
        autoRollback: true,
        rollbackThreshold: 5,
        script: 'echo "hot update applied"',
        verificationChecks: [],
        rollbackPlan: 'echo "rollback"'
      });
      
      expect(hotUpdateId).toBeDefined();
      expect(hotUpdateId).toMatch(/^hu_\d+_[a-z0-9]+$/);
      
      const hotUpdate = hotUpdateSystem.getHotUpdate(hotUpdateId);
      expect(hotUpdate?.status).toBe('draft');
    });

    it('should validate hot update configuration', async () => {
      await expect(hotUpdateSystem.createHotUpdate({
        version: '', // Invalid: empty version
        patchVersion: '1',
        type: 'bugfix',
        priority: 'medium',
        description: 'Test hot update',
        critical: false,
        targetVersions: ['1.0.0'],
        rolloutStrategy: 'gradual',
        rolloutPercentage: 10,
        rolloutSteps: 5,
        stepDelay: 30000,
        autoRollback: true,
        rollbackThreshold: 5,
        script: 'echo "hot update applied"',
        verificationChecks: [],
        rollbackPlan: 'echo "rollback"'
      })).rejects.toThrow('Version and patch version are required');
    });
  });

  describe('Approval Workflow', () => {
    it('should submit hot update for approval', async () => {
      const hotUpdateId = await hotUpdateSystem.createHotUpdate(mockHotUpdate);
      
      await hotUpdateSystem.submitForApproval(hotUpdateId);
      
      const hotUpdate = hotUpdateSystem.getHotUpdate(hotUpdateId);
      expect(hotUpdate?.status).toBe('pending_approval');
    });

    it('should approve hot update', async () => {
      const hotUpdateId = await hotUpdateSystem.createHotUpdate(mockHotUpdate);
      await hotUpdateSystem.submitForApproval(hotUpdateId);
      
      await hotUpdateSystem.approveHotUpdate(
        hotUpdateId,
        'tech-lead',
        'technical',
        true,
        'Looks good to me'
      );
      
      const hotUpdate = hotUpdateSystem.getHotUpdate(hotUpdateId);
      expect(hotUpdate?.status).toBe('approved');
    });

    it('should reject hot update', async () => {
      const hotUpdateId = await hotUpdateSystem.createHotUpdate(mockHotUpdate);
      await hotUpdateSystem.submitForApproval(hotUpdateId);
      
      await hotUpdateSystem.approveHotUpdate(
        hotUpdateId,
        'security-officer',
        'security',
        false,
        'Security concerns detected'
      );
      
      const hotUpdate = hotUpdateSystem.getHotUpdate(hotUpdateId);
      expect(hotUpdate?.status).toBe('pending_approval'); // Still waiting for other approvals
    });
  });

  describe('Testing Phase', () => {
    it('should run security tests', async () => {
      const hotUpdateId = await hotUpdateSystem.createHotUpdate({
        ...mockHotUpdate,
        script: 'eval("malicious code")' // Should fail security test
      });
      
      const testResults = await hotUpdateSystem.runHotUpdateTests(hotUpdateId);
      
      const securityTest = testResults.find(r => r.testType === 'security');
      expect(securityTest?.status).toBe('fail');
      expect(securityTest?.issues.length).toBeGreaterThan(0);
    });

    it('should run performance tests', async () => {
      const hotUpdateId = await hotUpdateSystem.createHotUpdate({
        ...mockHotUpdate,
        script: 'for(let i=0; i<1000; i++) { for(let j=0; j<1000; j++) {} }' // High complexity
      });
      
      const testResults = await hotUpdateSystem.runHotUpdateTests(hotUpdateId);
      
      const performanceTest = testResults.find(r => r.testType === 'performance');
      expect(performanceTest?.status).toBe('fail');
      expect(performanceTest?.issues.length).toBeGreaterThan(0);
    });

    it('should run functional tests', async () => {
      const hotUpdateId = await hotUpdateSystem.createHotUpdate({
        ...mockHotUpdate,
        script: 'invalid javascript syntax' // Should fail syntax test
      });
      
      const testResults = await hotUpdateSystem.runHotUpdateTests(hotUpdateId);
      
      const functionalTest = testResults.find(r => r.testType === 'functional');
      expect(functionalTest?.status).toBe('fail');
      expect(functionalTest?.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Rollout Management', () => {
    it('should start immediate rollout', async () => {
      const hotUpdateId = await hotUpdateSystem.createHotUpdate({
        ...mockHotUpdate,
        rolloutStrategy: 'immediate'
      });
      
      // Approve first
      await hotUpdateSystem.submitForApproval(hotUpdateId);
      await hotUpdateSystem.approveHotUpdate(hotUpdateId, 'tech-lead', 'technical', true);
      
      await hotUpdateSystem.startRollout(hotUpdateId);
      
      const hotUpdate = hotUpdateSystem.getHotUpdate(hotUpdateId);
      expect(hotUpdate?.status).toBe('rolling');
    });

    it('should start gradual rollout', async () => {
      const hotUpdateId = await hotUpdateSystem.createHotUpdate({
        ...mockHotUpdate,
        rolloutStrategy: 'gradual'
      });
      
      // Approve first
      await hotUpdateSystem.submitForApproval(hotUpdateId);
      await hotUpdateSystem.approveHotUpdate(hotUpdateId, 'tech-lead', 'technical', true);
      
      await hotUpdateSystem.startRollout(hotUpdateId);
      
      const hotUpdate = hotUpdateSystem.getHotUpdate(hotUpdateId);
      expect(hotUpdate?.status).toBe('rolling');
      expect(hotUpdate?.rolloutHistory.length).toBeGreaterThan(0);
    });

    it('should rollback hot update on failure', async () => {
      const hotUpdateId = await hotUpdateSystem.createHotUpdate({
        ...mockHotUpdate,
        autoRollback: true
      });
      
      // Approve first
      await hotUpdateSystem.submitForApproval(hotUpdateId);
      await hotUpdateSystem.approveHotUpdate(hotUpdateId, 'tech-lead', 'technical', true);
      
      // Start rollout (will fail due to mock)
      await hotUpdateSystem.startRollout(hotUpdateId);
      
      // Rollback
      await hotUpdateSystem.rollbackHotUpdate(hotUpdateId);
      
      const hotUpdate = hotUpdateSystem.getHotUpdate(hotUpdateId);
      expect(hotUpdate?.status).toBe('rolled_back');
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Versioning System Integration', () => {
  let versioningSystem: AgentVersioningSystem;
  let migrationSystem: DatabaseMigrationSystem;
  let deploymentManager: DeploymentManager;
  let hotUpdateSystem: HotUpdateSystem;

  beforeEach(() => {
    versioningSystem = new AgentVersioningSystem();
    migrationSystem = new DatabaseMigrationSystem(mockDatabaseConnection);
    deploymentManager = new DeploymentManager(versioningSystem);
    hotUpdateSystem = new HotUpdateSystem();
  });

  it('should handle complete version lifecycle', async () => {
    // 1. Create new version
    const version = await versioningSystem.createVersion('minor', undefined, ['New features']);
    expect(version.version).toBe('1.1.0');
    
    // 2. Create migration for new version
    const migration = await versioningSystem.createMigration(
      version.version,
      'database',
      'CREATE TABLE new_feature (id INTEGER);',
      'DROP TABLE new_feature;'
    );
    expect(migration.version).toBe(version.version);
    
    // 3. Execute migration
    const migrationResult = await versioningSystem.executeMigration(migration.id);
    expect(migrationResult.status).toBe('completed');
    
    // 4. Create rollback point
    const rollbackPoint = await versioningSystem.createRollbackPoint(
      'staging',
      version.version,
      'Pre-deployment backup'
    );
    expect(rollbackPoint.version).toBe(version.version);
    
    // 5. Deploy version
    const deploymentId = await deploymentManager.startDeployment({
      version: version.version,
      environmentId: 'staging',
      strategy: 'blue-green',
      healthChecks: [
        {
          id: 'api-health',
          name: 'API Health Check',
          type: 'api',
          endpoint: '/health',
          method: 'GET',
          expectedStatus: 200,
          timeout: 30000,
          retries: 3
        }
      ],
      rollbackOnFailure: true,
      timeout: 300000,
      dryRun: false,
      notifications: [],
      approvalRequired: false
    });
    expect(deploymentId).toBeDefined();
    
    // 6. Create hot update
    const hotUpdateId = await hotUpdateSystem.createHotUpdate({
      version: version.version,
      patchVersion: '1',
      type: 'bugfix',
      priority: 'medium',
      description: 'Test hot update',
      critical: false,
      targetVersions: [version.version],
      rolloutStrategy: 'gradual',
      rolloutPercentage: 10,
      rolloutSteps: 5,
      stepDelay: 30000,
      autoRollback: true,
      rollbackThreshold: 5,
      script: 'echo "hot update applied"',
      verificationChecks: [],
      rollbackPlan: 'echo "rollback"'
    });
    expect(hotUpdateId).toBeDefined();
  });

  it('should handle rollback scenario', async () => {
    // 1. Create version
    const version = await versioningSystem.createVersion('patch', undefined, ['Bug fixes']);
    
    // 2. Deploy version
    const deploymentId = await deploymentManager.startDeployment({
      version: version.version,
      environmentId: 'staging',
      strategy: 'blue-green',
      healthChecks: [],
      rollbackOnFailure: true,
      timeout: 300000,
      dryRun: false,
      notifications: [],
      approvalRequired: false
    });
    
    // 3. Create rollback point
    const rollbackPoint = await versioningSystem.createRollbackPoint(
      'staging',
      '1.0.0',
      'Previous version backup'
    );
    
    // 4. Execute rollback
    const rollbackResult = await versioningSystem.executeRollback(rollbackPoint.id);
    
    expect(rollbackResult.status).toBe('completed');
    expect(rollbackResult.targetVersion).toBe('1.0.0');
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('Versioning System Performance', () => {
  let versioningSystem: AgentVersioningSystem;

  beforeEach(() => {
    versioningSystem = new AgentVersioningSystem();
  });

  it('should handle large number of versions efficiently', async () => {
    const startTime = Date.now();
    
    // Create 100 versions
    const versionPromises = [];
    for (let i = 0; i < 100; i++) {
      versionPromises.push(versioningSystem.createVersion('patch', undefined, [`Patch ${i}`]));
    }
    
    await Promise.all(versionPromises);
    
    const duration = Date.now() - startTime;
    
    // Should complete within reasonable time (5 seconds)
    expect(duration).toBeLessThan(5000);
    
    const versions = versioningSystem.getAllVersions();
    expect(versions).toHaveLength(100);
  });

  it('should handle concurrent deployments', async () => {
    const deploymentManager = new DeploymentManager(versioningSystem);
    
    const startTime = Date.now();
    
    // Start 10 concurrent deployments
    const deploymentPromises = [];
    for (let i = 0; i < 10; i++) {
      deploymentPromises.push(
        deploymentManager.startDeployment({
          version: '1.0.0',
          environmentId: `test-${i}`,
          strategy: 'blue-green',
          healthChecks: [],
          rollbackOnFailure: false,
          timeout: 300000,
          dryRun: true, // Use dry run for performance test
          notifications: [],
          approvalRequired: false
        })
      );
    }
    
    const deploymentIds = await Promise.all(deploymentPromises);
    
    const duration = Date.now() - startTime;
    
    // Should complete within reasonable time (10 seconds)
    expect(duration).toBeLessThan(10000);
    
    expect(deploymentIds).toHaveLength(10);
    deploymentIds.forEach(id => {
      expect(id).toBeDefined();
      expect(id).toMatch(/^deploy_\d+_[a-z0-9]+$/);
    });
  });
});