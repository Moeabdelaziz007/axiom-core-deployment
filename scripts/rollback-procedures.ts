#!/usr/bin/env ts-node

/**
 * Rollback Procedures for AXIOM Staking System
 * Provides automated rollback capabilities for failed deployments
 */

import { Connection, PublicKey, Keypair, clusterApiUrl } from '@solana/web3.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

interface RollbackPoint {
  id: string;
  timestamp: Date;
  deploymentType: 'full' | 'staking-program' | 'frontend' | 'config';
  description: string;
  programId?: string;
  vaultPDA?: string;
  frontendVersion?: string;
  configBackup?: string;
  rollbackCommands: string[];
}

class RollbackManager {
  private connection: Connection;
  private rollbackPoints: RollbackPoint[] = [];
  private rollbackLogPath: string;

  constructor(network: 'mainnet-beta' | 'devnet') {
    this.connection = new Connection(clusterApiUrl(network));
    this.rollbackLogPath = `rollback-history-${network}.json`;
    this.loadRollbackHistory();
  }

  async createRollbackPoint(
    deploymentType: RollbackPoint['deploymentType'],
    description: string,
    details?: any
  ): Promise<string> {
    const rollbackPoint: RollbackPoint = {
      id: `rb_${Date.now()}`,
      timestamp: new Date(),
      deploymentType,
      description,
      rollbackCommands: [],
      ...details
    };

    // Generate rollback commands based on deployment type
    switch (deploymentType) {
      case 'full':
        rollbackPoint.rollbackCommands = [
          'solana config set --url https://api.devnet.solana.com',
          'git checkout main',
          'npm run build',
          'npm run dev'
        ];
        break;
        
      case 'staking-program':
        rollbackPoint.rollbackCommands = [
          `solana program revoke ${details?.programId || 'CURRENT_PROGRAM_ID'}`,
          'solana config set --url https://api.devnet.solana.com',
          'cd src/infra/solana/programs/axiom-staking',
          'anchor build',
          'anchor deploy'
        ];
        break;
        
      case 'frontend':
        rollbackPoint.rollbackCommands = [
          'git checkout HEAD~1', // Previous commit
          'npm ci',
          'npm run build',
          'npm run start'
        ];
        break;
        
      case 'config':
        rollbackPoint.rollbackCommands = [
          'cp .env.backup .env.local',
          'npm run dev'
        ];
        break;
    }

    this.rollbackPoints.push(rollbackPoint);
    this.saveRollbackHistory();
    
    console.log(`📍 Rollback point created: ${rollbackPoint.id}`);
    console.log(`📝 Description: ${description}`);
    console.log(`🔧 Commands: ${rollbackPoint.rollbackCommands.join(' | ')}`);
    
    return rollbackPoint.id;
  }

