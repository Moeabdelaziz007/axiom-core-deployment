#!/usr/bin/env ts-node

/**
 * 🔄 AXIOM VERSIONING CLI
 * 
 * Command-line interface for the Axiom versioning system
 * Provides easy access to versioning, deployment, and rollback operations.
 * 
 * @author Axiom Core Team
 * @version 1.0.0
 */

import { Command } from 'commander';
import { AxiomSystemCore } from '../src/infra/core/AxiomSystemCore';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// ============================================================================
// CLI SETUP
// ============================================================================

const program = new Command();

program
  .name('axiom-versioning')
  .description('🔄 Axiom Agent Versioning and Deployment CLI')
  .version('1.0.0');

// ============================================================================
// VERSION COMMANDS
// ============================================================================

// Create version command
program
  .command('create-version')
  .description('Create a new version')
  .option('-i, --increment <type>', 'Version increment type (major|minor|patch|prerelease)', 'patch')
  .option('-p, --prerelease <tag>', 'Prerelease tag (for prerelease increments)')
  .option('-c, --changelog <items>', 'Changelog items (comma-separated)')
  .option('-b, --breaking', 'Mark as breaking change')
  .option('--dry-run', 'Dry run (no changes made)')
  .action(async (options) => {
    const core = new AxiomSystemCore();
    
    try {
      const changelog = options.changelog ? options.changelog.split(',').map(s => s.trim()) : [];
      const version = await core.createVersion(
        options.increment,
        options.prerelease,
        changelog,
        options.breaking || false
      );
      
      console.log(`✅ Version created: ${version.version}`);
      console.log(`📦 Semantic: ${JSON.stringify(version.semanticVersion)}`);
      console.log(`📝 Changelog: ${changelog.join(', ')}`);
      
      if (!options.dryRun) {
        // Update package.json
        const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
        packageJson.version = version.version;
        writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        console.log('📄 Updated package.json');
      }
      
    } catch (error) {
      console.error('❌ Failed to create version:', error.message);
      process.exit(1);
    }
  });

// List versions command
program
  .command('list-versions')
  .description('List all versions')
  .option('--limit <number>', 'Limit number of versions', '10')
  .option('--format <type>', 'Output format (table|json)', 'table')
  .action(async (options) => {
    const core = new AxiomSystemCore();
    
    try {
      const versions = core.getAllVersions();
      const limitedVersions = versions.slice(0, parseInt(options.limit) || 10);
      
      if (options.format === 'json') {
        console.log(JSON.stringify(limitedVersions, null, 2));
      } else {
        console.log('\n📦 Available Versions:');
        console.log('┌─────────────────────────────────────────┐');
        console.log('│ Version     │ Created At     │ Changelog              │');
        console.log('├─────────────────────────────────────────┤');
        
        limitedVersions.forEach(version => {
          const date = version.buildTimestamp.toISOString().split('T')[0];
          const changelog = version.changelog.slice(0, 3).join(', ');
          console.log(`│ ${version.version.padEnd(11)} │ ${date.padEnd(11)} │ ${changelog.padEnd(21)} │`);
        });
        
        console.log('└─────────────────────────────────────────┘');
      }
      
    } catch (error) {
      console.error('❌ Failed to list versions:', error.message);
      process.exit(1);
    }
  });

// Check compatibility command
program
  .command('check-compatibility')
  .description('Check version compatibility')
  .requiredOption('-v1, --version1 <version>', 'First version')
  .requiredOption('-v2, --version2 <version>', 'Second version')
  .action(async (options) => {
    const core = new AxiomSystemCore();
    
    try {
      const isCompatible = core.isCompatible(options.version1, options.version2);
      
      console.log(`🔍 Compatibility Check:`);
      console.log(`   Version 1: ${options.version1}`);
      console.log(`   Version 2: ${options.version2}`);
      console.log(`   Compatible: ${isCompatible ? '✅ Yes' : '❌ No'}`);
      
      if (!isCompatible) {
        console.log('\n💡 Recommendation: Upgrade the older version first');
      }
      
    } catch (error) {
      console.error('❌ Compatibility check failed:', error.message);
      process.exit(1);
    }
  });

