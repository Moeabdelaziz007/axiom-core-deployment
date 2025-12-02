/**
 * Jest Configuration for Webhook Tests
 * Separate configuration for webhook-specific testing
 */

module.exports = {
  displayName: 'webhook-tests',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/test-payment-webhook.ts'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        declaration: false,
        outDir: './dist',
        rootDir: './src',
        removeComments: true,
      }
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.webhook.ts'],
  testTimeout: 30000, // 30 seconds for webhook tests
  verbose: true,
  collectCoverageFrom: [
    'src/app/api/webhooks/helius/route.ts',
    'src/lib/solana/verify.ts',
    'src/app/api/sse/payment-status/route.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage/webhook',
  maxWorkers: 1, // Run tests sequentially for webhook tests to avoid database conflicts
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};