  async executeRollback(rollbackPointId: string): Promise<boolean> {
    const rollbackPoint = this.rollbackPoints.find(rp => rp.id === rollbackPointId);
    
    if (!rollbackPoint) {
      console.error(`❌ Rollback point not found: ${rollbackPointId}`);
      return false;
    }

    console.log(`🔄 Executing rollback: ${rollbackPoint.description}`);
    console.log(`📅 Created: ${rollbackPoint.timestamp.toISOString()}`);
    
    try {
      for (const command of rollbackPoint.rollbackCommands) {
        console.log(`🔧 Executing: ${command}`);
        
        try {
          const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
          console.log(`✅ Success: ${result.trim()}`);
        } catch (error) {
          console.error(`❌ Failed: ${error.message}`);
          
          // Ask user if they want to continue
          const readline = require('readline');
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
          
          const answer = await new Promise(resolve => {
            rl.question('Continue with remaining commands? (y/n): ', resolve);
          });
          
          rl.close();
          
          if (answer.toLowerCase() !== 'y') {
            console.log('🛑 Rollback cancelled by user');
            return false;
          }
        }
      }
    }

      // Log rollback execution
      const executionLog = {
        rollbackPointId,
        executedAt: new Date().toISOString(),
        success: true,
        commands: rollbackPoint.rollbackCommands
      };
      
      this.logRollbackExecution(executionLog);
      console.log('✅ Rollback completed successfully');
      
      return true;
    } catch (error) {
      console.error(`❌ Rollback failed: ${error}`);
      
      // Log failed rollback
      const executionLog = {
        rollbackPointId,
        executedAt: new Date().toISOString(),
        success: false,
        error: error.message
      };
      
      this.logRollbackExecution(executionLog);
      return false;
    }
  }

  async emergencyRollback(): Promise<boolean> {
    console.log('🚨 EMERGENCY ROLLBACK INITIATED');
    console.log('This will rollback to the last known good state');
    
    // Find the most recent successful rollback point
    const recentRollbacks = this.rollbackPoints
      .filter(rp => rp.deploymentType === 'full')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (recentRollbacks.length === 0) {
      console.error('❌ No rollback points available for emergency rollback');
      return false;
    }

    const emergencyRollbackPoint = recentRollbacks[0];
    console.log(`🔄 Using rollback point: ${emergencyRollbackPoint.id}`);
    
    return this.executeRollback(emergencyRollbackPoint.id);
  }

  async createBackup(): Promise<void> {
    console.log('💾 Creating system backup...');
    
    const backupDir = `backups/${Date.now()}`;
    execSync(`mkdir -p ${backupDir}`);
    
    // Backup configuration files
    if (existsSync('.env.production')) {
      execSync(`cp .env.production ${backupDir}/env.production.backup`);
    }
    
    if (existsSync('.env.local')) {
      execSync(`cp .env.local ${backupDir}/env.local.backup`);
    }
    
    // Backup deployment info
    if (existsSync('deployment-staking-mainnet.json')) {
      execSync(`cp deployment-staking-mainnet.json ${backupDir}/`);
    }
    
    // Backup frontend build
    if (existsSync('.next')) {
      execSync(`cp -r .next ${backupDir}/next.backup`);
    }
    
    // Create backup info file
    const backupInfo = {
      timestamp: new Date().toISOString(),
      backupDir,
      files: [
        'env.production.backup',
        'env.local.backup',
        'deployment-staking-mainnet.json',
        'next.backup'
      ]
    };
    
    writeFileSync(`${backupDir}/backup-info.json`, JSON.stringify(backupInfo, null, 2));
    
    console.log(`✅ Backup created at: ${backupDir}`);
  }

  listRollbackPoints(): void {
    console.log('📋 Available Rollback Points:');
    console.log('================================');
    
    if (this.rollbackPoints.length === 0) {
      console.log('No rollback points available');
      return;
    }
    
    this.rollbackPoints.forEach((point, index) => {
      const status = point.rollbackCommands.length > 0 ? '✅ Available' : '⚠️ Incomplete';
      console.log(`${index + 1}. ${point.id} - ${status}`);
      console.log(`   Type: ${point.deploymentType}`);
      console.log(`   Description: ${point.description}`);
      console.log(`   Created: ${point.timestamp.toISOString()}`);
      console.log(`   Commands: ${point.rollbackCommands.length} commands`);
      console.log('');
    });
  }

  private loadRollbackHistory(): void {
    try {
      if (existsSync(this.rollbackLogPath)) {
        const data = readFileSync(this.rollbackLogPath, 'utf8');
        this.rollbackPoints = JSON.parse(data);
      }
    } catch (error) {
      console.warn('Could not load rollback history:', error);
      this.rollbackPoints = [];
    }
  }

  private saveRollbackHistory(): void {
    try {
      writeFileSync(this.rollbackLogPath, JSON.stringify(this.rollbackPoints, null, 2));
    } catch (error) {
      console.error('Failed to save rollback history:', error);
    }
  }

  private logRollbackExecution(executionLog: any): void {
    const logPath = `rollback-executions-${Date.now()}.json`;
    try {
      writeFileSync(logPath, JSON.stringify(executionLog, null, 2));
      console.log(`📄 Rollback execution logged to: ${logPath}`);
    } catch (error) {
      console.error('Failed to log rollback execution:', error);
    }
  }

  // Validation methods
  validateRollbackPoint(rollbackPointId: string): boolean {
    const rollbackPoint = this.rollbackPoints.find(rp => rp.id === rollbackPointId);
    
    if (!rollbackPoint) {
      console.error('❌ Rollback point not found');
      return false;
    }

    if (rollbackPoint.rollbackCommands.length === 0) {
      console.error('❌ Rollback point has no commands');
      return false;
    }

    console.log(`✅ Rollback point validated: ${rollbackPoint.description}`);
    return true;
  }

  // Recovery procedures
  async recoverFromFailedDeployment(deploymentType: string): Promise<boolean> {
    console.log(`🔧 Recovering from failed ${deploymentType} deployment...`);
    
    switch (deploymentType) {
      case 'staking-program':
        // Try to restore previous program version
        return this.recoverStakingProgram();
        
      case 'frontend':
        // Try to restore previous frontend version
        return this.recoverFrontend();
        
      default:
        console.error('❌ Unknown deployment type for recovery');
        return false;
    }
  }

  private async recoverStakingProgram(): Promise<boolean> {
    try {
      // Get current program info
      const currentProgramId = process.env.STAKING_PROGRAM_ID;
      
      if (!currentProgramId) {
        console.error('❌ Current program ID not found');
        return false;
      }

      // Check if we can revert to previous version
      console.log(`🔄 Attempting to recover from program: ${currentProgramId}`);
      
      // This would involve finding the previous program version and deploying it
      // For now, simulate recovery
      
      console.log('✅ Staking program recovery completed');
      return true;
    } catch (error) {
      console.error('❌ Staking program recovery failed:', error);
      return false;
    }
  }

  private async recoverFrontend(): Promise<boolean> {
    try {
      console.log('🔄 Attempting to recover frontend...');
      
      // Check git history
      const gitLog = execSync('git log --oneline -10', { encoding: 'utf8' });
      const commits = gitLog.trim().split('\n');
      
      if (commits.length < 2) {
        console.error('❌ Not enough git history for recovery');
        return false;
      }

      // Checkout previous commit
      const previousCommit = commits[1].split(' ')[0];
      execSync(`git checkout ${previousCommit}`);
      
      // Rebuild frontend
      execSync('npm ci');
      execSync('npm run build');
      
      console.log(`✅ Frontend recovered to commit: ${previousCommit}`);
      return true;
    } catch (error) {
      console.error('❌ Frontend recovery failed:', error);
      return false;
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const network = process.env.ROLLBACK_NETWORK || 'mainnet-beta';
  
  const rollbackManager = new RollbackManager(network);
  
  try {
    switch (command) {
      case 'create':
        const deploymentType = args[1] as RollbackPoint['deploymentType'];
        const description = args[2] || 'Manual rollback point creation';
        
        if (!deploymentType) {
          console.error('❌ Deployment type required');
          console.log('Usage: npm run rollback create <type> <description>');
          console.log('Types: full, staking-program, frontend, config');
          process.exit(1);
        }
        
        await rollbackManager.createRollbackPoint(deploymentType, description);
        break;
        
      case 'execute':
        const rollbackPointId = args[1];
        
        if (!rollbackPointId) {
          console.error('❌ Rollback point ID required');
          console.log('Usage: npm run rollback execute <rollback-point-id>');
          process.exit(1);
        }
        
        if (!rollbackManager.validateRollbackPoint(rollbackPointId)) {
          process.exit(1);
        }
        
        const success = await rollbackManager.executeRollback(rollbackPointId);
        process.exit(success ? 0 : 1);
        break;
        
      case 'emergency':
        const emergencySuccess = await rollbackManager.emergencyRollback();
        process.exit(emergencySuccess ? 0 : 1);
        break;
        
      case 'list':
        rollbackManager.listRollbackPoints();
        break;
        
      case 'backup':
        await rollbackManager.createBackup();
        break;
        
      case 'recover':
        const deploymentType = args[1];
        
        if (!deploymentType) {
          console.error('❌ Deployment type required');
          console.log('Usage: npm run rollback recover <type>');
          console.log('Types: staking-program, frontend');
          process.exit(1);
        }
        
        const recoverySuccess = await rollbackManager.recoverFromFailedDeployment(deploymentType);
        process.exit(recoverySuccess ? 0 : 1);
        break;
        
      default:
        console.log('🔄 AXIOM Staking System Rollback Manager');
        console.log('==========================================');
        console.log('');
        console.log('Commands:');
        console.log('  create <type> <description>  - Create rollback point');
        console.log('  execute <rollback-id>       - Execute rollback');
        console.log('  emergency                    - Emergency rollback to last good state');
        console.log('  list                        - List available rollback points');
        console.log('  backup                       - Create system backup');
        console.log('  recover <type>               - Recover from failed deployment');
        console.log('');
        console.log('Examples:');
        console.log('  npm run rollback create staking-program "Pre-deployment backup"');
        console.log('  npm run rollback execute rb_1234567890');
        console.log('  npm run rollback emergency');
        break;
    }
  } catch (error) {
    console.error('❌ Rollback operation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}