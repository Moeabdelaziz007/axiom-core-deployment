/**
 * Test Setup for Webhook Tests
 * Configures test environment and mocks for webhook testing
 */

import { jest } from '@jest/globals';

// Mock console methods to reduce noise in tests
const originalConsole = global.console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    // Keep error and warn logs for debugging
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: originalConsole.warn,
    error: originalConsole.error,
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.HELIUS_WEBHOOK_SECRET = 'test_webhook_secret_key_for_testing';
process.env.SOLANA_RPC_URL = 'https://api.devnet.solana.com';
process.env.TURSO_DB_URL = 'file:test_webhook.db';
process.env.TURSO_DB_AUTH_TOKEN = undefined;

// Mock Next.js specific globals
global.Request = jest.fn().mockImplementation((input, init) => ({
  input,
  ...init,
  headers: new Headers(init?.headers),
  json: () => Promise.resolve(init?.body),
  text: () => Promise.resolve(init?.body),
}));

global.Response = jest.fn().mockImplementation((body, init) => ({
  body,
  ...init,
  headers: new Headers(init?.headers),
  json: () => Promise.resolve(typeof body === 'string' ? JSON.parse(body) : body),
  text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
}));

global.Headers = jest.fn().mockImplementation((init) => ({
  get: (key: string) => init?.[key.toLowerCase()],
  set: (key: string, value: string) => {
    if (init) init[key.toLowerCase()] = value;
  },
  has: (key: string) => key.toLowerCase() in (init || {}),
  delete: (key: string) => delete init?.[key.toLowerCase()],
  entries: () => Object.entries(init || {}),
  keys: () => Object.keys(init || {}),
  values: () => Object.values(init || {}),
}));

// Mock ReadableStream for SSE testing
global.ReadableStream = jest.fn().mockImplementation((init) => ({
  getReader: jest.fn(),
  cancel: jest.fn(),
  pipeTo: jest.fn(),
  pipeThrough: jest.fn(),
  tee: jest.fn(),
  locked: false,
}));

// Mock TextEncoder/TextDecoder
global.TextEncoder = jest.fn().mockImplementation(() => ({
  encode: jest.fn((input) => Buffer.from(input, 'utf8')),
}));

global.TextDecoder = jest.fn().mockImplementation(() => ({
  decode: jest.fn((input) => Buffer.from(input).toString('utf8')),
}));

// Mock AbortSignal for request cancellation
global.AbortSignal = {
  timeout: jest.fn(() => ({
    aborted: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
  abort: jest.fn(() => ({
    aborted: true,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
};

// Setup test database cleanup
beforeEach(async () => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset modules to ensure clean state
  jest.resetModules();
});

// Global test utilities
global.testUtils = {
  generateTestSignature: (payload: string, secret: string = process.env.HELIUS_WEBHOOK_SECRET!) => {
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  },
  
  createTestWebhook: (overrides: any = {}) => ({
    type: 'TRANSFER',
    signature: 'test_signature_' + Math.random().toString(36).substring(7),
    timestamp: Date.now(),
    slot: 123456789,
    nativeTransfers: [{
      amount: '1000000',
      fromUserAccount: 'GfDE1mJZtrJjCA5E2Jg4y8J8yVtR9ZcPm9YdUfKxTqL',
      toUserAccount: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
    }],
    description: 'Test payment ref:test_ref_' + Math.random().toString(36).substring(7),
    ...overrides
  }),
  
  createSPLTestWebhook: (overrides: any = {}) => ({
    type: 'TRANSFER',
    signature: 'test_spl_signature_' + Math.random().toString(36).substring(7),
    timestamp: Date.now(),
    slot: 123456790,
    tokenTransfers: [{
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      tokenAccount: '7fKXhMJ3WqN3P9wXQrjL4xY5zZ6a7b8c9d0e1f2g3h4',
      tokenAmount: '5000000',
      fromTokenAccount: '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2',
      toTokenAccount: '7fKXhMJ3WqN3P9wXQrjL4xY5zZ6a7b8c9d0e1f2g3h4',
      fromUserAccount: 'GfDE1mJZtrJjCA5E2Jg4y8J8yVtR9ZcPm9YdUfKxTqL',
      toUserAccount: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
    }],
    description: 'Test token purchase ref:token_test_' + Math.random().toString(36).substring(7),
    ...overrides
  })
};

// Export for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidSignature(): R;
      toBeValidWebhookPayload(): R;
    }
  }
}

// Custom matchers
expect.extend({
  toBeValidSignature(received: string) {
    const hexRegex = /^[a-f0-9]{64}$/i;
    const pass = hexRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid hex signature`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid 64-character hex signature`,
        pass: false,
      };
    }
  },
  
  toBeValidWebhookPayload(received: any) {
    const hasRequiredFields = received && 
      typeof received === 'object' &&
      typeof received.type === 'string' &&
      typeof received.signature === 'string' &&
      typeof received.timestamp === 'number';
    
    if (hasRequiredFields) {
      return {
        message: () => `expected payload not to be valid`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected payload to have type, signature, and timestamp fields`,
        pass: false,
      };
    }
  }
});