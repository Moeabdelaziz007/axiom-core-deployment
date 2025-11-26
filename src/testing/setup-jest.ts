/**
 * Jest Test Setup
 * 
 * This file sets up the testing environment for Jest tests.
 * It configures global test utilities, mocks, and environment variables.
 */

import { TestEnvironmentManager } from './environment/TestEnvironmentManager';
import { ValidationEngine } from './validation/AgentValidation';
import { SecurityScanner } from './security/SecurityScanner';

// Global test environment
let testEnvironment: TestEnvironmentManager | null = null;

// Setup global test environment
beforeAll(async () => {
  console.log('🧪 Setting up Jest test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.TEST_ENVIRONMENT = 'jest';
  process.env.TEST_TIMEOUT = '30000';
  
  // Initialize test environment manager
  testEnvironment = new TestEnvironmentManager();
  
  // Create isolated test environment
  const env = await testEnvironment.createEnvironment({
    name: 'Jest Test Environment',
    type: 'isolated',
    purpose: 'unit',
    config: {
      database: false,
      services: false,
      mockData: true
    }
  });
  
  console.log(`✅ Test environment ready: ${env.id}`);
});

// Cleanup after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up Jest test environment...');
  
  if (testEnvironment) {
    await testEnvironment.cleanupAll();
    testEnvironment = null;
  }
  
  console.log('✅ Jest test environment cleaned up');
});

// Global test utilities
(global as any).testUtils = {
  // Mock data generators
  generateMockAgent: (overrides = {}) => ({
    id: 'test-agent-' + Math.random().toString(36).substr(2, 9),
    name: 'Test Agent',
    type: 'axiom-brain',
    status: 'active',
    capabilities: ['chat', 'analysis', 'collaboration'],
    createdAt: new Date().toISOString(),
    ...overrides
  }),
  
  generateMockUser: (overrides = {}) => ({
    id: 'test-user-' + Math.random().toString(36).substr(2, 9),
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date().toISOString(),
    ...overrides
  }),
  
  generateMockTransaction: (overrides = {}) => ({
    id: 'test-tx-' + Math.random().toString(36).substr(2, 9),
    type: 'purchase',
    amount: 100,
    currency: 'USDC',
    status: 'completed',
    createdAt: new Date().toISOString(),
    ...overrides
  }),
  
  // Wait utilities
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Assertion helpers
  expectValidAgent: (agent: any) => {
    expect(agent).toBeDefined();
    expect(agent.id).toBeDefined();
    expect(agent.name).toBeDefined();
    expect(agent.type).toBeDefined();
    expect(agent.status).toBeDefined();
    expect(agent.capabilities).toBeInstanceOf(Array);
  },
  
  expectValidTransaction: (transaction: any) => {
    expect(transaction).toBeDefined();
    expect(transaction.id).toBeDefined();
    expect(transaction.type).toBeDefined();
    expect(transaction.amount).toBeDefined();
    expect(transaction.status).toBeDefined();
  }
};

// Global mocks
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn()
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
  dirname: jest.fn((path: string) => path.split('/').slice(0, -1).join('/'))
}));

// Mock Cloudflare Workers environment
(global as any).WorkerGlobalScope = {
  fetch: jest.fn(),
  addEventListener: jest.fn(),
  self: {
    caches: {
      open: jest.fn(() => ({
        put: jest.fn(),
        get: jest.fn(),
        delete: jest.fn()
      }))
    }
  }
};

// Mock D1 database
(global as any).D1Database = {
  prepare: jest.fn(() => ({
    bind: jest.fn(),
    run: jest.fn(() => Promise.resolve({ success: true, meta: { rows_read: 0, rows_written: 0 } })),
    first: jest.fn(() => Promise.resolve(null)),
    all: jest.fn(() => Promise.resolve({ results: [] }))
  })),
  batch: jest.fn(() => Promise.resolve({ success: true })),
  exec: jest.fn(() => Promise.resolve({ success: true }))
};

// Mock KV storage
(global as any).KVNamespace = {
  get: jest.fn(() => Promise.resolve(null)),
  put: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
  list: jest.fn(() => Promise.resolve({ keys: [] }))
};

// Console override for test output
const originalConsole = global.console;
(global as any).console = {
  ...originalConsole,
  log: jest.fn((...args) => {
    if (process.env.VERBOSE_TESTS === 'true') {
      originalConsole.log(...args);
    }
  }),
  warn: jest.fn((...args) => {
    if (process.env.VERBOSE_TESTS === 'true') {
      originalConsole.warn(...args);
    }
  }),
  error: jest.fn((...args) => {
    originalConsole.error(...args);
  })
};

// Extend Jest matchers
expect.extend({
  toBeValidAgent(received: any) {
    const pass = received && 
                typeof received === 'object' &&
                typeof received.id === 'string' &&
                typeof received.name === 'string' &&
                typeof received.type === 'string' &&
                typeof received.status === 'string' &&
                Array.isArray(received.capabilities);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid agent`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid agent with id, name, type, status, and capabilities`,
        pass: false,
      };
    }
  },
  
  toBeValidTransaction(received: any) {
    const pass = received && 
                typeof received === 'object' &&
                typeof received.id === 'string' &&
                typeof received.type === 'string' &&
                typeof received.amount === 'number' &&
                typeof received.status === 'string';
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid transaction`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid transaction with id, type, amount, and status`,
        pass: false,
      };
    }
  },
  
  toBeWithinPerformanceThreshold(received: any, threshold: number) {
    const pass = typeof received === 'number' && received <= threshold;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be within threshold ${threshold}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within performance threshold ${threshold}`,
        pass: false,
      };
    }
  }
});

// Type declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidAgent(): R;
      toBeValidTransaction(): R;
      toBeWithinPerformanceThreshold(threshold: number): R;
    }
  }
}

// Export for use in tests
export { testEnvironment };