// ============================================================================
// DEPLOYMENT COMMANDS
// ============================================================================

// Deploy command
program
  .command('deploy')
  .description('Deploy a version')
  .requiredOption('-v, --version <version>', 'Version to deploy')
  .requiredOption('-e, --environment <env>', 'Target environment')
  .option('-s, --strategy <type>', 'Deployment strategy (blue-green|rolling|canary|all-at-once)', 'blue-green')
  .option('--dry-run', 'Dry run (no actual deployment)')
  .option('--force', 'Skip approval checks')
  .option('--timeout <number>', 'Deployment timeout in milliseconds', '600000')
  .action(async (options) => {
    const core = new AxiomSystemCore();
    
    try {
      const deploymentId = await core.startDeployment({
        version: options.version,
        environment: options.environment,
        strategy: options.strategy,
        description: `Deploy version ${options.version} to ${options.environment}`,
        dryRun: options.dryRun || false,
        force: options.force || false
      });
      
      console.log(`🚀 Deployment started: ${deploymentId}`);
      console.log(`📦 Version: ${options.version}`);
      console.log(`🌍 Environment: ${options.environment}`);
      console.log(`🔄 Strategy: ${options.strategy}`);
      
      if (!options.dryRun) {
        console.log('\n📊 Monitoring deployment progress...');
        
        // Poll for completion
        const checkProgress = async () => {
          const status = core.getDeploymentStatus(deploymentId);
          console.log(`📊 Status: ${status.status} (${status.progress}%) - ${status.currentStep}`);
          
          if (status.status === 'completed') {
            console.log('✅ Deployment completed successfully!');
            return;
          } else if (status.status === 'failed') {
            console.error(`❌ Deployment failed: ${status.error}`);
            process.exit(1);
          } else if (status.status === 'rolled_back') {
            console.log('🔄 Deployment was rolled back');
            return;
          }
          
          setTimeout(checkProgress, 5000);
        };
        
        checkProgress();
      }
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }
  });

