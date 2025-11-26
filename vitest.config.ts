import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test Environment
    environment: 'node',
    setupFiles: ['./src/testing/setup.ts'],
    
    // Test Discovery
    include: [
      'src/testing/**/*.test.ts',
      'src/**/__tests__/**/*.ts',
      'tests/**/*.test.ts'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'coverage/**'
    ],
    
    // Execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    },
    concurrency: 4,
    maxConcurrency: 8,
    
    // Timeouts
    testTimeout: 30000,
    hookTimeout: 10000,
    
    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/**/*.ts',
        '!src/testing/**',
        '!src/**/*.d.ts',
        '!src/**/*.test.ts'
      ],
      exclude: [
        'src/testing/**',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'node_modules/**',
        'dist/**',
        '.next/**'
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      clean: true,
      cleanOnRerun: true
    },
    
    // Reporting
    reporter: [
      'verbose',
      'json',
      'html',
      'junit'
    ],
    outputFile: {
      json: './test-results/vitest-results.json',
      html: './test-results/vitest-report.html',
      junit: './test-results/vitest-junit.xml'
    },
    
    // Watch Mode
    watch: false,
    watchExclude: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'coverage/**'
    ],
    
    // Global Settings
    globals: true,
    globals: {
      describe: 'readonly',
      it: 'readonly',
      test: 'readonly',
      expect: 'readonly',
      beforeEach: 'readonly',
      afterEach: 'readonly',
      beforeAll: 'readonly',
      afterAll: 'readonly'
    },
    
    // Environment Variables
    env: {
      NODE_ENV: 'test',
      TEST_ENVIRONMENT: 'vitest'
    },
    
    // Output
    verbose: true,
    silent: false,
    logHeapUsage: true,
    isolate: true,
    
    // File Handling
    allowOnly: process.env.CI !== 'true',
    passWithNoTests: false,
    
    // Integration
    sequence: {
      concurrent: true,
      shuffle: false,
      seed: 42
    }
  },
  
  // Resolve Configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@testing': resolve(__dirname, './src/testing'),
      '@infra': resolve(__dirname, './src/infra'),
      '@types': resolve(__dirname, './src/types')
    }
  },
  
  // Define Configuration
  define: {
    __TEST__: 'true',
    __VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});