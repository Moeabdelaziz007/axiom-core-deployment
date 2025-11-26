module.exports = {
  // Test Environment
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/testing/setup-jest.ts'],
  
  // Test Discovery
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/__tests__/**/*.tsx',
    '**/?(*.)+(spec|test).ts',
    '**/?(*.)+(spec|test).tsx'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.next/',
    '/coverage/'
  ],
  
  // Module Resolution
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@testing/(.*)$': '<rootDir>/src/testing/$1',
    '^@infra/(.*)$': '<rootDir>/src/infra/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform Configuration
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.tsx$': 'ts-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  
  // Coverage Configuration
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/testing/**',
    '!src/**/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
    'clover'
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Performance and Parallelism
  maxWorkers: '50%',
  maxConcurrency: 4,
  testTimeout: 30000,
  
  // Reporting
  reporters: [
    'default'
  ],
  
  // Global Variables
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }
  },
  
  // Mock Configuration
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  resetModules: true,
  
  // Environment Variables
  testEnvironmentOptions: {
    NODE_ENV: 'test',
    TEST_ENVIRONMENT: 'jest'
  },
  
  // Verbose Output
  verbose: true,
  silent: false,
  
  // Test Execution
  bail: false,
  forceExit: false,
  detectOpenHandles: true,
  detectLeaks: false,
  passWithNoTests: false,
  
  // Watch Mode
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/'
  ],
  
  // Cache Configuration
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Error Handling
  errorOnDeprecated: true,
  notify: false,
  notifyMode: 'failure-change'
};