// Rollback command
program
  .command('rollback')
  .description('Rollback to a previous version')
  .option('-e, --environment <env>', 'Target environment')
  .option('-v, --version <version>', 'Target version (optional, defaults to last rollback point)')
  .option('--emergency', 'Emergency rollback to last known good state')
  .action(async (options) => {
    const core = new AxiomSystemCore();
    
    try {
      let rollbackPointId;
      
      if (options.emergency) {
        rollbackPointId = await core.emergencyRollback(options.environment);
        console.log('🚨 Emergency rollback initiated');
      } else if (options.version) {
        // Find rollback point for specific version
        const rollbackPoint = await core.createRollbackPoint(
          options.environment,
          options.version,
          `Manual rollback to version ${options.version}`
        );
        rollbackPointId = rollbackPoint.id;
      } else {
        // Use latest rollback point
        console.log('📋 Available rollback points:');
        // List rollback points (implementation would go here)
        console.log('Please specify a rollback point ID with --rollback-point');
        return;
      }
      
      const result = await core.executeRollback(rollbackPointId);
      
      console.log(`🔄 Rollback completed: ${rollbackPointId}`);
      console.log(`📦 Target version: ${result.targetVersion}`);
      
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Get deployment status')
  .option('-d, --deployment <id>', 'Deployment ID')
  .option('-e, --environment <env>', 'Environment status')
  .action(async (options) => {
    const core = new AxiomSystemCore();
    
    try {
      if (options.deployment) {
        const status = core.getDeploymentStatus(options.deployment);
        console.log(`📊 Deployment Status: ${options.deployment}`);
        console.log(`   Status: ${status.status}`);
        console.log(`   Progress: ${status.progress}%`);
        console.log(`   Current Step: ${status.currentStep}`);
        console.log(`   Start Time: ${status.startTime}`);
        if (status.endTime) {
          console.log(`   End Time: ${status.endTime}`);
          console.log(`   Duration: ${status.duration}ms`);
        }
      } else if (options.environment) {
        const envStatus = core.getComponentStatus('deployment');
        console.log(`🌍 Environment Status: ${options.environment}`);
        console.log(`   Status: ${envStatus}`);
      } else {
        const systemStatus = await core.getSystemStatus();
        console.log('🏛️ System Status:');
        console.log(`   Overall: ${systemStatus.health.overall}`);
        console.log(`   Versioning: ${systemStatus.components.versioning}`);
        console.log(`   Deployment: ${systemStatus.components.deployment}`);
        console.log(`   Migrations: ${systemStatus.components.migrations}`);
        console.log(`   Hot Updates: ${systemStatus.components.hotUpdates}`);
      }
      
    } catch (error) {
      console.error('❌ Status check failed:', error.message);
      process.exit(1);
    }
  });

// ============================================================================
// MIGRATION COMMANDS
// ============================================================================

// Migrate command
program
  .command('migrate')
  .description('Run database migrations')
  .option('-e, --environment <env>', 'Target environment', 'development')
  .option('-v, --version <version>', 'Target version', 'latest')
  .option('--dry-run', 'Dry run (no changes made)')
  .option('--force', 'Force migration (skip safety checks)')
  .action(async (options) => {
    const core = new AxiomSystemCore();
    
    try {
      const result = await core.runMigrations({
        version: options.version,
        environment: options.environment,
        dryRun: options.dryRun || false,
        force: options.force || false
      });
      
      console.log(`🗄️ Migration completed:`);
      console.log(`   Success: ${result.success ? '✅' : '❌'}`);
      console.log(`   Executed: ${result.executed.length}`);
      console.log(`   Failed: ${result.failed.length}`);
      
      if (result.failed.length > 0) {
        console.log('\n❌ Failed migrations:');
        result.failed.forEach(failure => {
          console.log(`   - ${failure.id}: ${failure.error}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
  });

// Create migration command
program
  .command('create-migration')
  .description('Create a new migration')
  .requiredOption('-v, --version <version>', 'Target version')
  .requiredOption('-t, --type <type>', 'Migration type (schema|data|index|constraint|function)')
  .option('-d, --description <text>', 'Migration description')
  .option('-s, --script <script>', 'Migration script')
  .option('-r, --rollback <script>', 'Rollback script')
  .option('--dependencies <deps>', 'Dependencies (comma-separated)')
  .action(async (options) => {
    const core = new AxiomSystemCore();
    
    try {
      const dependencies = options.dependencies ? options.dependencies.split(',').map(s => s.trim()) : [];
      
      const migrationId = await core.createMigration(
        options.version,
        options.type,
        options.script,
        options.rollback,
        dependencies
      );
      
      console.log(`📝 Migration created: ${migrationId}`);
      console.log(`   Version: ${options.version}`);
      console.log(`   Type: ${options.type}`);
      console.log(`   Description: ${options.description}`);
      console.log(`   Dependencies: ${dependencies.join(', ')}`);
      
    } catch (error) {
      console.error('❌ Migration creation failed:', error.message);
      process.exit(1);
    }
  });

// ============================================================================
// HOT UPDATE COMMANDS
// ============================================================================

// Create hot update command
program
  .command('create-hot-update')
  .description('Create a hot update')
  .requiredOption('-v, --version <version>', 'Target version')
  .requiredOption('-p, --patch <version>', 'Patch version')
  .requiredOption('-t, --type <type>', 'Update type (security|bugfix|feature|performance|compatibility)')
  .option('-prio, --priority <level>', 'Priority (low|medium|high|critical)', 'medium')
  .option('-d, --description <text>', 'Update description')
  .option('-s, --script <script>', 'Update script')
  .option('--target-versions <versions>', 'Target versions (comma-separated)')
  .option('--critical', 'Mark as critical update')
  .option('--immediate', 'Deploy immediately (skip approval)')
  .action(async (options) => {
    const core = new AxiomSystemCore();
    
    try {
      const targetVersions = options.targetVersions ? 
        options.targetVersions.split(',').map(s => s.trim()) : 
        [options.version];
      
      const hotUpdateId = await core.createHotUpdate({
        version: options.version,
        patchVersion: options.patch,
        type: options.type,
        priority: options.priority,
        description: options.description,
        script: options.script,
        targetVersions,
        critical: options.critical || options.priority === 'critical'
      });
      
      console.log(`🔥 Hot update created: ${hotUpdateId}`);
      console.log(`   Version: ${options.version}-${options.patch}`);
      console.log(`   Type: ${options.type}`);
      console.log(`   Priority: ${options.priority}`);
      console.log(`   Critical: ${options.critical || options.priority === 'critical' ? 'Yes' : 'No'}`);
      
      if (options.immediate) {
        await core.startHotUpdateRollout(hotUpdateId);
        console.log('🚀 Hot update rollout started immediately');
      } else {
        await core.submitForApproval(hotUpdateId);
        console.log('📋 Hot update submitted for approval');
      }
      
    } catch (error) {
      console.error('❌ Hot update creation failed:', error.message);
      process.exit(1);
    }
  });

// Deploy hot update command
program
  .command('deploy-hot-update')
  .description('Deploy a hot update')
  .requiredOption('-i, --id <updateId>', 'Hot update ID')
  .option('--force', 'Deploy without approval')
  .action(async (options) => {
    const core = new AxiomSystemCore();
    
    try {
      if (options.force) {
        await core.startHotUpdateRollout(options.id);
        console.log(`🚀 Hot update deployment started: ${options.id}`);
      } else {
        await core.submitForApproval(options.id);
        console.log(`📋 Hot update submitted for approval: ${options.id}`);
      }
      
    } catch (error) {
      console.error('❌ Hot update deployment failed:', error.message);
      process.exit(1);
    }
  });

// ============================================================================
// SYSTEM COMMANDS
// ============================================================================

// Health check command
program
  .command('health')
  .description('Check system health')
  .option('--detailed', 'Show detailed health information')
  .action(async (options) => {
    const core = new AxiomSystemCore();
    
    try {
      const health = await core.performHealthCheck();
      
      console.log('🏥 System Health Check:');
      console.log(`   Overall: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
      
      if (options.detailed) {
        console.log(`   Issues: ${health.issues.length}`);
        health.issues.forEach(issue => {
          console.log(`     - ${issue}`);
        });
        
        console.log('   Components:');
        Object.entries(health.components).forEach(([component, status]) => {
          console.log(`     ${component}: ${status}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      process.exit(1);
    }
  });

// Metrics command
program
  .command('metrics')
  .description('Show system metrics')
  .option('--format <type>', 'Output format (table|json)', 'table')
  .action(async (options) => {
    const core = new AxiomSystemCore();
    
    try {
      const metrics = core.getSystemMetrics();
      
      if (options.format === 'json') {
        console.log(JSON.stringify(metrics, null, 2));
      } else {
        console.log('📊 System Metrics:');
        console.log('┌─────────────────────────────────────────┐');
        console.log('│ Component        │ Total │ Success │ Failed │ Avg Time │');
        console.log('├─────────────────────────────────────────┤');
        
        console.log(`│ Deployments      │ ${metrics.deployments.total.toString().padEnd(6)} │ ${metrics.deployments.successful.toString().padEnd(6)} │ ${metrics.deployments.failed.toString().padEnd(6)} │ ${metrics.deployments.averageDuration}ms │`);
        console.log(`│ Versions         │ ${metrics.versions.total.toString().padEnd(6)} │ ${metrics.versions.major}.${metrics.versions.minor}.${metrics.versions.patch} │ - │ - │`);
        console.log(`│ Migrations       │ ${metrics.migrations.total.toString().padEnd(6)} │ ${metrics.migrations.executed.toString().padEnd(6)} │ ${metrics.migrations.failed.toString().padEnd(6)} │ ${metrics.migrations.averageDuration}ms │`);
        console.log(`│ Hot Updates     │ ${metrics.hotUpdates.total.toString().padEnd(6)} │ ${metrics.hotUpdates.successful.toString().padEnd(6)} │ ${metrics.hotUpdates.failed.toString().padEnd(6)} │ ${metrics.hotUpdates.averageRolloutTime}ms │`);
        
        console.log('└─────────────────────────────────────────┘');
        
        console.log('\n📈 Performance:');
        console.log(`   Response Time: ${metrics.performance.averageResponseTime}ms`);
        console.log(`   Error Rate: ${metrics.performance.errorRate}%`);
        console.log(`   Throughput: ${metrics.performance.throughput}/min`);
        console.log(`   Uptime: ${metrics.performance.uptime}%`);
      }
      
    } catch (error) {
      console.error('❌ Metrics retrieval failed:', error.message);
      process.exit(1);
    }
  });

// Configure command
program
  .command('configure')
  .description('Configure versioning system')
  .option('--show', 'Show current configuration')
  .option('--set <key=value>', 'Set configuration value')
  .option('--reset', 'Reset to default configuration')
  .action(async (options) => {
    const core = new AxiomSystemCore();
    
    try {
      if (options.show) {
        const config = core.getConfiguration();
        console.log('⚙️ Current Configuration:');
        console.log(JSON.stringify(config, null, 2));
      } else if (options.set) {
        const [key, value] = options.set.split('=');
        const newConfig = { [key]: value };
        core.updateConfiguration(newConfig);
        console.log(`✅ Configuration updated: ${key} = ${value}`);
      } else if (options.reset) {
        core.updateConfiguration({});
        console.log('✅ Configuration reset to defaults');
      }
      
    } catch (error) {
      console.error('❌ Configuration operation failed:', error.message);
      process.exit(1);
    }
  });

// ============================================================================
// INIT COMMAND
// ============================================================================

// Initialize command
program
  .command('init')
  .description('Initialize versioning system for current project')
  .option('--force', 'Force initialization (overwrite existing)')
  .action(async (options) => {
    console.log('🏛️ Initializing Axiom Versioning System...');
    
    try {
      // Check if already initialized
      if (!options.force && existsSync(join(process.cwd(), 'axiom-versioning.json'))) {
        console.log('❌ Versioning system already initialized. Use --force to overwrite.');
        process.exit(1);
      }
      
      // Create configuration file
      const config = {
        project: {
          name: require('../package.json').name || 'axiom-agent',
          version: require('../package.json').version || '1.0.0'
        },
        versioning: {
          autoIncrement: true,
          requireApproval: true,
          maxVersions: 50
        },
        deployment: {
          defaultStrategy: 'blue-green',
          requireApprovalForProduction: true,
          autoRollbackOnFailure: true,
          healthCheckTimeout: 30000
        },
        migrations: {
          autoRun: false,
          requireBackup: true,
          batchSize: 100
        },
        hotUpdates: {
          enabled: true,
          requireApproval: true,
          autoRollbackThreshold: 5
        },
        monitoring: {
          enabled: true,
          metricsInterval: 60000,
          alertThresholds: {
            errorRate: 5,
            responseTime: 5000,
            uptime: 99.9
          }
        },
        notifications: {
          channels: ['slack', 'email'],
          events: ['started', 'completed', 'failed', 'rolled_back'],
          templates: {
            deployment: '🚀 Deployment {{version}} to {{environment}}: {{status}}',
            rollback: '🔄 Rollback {{version}} on {{environment}}: {{status}}',
            hotUpdate: '🔥 Hot Update {{version}}-{{patch}}: {{status}}'
          }
        }
      };
      
      writeFileSync('axiom-versioning.json', JSON.stringify(config, null, 2));
      
      console.log('✅ Versioning system initialized successfully!');
      console.log('📄 Configuration saved to: axiom-versioning.json');
      console.log('\n🚀 Next steps:');
      console.log('1. Review configuration: axiom-versioning.json');
      console.log('2. Initialize database: axiom-versioning migrate');
      console.log('3. Create first version: axiom-versioning create-version');
      console.log('4. Deploy to staging: axiom-versioning deploy -v 1.0.0 -e staging');
      
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      process.exit(1);
    }
  });

// ============================================================================
// EXECUTE CLI
// ============================================================================

program.parse();

// Handle unknown commands
program.on('command:*', () => {
  console.error(`❌ Unknown command: ${program.args.join(' ')}`);
  console.log('Use --help for available commands');
  process.exit(1);
});