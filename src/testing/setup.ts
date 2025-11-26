/**
 * Vitest Test Setup
 * 
 * This file sets up the testing environment for Vitest tests.
 * It configures global test utilities, mocks, and environment variables.
 */

import { vi } from 'vitest';
import { TestEnvironmentManager } from './environment/TestEnvironmentManager';
import { ValidationEngine } from './validation/AgentValidation';
import { SecurityScanner } from './security/SecurityScanner';

// Global test environment
let testEnvironment: TestEnvironmentManager | null = null;

// Setup global test environment
beforeAll(async () => {
  console.log('🧪 Setting up Vitest test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.TEST_ENVIRONMENT = 'vitest';
  process.env.TEST_TIMEOUT = '30000';
  
  // Initialize test environment manager
  testEnvironment = new TestEnvironmentManager();
  
  // Create isolated test environment
  const env = await testEnvironment.createEnvironment({
    name: 'Vitest Test Environment',
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
  console.log('🧹 Cleaning up Vitest test environment...');
  
  if (testEnvironment) {
    await testEnvironment.cleanupAll();
    testEnvironment = null;
  }
  
  console.log('✅ Vitest test environment cleaned up');
});

// Global test utilities
global.testUtils = {
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
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(() => true),
  mkdirSync: vi.fn()
}));

vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
  resolve: vi.fn((...args) => args.join('/')),
  dirname: vi.fn((path: string) => path.split('/').slice(0, -1).join('/'))
}));

// Mock Cloudflare Workers environment
global.WorkerGlobalScope = {
  fetch: vi.fn(),
  addEventListener: vi.fn(),
  self: {
    caches: {
      open: vi.fn(() => ({
        put: vi.fn(),
        get: vi.fn(),
        delete: vi.fn()
      }))
    }
  }
};

// Mock D1 database
global.D1Database = {
  prepare: vi.fn(() => ({
    bind: vi.fn(),
    run: vi.fn(() => Promise.resolve({ success: true, meta: { rows_read: 0, rows_written: 0 } })),
    first: vi.fn(() => Promise.resolve(null)),
    all: vi.fn(() => Promise.resolve({ results: [] }))
  })),
  batch: vi.fn(() => Promise.resolve({ success: true })),
  exec: vi.fn(() => Promise.resolve({ success: true }))
};

// Mock KV storage
global.KVNamespace = {
  get: vi.fn(() => Promise.resolve(null)),
  put: vi.fn(() => Promise.resolve()),
  delete: vi.fn(() => Promise.resolve()),
  list: vi.fn(() => Promise.resolve({ keys: [] }))
};

// Console override for test output
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: vi.fn((...args) => {
    if (process.env.VERBOSE_TESTS === 'true') {
      originalConsole.log(...args);
    }
  }),
  warn: vi.fn((...args) => {
    if (process.env.VERBOSE_TESTS === 'true') {
      originalConsole.warn(...args);
    }
  }),
  error: vi.fn((...args) => {
    originalConsole.error(...args);
  })
};

// Export for use in tests
export { testEnvironment };